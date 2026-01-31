import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});

export const loginSchema = z.object({
    email: z.string(), // Allow email or username potentially, but we'll focus on email for now as per implementation.
    password: z.string(),
});

export const forgotPasswordSchema = z.object({
    identifier: z.string().min(1, "Username or email is required"),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
