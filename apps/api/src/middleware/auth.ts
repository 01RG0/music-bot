import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { UserModel } from '@utils/schemas';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      dbUser?: any;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    // Fetch user from database
    const dbUser = await UserModel.findOne({ discordId: decoded.discordId });
    if (!dbUser) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = decoded;
    req.dbUser = dbUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
}

export function requireGuildAccess(req: Request, res: Response, next: NextFunction) {
  const { guildId } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (!guildId) {
    return res.status(400).json({
      success: false,
      error: 'Guild ID required'
    });
  }

  if (!user.guilds.includes(guildId)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to this guild'
    });
  }

  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Ignore invalid tokens for optional auth
    }
  }

  next();
}
