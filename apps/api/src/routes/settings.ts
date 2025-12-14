import { Router } from 'express';
import { authenticate, requireGuildAccess } from '../middleware/auth';
import { GuildSettingsModel } from '@utils/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get guild settings
router.get('/:guildId', requireGuildAccess, async (req, res) => {
  try {
    const { guildId } = req.params;

    const settings = await GuildSettingsModel.findOne({ guildId });

    if (!settings) {
      // Return default settings
      return res.json({
        success: true,
        data: {
          prefix: '!',
          defaultVolume: 100,
          maxQueueLength: 1000,
          maxSongDuration: 0,
          allowDuplicates: true,
          autoplay: true,
          announceSongs: true,
          permissions: {
            play: [],
            skip: [],
            stop: [],
            clear: [],
            shuffle: [],
            volume: [],
            filters: []
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        prefix: settings.prefix,
        djRoleId: settings.djRoleId,
        defaultVolume: settings.defaultVolume,
        maxQueueLength: settings.maxQueueLength,
        maxSongDuration: settings.maxSongDuration,
        allowDuplicates: settings.allowDuplicates,
        autoplay: settings.autoplay,
        announceSongs: settings.announceSongs,
        permissions: settings.permissions
      }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings'
    });
  }
});

// Update guild settings
router.put('/:guildId', requireGuildAccess, async (req, res) => {
  try {
    const { guildId } = req.params;
    const updates = req.body;

    // Validate input
    const allowedFields = [
      'prefix', 'djRoleId', 'defaultVolume', 'maxQueueLength',
      'maxSongDuration', 'allowDuplicates', 'autoplay', 'announceSongs',
      'permissions'
    ];

    const filteredUpdates = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    // Add updatedAt
    filteredUpdates['updatedAt'] = new Date();

    const settings = await GuildSettingsModel.findOneAndUpdate(
      { guildId },
      filteredUpdates,
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

// Reset guild settings to defaults
router.post('/:guildId/reset', requireGuildAccess, async (req, res) => {
  try {
    const { guildId } = req.params;

    await GuildSettingsModel.findOneAndUpdate(
      { guildId },
      {
        prefix: '!',
        djRoleId: null,
        defaultVolume: 100,
        maxQueueLength: 1000,
        maxSongDuration: 0,
        allowDuplicates: true,
        autoplay: true,
        announceSongs: true,
        permissions: {
          play: [],
          skip: [],
          stop: [],
          clear: [],
          shuffle: [],
          volume: [],
          filters: []
        },
        updatedAt: new Date()
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Settings reset to defaults'
    });

  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset settings'
    });
  }
});

// Get user settings (global preferences)
router.get('/user/preferences', async (req, res) => {
  try {
    const user = req.dbUser;

    res.json({
      success: true,
      data: {
        favoriteSources: user.favoriteSources || [],
        defaultVolume: user.defaultVolume || 100,
        theme: user.theme || 'dark',
        notifications: user.notifications || true
      }
    });

  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user preferences'
    });
  }
});

// Update user settings
router.put('/user/preferences', async (req, res) => {
  try {
    const updates = req.body;
    const user = req.dbUser;

    const allowedFields = ['favoriteSources', 'defaultVolume', 'theme', 'notifications'];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    }

    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

export { router as settingsRouter };
