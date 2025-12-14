import { Router } from 'express';
import { authenticate, requireGuildAccess } from '../middleware/auth';
import { musicRateLimiter } from '../middleware/rateLimiter';
import { requireCommandPermission, requireCooldown, antiSpam, validateTrackQuery } from '../utils/security';
const router = Router();
// All routes require authentication and rate limiting
router.use(authenticate);
router.use(musicRateLimiter);
// Get current player state
router.get('/:guildId/player', requireGuildAccess, async (req, res) => {
    try {
        const { guildId } = req.params;
        const playerState = await global.queueManager.getPlayerState(guildId);
        res.json({
            success: true,
            data: playerState || {
                guildId,
                isPlaying: false,
                isPaused: false,
                position: 0,
                volume: 100,
                loop: 'off',
                filters: {},
                autoplay: true,
                queue: [],
                currentTrack: null
            }
        });
    }
    catch (error) {
        console.error('Get player state error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get player state'
        });
    }
});
// Play track
router.post('/:guildId/play', requireGuildAccess, requireCommandPermission('play'), requireCooldown('play'), antiSpam, validateTrackQuery, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }
        // Add to queue and start playing
        const tracks = await global.queueManager.searchAndAdd(guildId, query, req.user.discordId, (q) => global.playerManager.search(q));
        if (tracks.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No tracks found'
            });
        }
        // Start playing if not already playing
        const queueInfo = await global.queueManager.getQueueInfo(guildId);
        if (!queueInfo?.isPlaying) {
            await global.playerManager.playTrack(guildId, tracks[0]);
            await global.queueManager.saveQueue(guildId, { isPlaying: true });
        }
        res.json({
            success: true,
            data: {
                tracks,
                message: `Added ${tracks.length} track(s) to queue`
            }
        });
    }
    catch (error) {
        console.error('Play track error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to play track'
        });
    }
});
// Control playback
router.post('/:guildId/control/:action', requireGuildAccess, requireCommandPermission('skip'), // Use skip permission for all controls
requireCooldown('control'), async (req, res) => {
    try {
        const { guildId, action } = req.params;
        switch (action) {
            case 'pause':
                await global.playerManager.pause(guildId);
                break;
            case 'resume':
                await global.playerManager.resume(guildId);
                break;
            case 'skip':
                await global.playerManager.skip(guildId);
                break;
            case 'stop':
                await global.playerManager.stop(guildId);
                await global.queueManager.clearQueue(guildId);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid action'
                });
        }
        res.json({
            success: true,
            message: `${action.charAt(0).toUpperCase() + action.slice(1)} successful`
        });
    }
    catch (error) {
        console.error(`Control ${req.params.action} error:`, error);
        res.status(500).json({
            success: false,
            error: `Failed to ${req.params.action}`
        });
    }
});
// Set volume
router.post('/:guildId/volume', requireGuildAccess, requireCommandPermission('volume'), requireCooldown('volume', 1000), async (req, res) => {
    try {
        const { guildId } = req.params;
        const { volume } = req.body;
        if (typeof volume !== 'number' || volume < 0 || volume > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Volume must be a number between 0 and 1000'
            });
        }
        await global.playerManager.setVolume(guildId, volume);
        res.json({
            success: true,
            message: `Volume set to ${volume}%`
        });
    }
    catch (error) {
        console.error('Set volume error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to set volume'
        });
    }
});
// Seek to position
router.post('/:guildId/seek', requireGuildAccess, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { position } = req.body;
        if (typeof position !== 'number' || position < 0) {
            return res.status(400).json({
                success: false,
                error: 'Position must be a positive number'
            });
        }
        await global.playerManager.seek(guildId, position * 1000); // Convert to milliseconds
        res.json({
            success: true,
            message: `Seeked to ${position}s`
        });
    }
    catch (error) {
        console.error('Seek error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to seek'
        });
    }
});
// Apply filters
router.post('/:guildId/filters', requireGuildAccess, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { filters } = req.body;
        if (!filters || typeof filters !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Filters must be an object'
            });
        }
        await global.playerManager.setFilters(guildId, filters);
        res.json({
            success: true,
            message: 'Filters applied successfully'
        });
    }
    catch (error) {
        console.error('Apply filters error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to apply filters'
        });
    }
});
// Apply filter preset
router.post('/:guildId/filters/:preset', requireGuildAccess, async (req, res) => {
    try {
        const { guildId, preset } = req.params;
        await global.playerManager.applyFilterPreset(guildId, preset);
        res.json({
            success: true,
            message: `${preset} filter applied`
        });
    }
    catch (error) {
        console.error('Apply filter preset error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to apply filter preset'
        });
    }
});
// Get queue
router.get('/:guildId/queue', requireGuildAccess, async (req, res) => {
    try {
        const { guildId } = req.params;
        const queueInfo = await global.queueManager.getQueueInfo(guildId);
        res.json({
            success: true,
            data: queueInfo || {
                tracks: [],
                currentIndex: 0,
                isPlaying: false,
                isPaused: false,
                isLooping: 'off',
                volume: 100,
                filters: {},
                autoplay: true
            }
        });
    }
    catch (error) {
        console.error('Get queue error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get queue'
        });
    }
});
// Add to queue
router.post('/:guildId/queue', requireGuildAccess, requireCommandPermission('play'), requireCooldown('queue'), antiSpam, validateTrackQuery, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { query, position } = req.body;
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }
        const tracks = await global.queueManager.searchAndAdd(guildId, query, req.user.discordId, (q) => global.playerManager.search(q));
        res.json({
            success: true,
            data: {
                tracks,
                message: `Added ${tracks.length} track(s) to queue`
            }
        });
    }
    catch (error) {
        console.error('Add to queue error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add to queue'
        });
    }
});
// Remove from queue
router.delete('/:guildId/queue/:index', requireGuildAccess, async (req, res) => {
    try {
        const { guildId, index } = req.params;
        const indexNum = parseInt(index);
        if (isNaN(indexNum)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid index'
            });
        }
        const removedTrack = await global.queueManager.removeTrack(guildId, indexNum);
        if (!removedTrack) {
            return res.status(404).json({
                success: false,
                error: 'Track not found at that position'
            });
        }
        res.json({
            success: true,
            data: removedTrack,
            message: 'Track removed from queue'
        });
    }
    catch (error) {
        console.error('Remove from queue error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove from queue'
        });
    }
});
// Shuffle queue
router.post('/:guildId/queue/shuffle', requireGuildAccess, async (req, res) => {
    try {
        const { guildId } = req.params;
        await global.queueManager.shuffleQueue(guildId);
        res.json({
            success: true,
            message: 'Queue shuffled successfully'
        });
    }
    catch (error) {
        console.error('Shuffle queue error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to shuffle queue'
        });
    }
});
// Clear queue
router.delete('/:guildId/queue', requireGuildAccess, async (req, res) => {
    try {
        const { guildId } = req.params;
        await global.queueManager.clearQueue(guildId);
        res.json({
            success: true,
            message: 'Queue cleared successfully'
        });
    }
    catch (error) {
        console.error('Clear queue error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear queue'
        });
    }
});
// Set loop mode
router.post('/:guildId/loop', requireGuildAccess, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { mode } = req.body;
        if (!['off', 'track', 'queue'].includes(mode)) {
            return res.status(400).json({
                success: false,
                error: 'Mode must be off, track, or queue'
            });
        }
        await global.queueManager.setLoopMode(guildId, mode);
        res.json({
            success: true,
            message: `Loop mode set to ${mode}`
        });
    }
    catch (error) {
        console.error('Set loop mode error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to set loop mode'
        });
    }
});
// Set autoplay
router.post('/:guildId/autoplay', requireGuildAccess, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { enabled } = req.body;
        if (typeof enabled !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'Enabled must be a boolean'
            });
        }
        await global.queueManager.setAutoplay(guildId, enabled);
        res.json({
            success: true,
            message: `Autoplay ${enabled ? 'enabled' : 'disabled'}`
        });
    }
    catch (error) {
        console.error('Set autoplay error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to set autoplay'
        });
    }
});
export { router as musicRouter };
//# sourceMappingURL=music.js.map