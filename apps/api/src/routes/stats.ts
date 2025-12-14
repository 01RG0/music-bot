import { Router } from 'express';
import { authenticate, requireGuildAccess } from '../middleware/auth';
import { StatsModel, UserModel } from '@utils/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get guild stats
router.get('/:guildId', requireGuildAccess, async (req, res) => {
  try {
    const { guildId } = req.params;

    const stats = await StatsModel.findOne({ guildId });

    if (!stats) {
      return res.json({
        success: true,
        data: {
          totalTracksPlayed: 0,
          totalListeningTime: 0,
          mostPlayedTracks: [],
          activeUsers: [],
          peakConcurrentUsers: 0,
          averageSessionLength: 0,
          commandsUsed: {}
        }
      });
    }

    res.json({
      success: true,
      data: {
        totalTracksPlayed: stats.totalTracksPlayed,
        totalListeningTime: stats.totalListeningTime,
        mostPlayedTracks: stats.mostPlayedTracks,
        activeUsers: stats.activeUsers,
        peakConcurrentUsers: stats.peakConcurrentUsers,
        averageSessionLength: stats.averageSessionLength,
        commandsUsed: stats.commandsUsed
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// Get global bot stats (admin only)
router.get('/global/overview', async (req, res) => {
  try {
    // Aggregate stats across all guilds
    const globalStats = await StatsModel.aggregate([
      {
        $group: {
          _id: null,
          totalTracksPlayed: { $sum: '$totalTracksPlayed' },
          totalListeningTime: { $sum: '$totalListeningTime' },
          totalGuilds: { $sum: 1 },
          peakConcurrentUsers: { $max: '$peakConcurrentUsers' }
        }
      }
    ]);

    const userCount = await UserModel.countDocuments();

    res.json({
      success: true,
      data: {
        totalTracksPlayed: globalStats[0]?.totalTracksPlayed || 0,
        totalListeningTime: globalStats[0]?.totalListeningTime || 0,
        totalGuilds: globalStats[0]?.totalGuilds || 0,
        totalUsers: userCount,
        peakConcurrentUsers: globalStats[0]?.peakConcurrentUsers || 0
      }
    });

  } catch (error) {
    console.error('Get global stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch global stats'
    });
  }
});

// Get most played tracks globally
router.get('/global/tracks', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const topTracks = await StatsModel.aggregate([
      { $unwind: '$mostPlayedTracks' },
      {
        $group: {
          _id: '$mostPlayedTracks.track.info.identifier',
          track: { $first: '$mostPlayedTracks.track' },
          totalPlayCount: { $sum: '$mostPlayedTracks.playCount' }
        }
      },
      { $sort: { totalPlayCount: -1 } },
      { $limit: limit }
    ]);

    res.json({
      success: true,
      data: topTracks.map(item => ({
        track: item.track,
        playCount: item.totalPlayCount
      }))
    });

  } catch (error) {
    console.error('Get top tracks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top tracks'
    });
  }
});

// Get most active users globally
router.get('/global/users', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const activeUsers = await StatsModel.aggregate([
      { $unwind: '$activeUsers' },
      {
        $group: {
          _id: '$activeUsers.userId',
          totalTracksPlayed: { $sum: '$activeUsers.tracksPlayed' },
          totalTimeListened: { $sum: '$activeUsers.timeListened' }
        }
      },
      { $sort: { totalTracksPlayed: -1 } },
      { $limit: limit }
    ]);

    // Get user details
    const userIds = activeUsers.map(u => u._id);
    const users = await UserModel.find({ discordId: { $in: userIds } })
      .select('discordId username discriminator avatar');

    const userMap = new Map(users.map(u => [u.discordId, u]));

    const result = activeUsers.map(user => ({
      user: userMap.get(user._id),
      tracksPlayed: user.totalTracksPlayed,
      timeListened: user.totalTimeListened
    }));

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get active users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active users'
    });
  }
});

// Get command usage stats
router.get('/global/commands', async (req, res) => {
  try {
    const commandStats = await StatsModel.aggregate([
      {
        $group: {
          _id: null,
          commandsUsed: {
            $mergeObjects: '$commandsUsed'
          }
        }
      }
    ]);

    const commands = commandStats[0]?.commandsUsed || {};

    // Sort by usage
    const sortedCommands = Object.entries(commands)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 20);

    res.json({
      success: true,
      data: Object.fromEntries(sortedCommands)
    });

  } catch (error) {
    console.error('Get command stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch command stats'
    });
  }
});

export { router as statsRouter };
