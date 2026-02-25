import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { logger } from 'hono/logger'
import { requestId } from 'hono/request-id'
import { AppError } from './utils/errors'
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
app.use('/auth/login', authRateLimit)
app.use('/auth/register', authRateLimit)

// Handle oRPC requests
app.all('/api/*', async (c) => {
    const result = await rpcHandler.handle(c.req.raw, { context: { c, user: c.get('user') } })
    return result.matched ? result.response : c.notFound()
})
app.all('/auth/*', async (c) => {
    const result = await rpcHandler.handle(c.req.raw, { context: { c } })
    return result.matched ? result.response : c.notFound()
})

// Global Error Handler
app.onError((err, c) => {
    if (err instanceof AppError) {
        return c.json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
            }
        }, err.statusCode as any)
    }

    console.error(err)
    return c.json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
        }
    }, 500)
})

const port = 3001
console.log(`Server is running on http://localhost:${port}`)

serve({
    fetch: app.fetch,
    port
})
