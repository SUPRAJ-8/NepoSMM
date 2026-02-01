import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nepo-smm-secret-key-2025') as any;

        // Use a dynamic import or require to avoid circular dependency if pool is imported here
        // Actually pool is already imported in many files, should be fine.
        const { query } = require('../config/db'); // Using require to be safe if types are tricky here
        const userRes = await query('SELECT status FROM users WHERE id = $1', [decoded.id]);

        if (userRes.rows.length === 0 || userRes.rows[0].status === 'banned') {
            return res.status(403).json({ error: 'Access denied: Account is banned or suspended' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
