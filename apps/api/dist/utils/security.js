import { GuildSettingsModel } from '@utils/schemas';
// Cooldown storage (in production, use Redis)
const userCooldowns = new Map();
const guildCooldowns = new Map();
// Anti-spam tracking
const userMessageCounts = new Map();
const SPAM_WINDOW = 10000; // 10 seconds
const SPAM_LIMIT = 5; // 5 messages per window
export class SecurityManager {
    // Check if user has required permissions for a command
    static async checkCommandPermission(userId, guildId, command) {
        try {
            const settings = await GuildSettingsModel.findOne({ guildId });
            if (!settings) {
                return { allowed: true }; // Default allow if no settings
            }
            const commandPermissions = settings.permissions[command];
            if (!commandPermissions || commandPermissions.length === 0) {
                return { allowed: true }; // No restrictions
            }
            // Check if user has DJ role
            if (settings.djRoleId) {
                // In a real implementation, check user's roles from Discord API
                // For now, assume DJ role grants all permissions
                return { allowed: true };
            }
            // Check specific role permissions
            // This would require Discord API integration to get user's roles
            // For now, return allowed (implement role checking based on your needs)
            return { allowed: true };
        }
        catch (error) {
            console.error('Permission check error:', error);
            return { allowed: false, reason: 'Permission check failed' };
        }
    }
    // Check and update cooldowns
    static checkCooldown(userId, guildId, command, cooldownMs) {
        const now = Date.now();
        const key = `${userId}:${guildId}:${command}`;
        if (!userCooldowns.has(userId)) {
            userCooldowns.set(userId, new Map());
        }
        const userMap = userCooldowns.get(userId);
        const lastUsed = userMap.get(key);
        if (!lastUsed || now - lastUsed >= cooldownMs) {
            userMap.set(key, now);
            return { allowed: true };
        }
        return { allowed: false, remainingTime: cooldownMs - (now - lastUsed) };
    }
    // Check for spam
    static checkSpam(userId) {
        const now = Date.now();
        if (!userMessageCounts.has(userId)) {
            userMessageCounts.set(userId, { count: 1, resetTime: now + SPAM_WINDOW });
            return { isSpam: false };
        }
        const userData = userMessageCounts.get(userId);
        if (now > userData.resetTime) {
            // Reset window
            userData.count = 1;
            userData.resetTime = now + SPAM_WINDOW;
            return { isSpam: false };
        }
        userData.count++;
        if (userData.count > SPAM_LIMIT) {
            return { isSpam: true, resetTime: userData.resetTime };
        }
        return { isSpam: false };
    }
    // Guild-wide rate limiting
    static checkGuildRateLimit(guildId, action, limit, windowMs) {
        const now = Date.now();
        const key = `${guildId}:${action}`;
        if (!guildCooldowns.has(guildId)) {
            guildCooldowns.set(guildId, new Map());
        }
        const guildMap = guildCooldowns.get(guildId);
        const lastUsed = guildMap.get(key);
        if (!lastUsed || now - lastUsed >= windowMs) {
            guildMap.set(key, now);
            return { allowed: true };
        }
        return { allowed: false, resetTime: lastUsed + windowMs };
    }
    // Clean up old cooldowns (call this periodically)
    static cleanupCooldowns() {
        const now = Date.now();
        const maxAge = 300000; // 5 minutes
        // Clean user cooldowns
        for (const [userId, userMap] of userCooldowns.entries()) {
            for (const [key, timestamp] of userMap.entries()) {
                if (now - timestamp > maxAge) {
                    userMap.delete(key);
                }
            }
            if (userMap.size === 0) {
                userCooldowns.delete(userId);
            }
        }
        // Clean guild cooldowns
        for (const [guildId, guildMap] of guildCooldowns.entries()) {
            for (const [key, timestamp] of guildMap.entries()) {
                if (now - timestamp > maxAge) {
                    guildMap.delete(key);
                }
            }
            if (guildMap.size === 0) {
                guildCooldowns.delete(guildId);
            }
        }
        // Clean spam tracking
        for (const [userId, userData] of userMessageCounts.entries()) {
            if (now > userData.resetTime) {
                userMessageCounts.delete(userId);
            }
        }
    }
    // Validate input data
    static validateTrackQuery(query) {
        if (!query || query.trim().length === 0) {
            return { valid: false, reason: 'Query cannot be empty' };
        }
        if (query.length > 200) {
            return { valid: false, reason: 'Query too long (max 200 characters)' };
        }
        // Check for malicious patterns
        const maliciousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /eval\(/i,
            /function\(/i
        ];
        for (const pattern of maliciousPatterns) {
            if (pattern.test(query)) {
                return { valid: false, reason: 'Invalid query content' };
            }
        }
        return { valid: true };
    }
    // Log security events
    static logSecurityEvent(event) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            ...event
        };
        console.warn('SECURITY EVENT:', JSON.stringify(logEntry, null, 2));
        // In production, you might want to:
        // - Store in database
        // - Send to monitoring service
        // - Trigger alerts for repeated violations
    }
}
// Middleware for command permissions
export async function requireCommandPermission(command) {
    return async (req, res, next) => {
        try {
            const user = req.user;
            const guildId = req.params.guildId;
            if (!user || !guildId) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing user or guild information'
                });
            }
            const permission = await SecurityManager.checkCommandPermission(user.discordId, guildId, command);
            if (!permission.allowed) {
                SecurityManager.logSecurityEvent({
                    type: 'permission_denied',
                    userId: user.discordId,
                    guildId,
                    details: { command, reason: permission.reason }
                });
                return res.status(403).json({
                    success: false,
                    error: permission.reason || 'Permission denied'
                });
            }
            next();
        }
        catch (error) {
            console.error('Permission middleware error:', error);
            res.status(500).json({
                success: false,
                error: 'Permission check failed'
            });
        }
    };
}
// Middleware for cooldowns
export function requireCooldown(command, cooldownMs = 3000) {
    return (req, res, next) => {
        const user = req.user;
        const guildId = req.params.guildId;
        if (!user || !guildId) {
            return next();
        }
        const cooldown = SecurityManager.checkCooldown(user.discordId, guildId, command, cooldownMs);
        if (!cooldown.allowed) {
            return res.status(429).json({
                success: false,
                error: `Command on cooldown. Try again in ${Math.ceil((cooldown.remainingTime || 0) / 1000)} seconds.`
            });
        }
        next();
    };
}
// Middleware for spam protection
export function antiSpam(req, res, next) {
    const user = req.user;
    if (!user) {
        return next();
    }
    const spamCheck = SecurityManager.checkSpam(user.discordId);
    if (spamCheck.isSpam) {
        SecurityManager.logSecurityEvent({
            type: 'spam',
            userId: user.discordId,
            guildId: req.params.guildId,
            details: { resetTime: spamCheck.resetTime }
        });
        return res.status(429).json({
            success: false,
            error: 'Too many requests. Please slow down.'
        });
    }
    next();
}
// Middleware for input validation
export function validateTrackQuery(req, res, next) {
    const { query } = req.body;
    if (query) {
        const validation = SecurityManager.validateTrackQuery(query);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.reason || 'Invalid query'
            });
        }
    }
    next();
}
// Periodic cleanup
setInterval(() => {
    SecurityManager.cleanupCooldowns();
}, 60000); // Clean up every minute
//# sourceMappingURL=security.js.map