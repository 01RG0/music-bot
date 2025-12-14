import { Router } from 'express';
import { authenticate, requireGuildAccess } from '../middleware/auth';
import { GuildSettingsModel, StatsModel } from '@utils/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user's guilds
router.get('/', async (req, res) => {
  try {
    const user = req.dbUser;

    // Return guilds with basic info
    // In a real implementation, you'd fetch full guild data from Discord API
    const guilds = user.guilds.map((guildId: string) => ({
      id: guildId,
      name: 'Guild Name', // Would be fetched from Discord
      icon: null, // Would be fetched from Discord
      hasBot: true // Would check if bot is in guild
    }));

    res.json({
      success: true,
      data: guilds
    });

  } catch (error) {
    console.error('Get guilds error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch guilds'
    });
  }
});

// Get guild info
router.get('/:guildId', requireGuildAccess, async (req, res) => {
  try {
    const { guildId } = req.params;

    // Get guild settings
    const settings = await GuildSettingsModel.findOne({ guildId });

    // Get basic stats
    const stats = await StatsModel.findOne({ guildId });

    res.json({
      success: true,
      data: {
        id: guildId,
        settings: settings || {
          prefix: '!',
          defaultVolume: 100,
          autoplay: true
        },
        stats: stats || {
          totalTracksPlayed: 0,
          totalListeningTime: 0,
          activeUsers: []
        }
      }
    });

  } catch (error) {
    console.error('Get guild error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch guild info'
    });
  }
});

// Check guild permissions
router.get('/:guildId/permissions', requireGuildAccess, async (req, res) => {
  try {
    const { guildId } = req.params;
    const user = req.user!;

    // In a real implementation, you'd check Discord API for permissions
    // For now, assume user has access if they're in the guild list

    res.json({
      success: true,
      data: {
        canManage: true, // User can access this guild
        canPlay: true,
        canSkip: true,
        canStop: true,
        canVolume: true,
        canFilters: true,
        isDJ: false,
        isAdmin: false
      }
    });

  } catch (error) {
    console.error('Check permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check permissions'
    });
  }
});

export { router as guildsRouter };
