import jwt from 'jsonwebtoken';
import { apiConfig } from '@music/config';

export interface JWTPayload {
  userId: string;
  discordId: string;
  guilds: string[];
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, apiConfig.jwtSecret, {
    expiresIn: '7d' // 7 days
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, apiConfig.jwtSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function generateRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, apiConfig.jwtSecret, {
    expiresIn: '30d' // 30 days
  });
}

export function verifyRefreshToken(token: string): { userId: string } {
  try {
    return jwt.verify(token, apiConfig.jwtSecret) as { userId: string };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}
