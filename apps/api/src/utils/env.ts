import { z } from 'zod'

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    ALLOWED_ORIGIN: z.string().url(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format())
    process.exit(1)
}

export const env = parsed.data
