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

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nepo-smm-secret-key-2025') as any;
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
