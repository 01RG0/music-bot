import DiscordOauth2 from 'discord-oauth2';
export declare const discordOAuth: DiscordOauth2;
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
export declare function getDiscordUser(accessToken: string): Promise<DiscordUser>;
export declare function getUserGuilds(accessToken: string): Promise<DiscordGuild[]>;
export declare function refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
}>;
export declare function getAvatarUrl(user: DiscordUser): string | null;
export declare function getGuildIconUrl(guild: DiscordGuild): string | null;
//# sourceMappingURL=discord.d.ts.map