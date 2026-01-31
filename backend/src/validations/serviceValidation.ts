import { z } from 'zod';

export const serviceSchema = z.object({
    name: z.string().min(3, "Service name is too short"),
    category: z.string().min(2, "Category is required"),
    rate: z.number().positive("Rate must be positive"),
    min: z.number().int().min(1),
    max: z.number().int().min(1),
    status: z.enum(['active', 'inactive']).default('active'),
    description: z.string().optional(),
    margin: z.number().min(0).max(1000).default(45)
});

export const bulkMarginSchema = z.object({
    ids: z.array(z.string().or(z.number())),
    margin: z.number().min(0).max(1000)
});

export const toggleStatusSchema = z.object({
    status: z.enum(['active', 'inactive'])
});
