import jwt from 'jsonwebtoken';
import { apiConfig } from '@music/config';
export function generateToken(payload) {
    return jwt.sign(payload, apiConfig.jwtSecret, {
        expiresIn: '7d' // 7 days
    });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, apiConfig.jwtSecret);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
}
export function generateRefreshToken(payload) {
    return jwt.sign(payload, apiConfig.jwtSecret, {
        expiresIn: '30d' // 30 days
    });
}
export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, apiConfig.jwtSecret);
    }
    catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
}
//# sourceMappingURL=jwt.js.map