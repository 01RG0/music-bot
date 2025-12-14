import { Router } from 'express';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import { discordOAuth, getDiscordUser, getUserGuilds, refreshAccessToken } from '../utils/discord';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { UserModel } from '@utils/schemas';
import { botConfig } from '@music/config';

const router = Router();

// Apply rate limiting to auth routes
router.use(authRateLimiter);

// Discord OAuth2 login URL
router.get('/discord', (req, res) => {
  const scopes = ['identify', 'guilds'];
  const loginUrl = discordOAuth.generateAuthUrl({
    scope: scopes,
    responseType: 'code'
  });

  res.json({
    success: true,
    loginUrl
  });
});

// Discord OAuth2 callback
router.post('/discord/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code required'
      });
    }

    // Exchange code for tokens
    const tokens = await discordOAuth.tokenRequest({
      code,
      scope: ['identify', 'guilds'],
      grantType: 'authorization_code'
    });

    // Get user info
    const discordUser = await getDiscordUser(tokens.access_token);
    const guilds = await getUserGuilds(tokens.access_token);

    // Filter guilds where user has manage guild permission or is owner
    const manageableGuilds = guilds.filter(guild => {
      const permissions = BigInt(guild.permissions);
      const hasManageGuild = (permissions & BigInt(0x20)) !== BigInt(0); // MANAGE_GUILD permission
      return guild.owner || hasManageGuild;
    });

    // Upsert user in database
    const user = await UserModel.findOneAndUpdate(
      { discordId: discordUser.id },
      {
        discordId: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar,
        guilds: manageableGuilds.map(g => g.id),
        lastActive: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Generate JWT tokens
    const jwtPayload = {
      userId: user._id.toString(),
      discordId: discordUser.id,
      guilds: manageableGuilds.map(g => g.id)
    };

    const accessToken = generateToken(jwtPayload);
    const refreshToken = generateRefreshToken({ userId: user._id.toString() });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          discordId: discordUser.id,
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar
        },
        guilds: manageableGuilds,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        }
      }
    });

  } catch (error) {
    console.error('Discord OAuth callback error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user from database
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate new access token
    const jwtPayload = {
      userId: user._id.toString(),
      discordId: user.discordId,
      guilds: user.guilds
    };

    const newAccessToken = generateToken(jwtPayload);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: 7 * 24 * 60 * 60 * 1000
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.dbUser!;
    const guilds = await getUserGuilds('dummy_token'); // This would need the actual token

    // For now, return basic user info
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          discordId: user.discordId,
          username: user.username,
          discriminator: user.discriminator,
          avatar: user.avatar
        },
        guilds: user.guilds.map((guildId: string) => ({ id: guildId }))
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info'
    });
  }
});

// Logout
router.post('/logout', authenticate, (req, res) => {
  // In a real implementation, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export { router as authRouter };
