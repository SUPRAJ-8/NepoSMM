import { z } from 'zod';

export const providerSchema = z.object({
    name: z.string().min(2, "Provider name must be at least 2 characters"),
    api_url: z.string().url("Invalid API URL format"),
    api_key: z.string().min(5, "API Key is too short"),
    currency: z.enum(['INR', 'USD', 'EUR', 'NPR']).default('INR')
});

export const updateProviderSchema = providerSchema.partial();
