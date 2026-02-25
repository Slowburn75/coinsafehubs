import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { logger } from 'hono/logger'
import { requestId } from 'hono/request-id'
import { AppError, DatabaseError, ValidationError } from './utils/errors'
import { ZodError } from 'zod'
import { formatZodError } from './utils/validation'
import { env } from './utils/env'
import { checkAuth } from './middleware/auth'
import { globalRateLimit, authRateLimit } from './middleware/rateLimit'
import { auditLog } from './middleware/auditLog'
import { RPCHandler } from '@orpc/server/fetch'
import { appRouter } from './routes/index'

const app = new Hono<{
    Variables: {
        user: any
    }
}>()

// Health Check
app.get('/', (c) => c.text('OK'))
app.get('/health', (c) => c.json({ status: 'OK', timestamp: new Date().toISOString() }))

// Global Middleware
app.use('*', secureHeaders())
app.use('*', globalRateLimit)
app.use('*', cors({
    origin: env.ALLOWED_ORIGIN || '*',
    credentials: true,
}))
app.use('*', logger())
app.use('*', requestId())
app.use('*', auditLog)

// oRPC Handler setup
const rpcHandler = new RPCHandler(appRouter);

// Apply auth middleware to API routes except specific public auth routes
app.use('/api/*', checkAuth)
app.use('/auth/me', checkAuth)
app.use('/auth/login', authRateLimit)
app.use('/auth/register', authRateLimit)

// Handle oRPC requests
app.all('/api/*', async (c) => {
    const result = await rpcHandler.handle(c.req.raw, { context: { c, user: c.get('user') } })
    return result.matched ? result.response : c.notFound()
})
app.all('/auth/*', async (c) => {
    const result = await rpcHandler.handle(c.req.raw, { context: { c, user: c.get('user') } })
    return result.matched ? result.response : c.notFound()
})

// Global Error Handler
app.onError((err, c) => {
    const requestId = c.get('requestId')
    const isProd = env.NODE_ENV === 'production'

    // Log the error internally
    console.error(`[${requestId}] ${err.name}: ${err.message}`, isProd ? '' : err.stack)

    if (err instanceof ZodError) {
        const valError = formatZodError(err)
        return c.json({
            success: false,
            error: {
                code: valError.code,
                message: valError.message,
                status: valError.statusCode,
                fields: valError.details,
            }
        }, valError.statusCode as any)
    }

    if (err instanceof AppError) {
        return c.json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                status: err.statusCode,
                details: isProd && !err.isPublic ? undefined : err.details,
            }
        }, err.statusCode as any)
    }

    // Handle Prisma / Database errors
    if (err.name?.includes('Prisma') || err.message?.includes('database')) {
        const dbError = new DatabaseError()
        return c.json({
            success: false,
            error: {
                code: dbError.code,
                message: dbError.message,
                status: dbError.statusCode,
            }
        }, dbError.statusCode as any)
    }

    // Fallback for unknown errors
    return c.json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: isProd ? 'An unexpected error occurred. Please contact support.' : err.message,
            status: 500
        }
    }, 500)
})

const port = 3001
console.log(`Server is running on http://localhost:${port}`)

serve({
    fetch: app.fetch,
    port
})
