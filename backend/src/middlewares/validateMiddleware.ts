import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import logger from '../utils/logger';

export const validate = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync(req.body);
        return next();
    } catch (error) {
        if (error instanceof ZodError) {
            logger.warn('Validation error:', error.issues);
            return res.status(400).json({
                error: 'Validation failed',
                details: error.issues.map((err: any) => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        return res.status(500).json({ error: 'Internal server error during validation' });
    }
};

