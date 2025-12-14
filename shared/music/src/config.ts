import dotenv from 'dotenv';

dotenv.config();

export const lavalinkConfig = {
  host: process.env.LAVALINK_HOST || 'localhost',
  port: parseInt(process.env.LAVALINK_PORT || '2333'),
  password: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
  secure: process.env.LAVALINK_SECURE === 'true'
};

export const mongoConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-music-bot'
};

export const wsConfig = {
  url: process.env.WS_URL || 'http://localhost:4000',
  authToken: process.env.WS_AUTH_TOKEN
};

export const botConfig = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/callback'
};

export const apiConfig = {
  port: parseInt(process.env.API_PORT || '4000'),
  host: process.env.API_HOST || 'localhost',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key'
};

export const webConfig = {
  port: parseInt(process.env.WEB_PORT || '3000'),
  host: process.env.WEB_HOST || 'localhost'
};
