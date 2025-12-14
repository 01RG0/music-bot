import { EventEmitter } from 'events';
import { MoonlinkManager } from 'moonlink.js';
import { io } from 'socket.io-client';
import { FILTER_PRESETS } from '@types/index';
import { QueueModel, GuildSettingsModel, StatsModel } from '@utils/schemas';
export class PlayerManager extends EventEmitter {
    lavalinkConfig;
    moonlink;
    socketClient;
    players = new Map();
    reconnectAttempts = new Map();
    constructor(lavalinkConfig, socketUrl) {
        super();
        this.lavalinkConfig = lavalinkConfig;
        // Initialize Moonlink
        this.moonlink = new MoonlinkManager([{
                host: lavalinkConfig.host,
                port: lavalinkConfig.port,
                password: lavalinkConfig.password,
                secure: lavalinkConfig.secure
            }], {
            shards: 1,
            send: (id, payload) => {
                // This will be overridden by the bot
                this.emit('sendPacket', id, payload);
            }
        });
        // Connect to WebSocket server if provided
        if (socketUrl) {
            this.connectSocket(socketUrl);
        }
        this.setupMoonlinkEvents();
    }
    connectSocket(url) {
        this.socketClient = io(url, {
            transports: ['websocket'],
            auth: {
                token: process.env.WS_AUTH_TOKEN
            }
        });
        this.socketClient.on('connect', () => {
            console.log('🔗 Connected to WebSocket server');
        });
        this.socketClient.on('disconnect', () => {
            console.log('🔌 Disconnected from WebSocket server');
        });
    }
    setupMoonlinkEvents() {
        // Player events
        this.moonlink.on('trackStart', async (player, track) => {
            const guildId = player.guildId;
            await this.updateQueueActivity(guildId);
            // Emit to WebSocket
            this.emitToSocket('track:start', { guildId, track: this.convertTrack(track) });
            // Update stats
            await this.updateStats(guildId, track);
        });
        this.moonlink.on('trackEnd', async (player, track, reason) => {
            const guildId = player.guildId;
            this.emitToSocket('track:end', {
                guildId,
                track: this.convertTrack(track),
                reason
            });
            // Handle queue progression
            if (reason === 'finished') {
                await this.handleTrackEnd(guildId);
            }
        });
        this.moonlink.on('trackStuck', (player, track) => {
            const guildId = player.guildId;
            this.emitToSocket('track:stuck', { guildId, track: this.convertTrack(track) });
        });
        this.moonlink.on('trackError', (player, track, error) => {
            const guildId = player.guildId;
            console.error(`Track error in guild ${guildId}:`, error);
            this.emitToSocket('track:error', {
                guildId,
                track: this.convertTrack(track),
                error: error.message
            });
        });
        // Player state events
        this.moonlink.on('playerUpdate', (player) => {
            const guildId = player.guildId;
            // Position updates are frequent, only emit significant changes
        });
        this.moonlink.on('playerDisconnect', async (player) => {
            const guildId = player.guildId;
            console.log(`Player disconnected in guild ${guildId}`);
            // Attempt reconnection
            await this.handleReconnection(guildId);
        });
    }
    async handleTrackEnd(guildId) {
        const queue = await QueueModel.findOne({ guildId });
        if (!queue)
            return;
        const settings = await GuildSettingsModel.findOne({ guildId });
        // Handle looping
        if (queue.isLooping === 'track') {
            // Track looping is handled by Moonlink
            return;
        }
        if (queue.isLooping === 'queue') {
            // Move current track to end
            const currentTrack = queue.tracks[queue.currentIndex];
            if (currentTrack) {
                queue.tracks.push(currentTrack);
            }
        }
        // Move to next track
        queue.currentIndex++;
        // Check if we reached the end
        if (queue.currentIndex >= queue.tracks.length) {
            if (queue.autoplay && settings?.autoplay) {
                // Implement autoplay logic here
                await this.handleAutoplay(guildId);
            }
            else {
                // Stop playback
                await this.stop(guildId);
                return;
            }
        }
        // Play next track
        const nextTrack = queue.tracks[queue.currentIndex];
        if (nextTrack) {
            await this.playTrack(guildId, nextTrack);
        }
        await queue.save();
    }
    async handleAutoplay(guildId) {
        // This would implement autoplay based on current track
        // For now, just stop
        await this.stop(guildId);
    }
    async handleReconnection(guildId) {
        const attempts = this.reconnectAttempts.get(guildId) || 0;
        if (attempts < 3) {
            this.reconnectAttempts.set(guildId, attempts + 1);
            setTimeout(async () => {
                try {
                    await this.resume(guildId);
                    this.reconnectAttempts.delete(guildId);
                }
                catch (error) {
                    console.error(`Reconnection failed for guild ${guildId}:`, error);
                }
            }, 5000 * (attempts + 1)); // Exponential backoff
        }
        else {
            // Give up and destroy player
            await this.destroyPlayer(guildId);
            this.reconnectAttempts.delete(guildId);
        }
    }
    convertTrack(track) {
        return {
            track: track.track,
            info: {
                identifier: track.identifier,
                isSeekable: track.isSeekable,
                author: track.author,
                length: track.duration,
                isStream: track.isStream,
                position: track.position || 0,
                title: track.title,
                uri: track.url,
                artworkUrl: track.artworkUrl,
                isrc: track.isrc,
                sourceName: track.sourceName
            },
            requester: track.requester || 'Unknown',
            requestedAt: track.requestedAt || new Date()
        };
    }
    emitToSocket(event, data) {
        if (this.socketClient?.connected) {
            this.socketClient.emit(event, data);
        }
    }
    async updateQueueActivity(guildId) {
        await QueueModel.updateOne({ guildId }, { lastActivity: new Date() });
    }
    async updateStats(guildId, track) {
        try {
            await StatsModel.updateOne({ guildId }, {
                $inc: {
                    totalTracksPlayed: 1,
                    totalListeningTime: track.duration
                },
                $set: { updatedAt: new Date() }
            }, { upsert: true });
        }
        catch (error) {
            console.error('Failed to update stats:', error);
        }
    }
    // Public API methods
    async createPlayer(guildId, voiceChannelId, textChannelId) {
        const player = this.moonlink.createPlayer({
            guildId,
            voiceChannelId,
            textChannelId,
            autoLeave: true,
            autoPlay: false
        });
        this.players.set(guildId, player);
        // Load existing queue state
        const queue = await QueueModel.findOne({ guildId });
        if (queue) {
            // Restore player state
            if (queue.volume !== 100) {
                player.setVolume(queue.volume);
            }
            if (Object.keys(queue.filters).length > 0) {
                player.setFilters(queue.filters);
            }
            if (queue.isLooping !== 'off') {
                player.setLoop(queue.isLooping === 'track' ? 1 : 2);
            }
        }
        this.emitToSocket('voice:join', { guildId, channelId: voiceChannelId });
        return player;
    }
    async destroyPlayer(guildId) {
        const player = this.players.get(guildId);
        if (player) {
            player.destroy();
            this.players.delete(guildId);
            // Clean up queue
            await QueueModel.deleteOne({ guildId });
            this.emitToSocket('voice:leave', { guildId, channelId: player.voiceChannelId });
        }
    }
    async playTrack(guildId, track) {
        const player = this.players.get(guildId);
        if (!player) {
            throw new Error('No player found for this guild');
        }
        await player.play(track.track);
        this.emitToSocket('player:play', { guildId, track });
    }
    async pause(guildId) {
        const player = this.players.get(guildId);
        if (!player)
            return;
        await player.pause();
        await QueueModel.updateOne({ guildId }, { isPaused: true });
        this.emitToSocket('player:pause', { guildId });
    }
    async resume(guildId) {
        const player = this.players.get(guildId);
        if (!player)
            return;
        await player.resume();
        await QueueModel.updateOne({ guildId }, { isPaused: false });
        this.emitToSocket('player:resume', { guildId });
    }
    async stop(guildId) {
        const player = this.players.get(guildId);
        if (!player)
            return;
        await player.stop();
        await QueueModel.updateOne({ guildId }, {
            isPlaying: false,
            currentIndex: 0
        });
        this.emitToSocket('player:stop', { guildId });
    }
    async skip(guildId) {
        const player = this.players.get(guildId);
        if (!player)
            return;
        const queue = await QueueModel.findOne({ guildId });
        if (!queue)
            return;
        const skippedTrack = queue.tracks[queue.currentIndex];
        await player.stop();
        this.emitToSocket('player:skip', { guildId, skippedTrack });
    }
    async seek(guildId, position) {
        const player = this.players.get(guildId);
        if (!player)
            return;
        await player.seek(position);
        this.emitToSocket('player:seek', { guildId, position });
    }
    async setVolume(guildId, volume) {
        const player = this.players.get(guildId);
        if (!player)
            return;
        await player.setVolume(volume);
        await QueueModel.updateOne({ guildId }, { volume });
        this.emitToSocket('player:volume', { guildId, volume });
    }
    async setFilters(guildId, filters) {
        const player = this.players.get(guildId);
        if (!player)
            return;
        await player.setFilters(filters);
        await QueueModel.updateOne({ guildId }, { filters });
        this.emitToSocket('player:filters', { guildId, filters });
    }
    async applyFilterPreset(guildId, preset) {
        const filters = FILTER_PRESETS[preset];
        await this.setFilters(guildId, filters);
    }
    getPlayerState(guildId) {
        const player = this.players.get(guildId);
        if (!player)
            return null;
        // Get queue data
        // This would need to be implemented to get current queue state
        return {
            guildId,
            isPlaying: player.playing,
            isPaused: player.paused,
            position: player.position,
            volume: player.volume,
            loop: 'off', // This needs to be tracked separately
            filters: player.filters || {},
            autoplay: true, // This needs to be tracked separately
            queue: [], // This needs to be populated
        };
    }
    // Moonlink packet handler - to be called by the bot
    handleVoiceUpdate(guildId, sessionId, event) {
        this.moonlink.updateVoiceStatus(guildId, sessionId, event);
    }
    // Search method for tracks
    async search(query) {
        const result = await this.moonlink.search(query);
        return result.tracks || [];
    }
}
//# sourceMappingURL=PlayerManager.js.map