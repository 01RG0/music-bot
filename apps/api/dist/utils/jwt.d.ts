export interface JWTPayload {
    userId: string;
    discordId: string;
    guilds: string[];
    iat?: number;
    exp?: number;
}
export declare function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
export declare function verifyToken(token: string): JWTPayload;
export declare function generateRefreshToken(payload: {
    userId: string;
}): string;
export declare function verifyRefreshToken(token: string): {
    userId: string;
};
//# sourceMappingURL=jwt.d.ts.map