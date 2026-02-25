import { Context, Next } from 'hono'
import { RateLimitError } from '../utils/errors'

// Simplified memory-based rate limiting for demonstration.
// In production, redis should be used here.

const store = new Map<string, { count: number, resetTime: number }>()

const createLimiter = (max: number, windowMs: number) => {
    return async (c: Context, next: Next) => {
        const ip = c.req.header('x-forwarded-for') || '127.0.0.1'

        const now = Date.now()
        const record = store.get(ip)

        if (record && record.resetTime > now) {
            if (record.count >= max) {
                const retryAfter = Math.ceil((record.resetTime - now) / 1000)
                c.header('Retry-After', retryAfter.toString())
                throw new RateLimitError(`You have made too many requests. Please try again in ${retryAfter} seconds.`, retryAfter)
            }
            record.count++
        } else {
            store.set(ip, { count: 1, resetTime: now + windowMs })
        }

        await next()
    }
}

export const globalRateLimit = createLimiter(1000, 15 * 60 * 1000)
export const authRateLimit = createLimiter(50, 15 * 60 * 1000)
