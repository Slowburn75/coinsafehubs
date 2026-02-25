import { os, implement } from '@orpc/server'
import { adminContract } from '@repo/types'
import { usersRouter } from './users'
import { depositsRouter } from './deposits'
import { withdrawalsRouter } from './withdrawals'
import { plansRouter } from './plans'
import { investmentsRouter } from './investments'
import { transactionsRouter } from './transactions'
import { ticketsRouter } from './tickets'
import { auditRouter } from './audit'
import { announcementsRouter } from './announcements'
import { dashboardRouter } from './dashboard'
import { adminGuard } from '../../middleware/adminGuard'

export const adminRouter = os.use(adminGuard).router(implement(adminContract).router({
    getStats: dashboardRouter.getStats,
    getCharts: dashboardRouter.getCharts,

    users: usersRouter,
    deposits: depositsRouter,
    withdrawals: withdrawalsRouter,
    plans: plansRouter,
    investments: investmentsRouter,
    transactions: transactionsRouter,
    support: ticketsRouter,
    audit: auditRouter,
    announcements: announcementsRouter,
}))
