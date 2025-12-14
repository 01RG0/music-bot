import { Request, Response, NextFunction } from 'express';
export declare class SecurityManager {
    static checkCommandPermission(userId: string, guildId: string, command: string): Promise<{
        allowed: boolean;
        reason?: string;
    }>;
    static checkCooldown(userId: string, guildId: string, command: string, cooldownMs: number): {
        allowed: boolean;
        remainingTime?: number;
    };
    static checkSpam(userId: string): {
        isSpam: boolean;
        resetTime?: number;
    };
    static checkGuildRateLimit(guildId: string, action: string, limit: number, windowMs: number): {
        allowed: boolean;
        resetTime?: number;
    };
    static cleanupCooldowns(): void;
    static validateTrackQuery(query: string): {
        valid: boolean;
        reason?: string;
    };
    static logSecurityEvent(event: {
        type: 'spam' | 'rate_limit' | 'permission_denied' | 'suspicious_activity';
        userId: string;
        guildId?: string;
        details?: any;
        ip?: string;
    }): void;
}
export declare function requireCommandPermission(command: string): Promise<(req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>>;
export declare function requireCooldown(command: string, cooldownMs?: number): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare function antiSpam(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
export declare function validateTrackQuery(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=security.d.ts.map