import DiscordOauth2 from 'discord-oauth2';
import { botConfig } from '@music/config';

export const discordOAuth = new DiscordOauth2({
  clientId: botConfig.clientId!,
  clientSecret: botConfig.clientSecret!,
  redirectUri: botConfig.redirectUri
});

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
  hasBot?: boolean;
}

export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  try {
    const user = await discordOAuth.getUser(accessToken);
    return {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator || '',
      avatar: user.avatar || null,
      email: user.email || undefined
    };
  } catch (error) {
    throw new Error('Failed to fetch Discord user');
  }
}

export async function getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  try {
    const guilds = await discordOAuth.getUserGuilds(accessToken);

    // Check which guilds have the bot
    // Note: This would require the bot to be running and accessible
    // For now, we'll assume all guilds are valid
    return guilds.map(guild => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon || null,
      owner: guild.owner || false,
      permissions: guild.permissions || '',
      features: guild.features,
      hasBot: true // This should be checked against bot's guild cache
    }));
  } catch (error) {
    throw new Error('Failed to fetch user guilds');
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  try {
    return await discordOAuth.tokenRequest({
      clientId: botConfig.clientId!,
      clientSecret: botConfig.clientSecret!,
      grantType: 'refresh_token',
      refreshToken: refreshToken,
      scope: ['identify', 'guilds', 'email']
    });
  } catch (error) {
    throw new Error('Failed to refresh access token');
  }
}

export function getAvatarUrl(user: DiscordUser): string | null {
  if (!user.avatar) return null;
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
}

export function getGuildIconUrl(guild: DiscordGuild): string | null {
  if (!guild.icon) return null;
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
}
