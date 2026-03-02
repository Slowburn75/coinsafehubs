import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(30).default(7),
  ALLOWED_ORIGIN: z.string().default('http://localhost:3000'),
  COOKIE_DOMAIN: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

const raw = parsed.data

export const env = {
  ...raw,
  JWT_REFRESH_SECRET: raw.JWT_REFRESH_SECRET ?? raw.JWT_SECRET,
  ALLOWED_ORIGINS: raw.ALLOWED_ORIGIN.split(',').map((v) => v.trim()).filter(Boolean),
  IS_PROD: raw.NODE_ENV === 'production',
}
