import { adminContract } from '@repo/types'
import { implement } from '@orpc/server'
import { prisma } from '@repo/db'
import { subDays } from 'date-fns'

export const dashboardRouter = {
    getStats: implement(adminContract.getStats).handler(async () => {
        const now = new Date()
        const thirtyDaysAgo = subDays(now, 30)

        const [
            totalUsers,
            activeUsers30d,
            frozenAccounts,
            pendingKycCount,
            depositsAllTime,
            withdrawalsAllTime,
            activeInvestments,
            pendingWithdrawals,
            pendingDeposits
        ] = await Promise.all([
            prisma.user.count(),
            prisma.refreshToken.count({
                where: { createdAt: { gte: thirtyDaysAgo } },
            }),
            prisma.user.count({ where: { isActive: false } }),
            prisma.user.count({ where: { kycStatus: 'PENDING' } }),
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { type: 'DEPOSIT', status: 'COMPLETED' }
            }),
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { type: 'WITHDRAWAL', status: 'COMPLETED' }
            }),
            prisma.investment.aggregate({
                _sum: { amount: true },
                where: { status: 'ACTIVE' }
            }),
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { type: 'WITHDRAWAL', status: 'PENDING' }
            }),
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { type: 'DEPOSIT', status: 'PENDING' }
            })
        ])

        return {
            totalUsers,
            activeUsers30d,
            frozenAccounts,
            pendingKycCount,
            totalDepositsAllTime: Number(depositsAllTime._sum.amount || 0),
            totalWithdrawalsAllTime: Number(withdrawalsAllTime._sum.amount || 0),
            activeInvestmentVolume: Number(activeInvestments._sum.amount || 0),
            totalRoiPaidOut: 0,
            pendingWithdrawalTotal: Number(pendingWithdrawals._sum.amount || 0),
            pendingDepositTotal: Number(pendingDeposits._sum.amount || 0),
        }
    }),

    getCharts: implement(adminContract.getCharts).handler(async () => {
        const dailyStats: { date: string; deposits: number; withdrawals: number }[] = []
        for (let i = 29; i >= 0; i--) {
            const date = subDays(new Date(), i)
            date.setHours(0, 0, 0, 0)
            const nextDate = new Date(date)
            nextDate.setDate(date.getDate() + 1)

            const [dayDeposits, dayWithdrawals] = await Promise.all([
                prisma.transaction.aggregate({
                    _sum: { amount: true },
                    where: { type: 'DEPOSIT', status: 'COMPLETED', createdAt: { gte: date, lt: nextDate } }
                }),
                prisma.transaction.aggregate({
                    _sum: { amount: true },
                    where: { type: 'WITHDRAWAL', status: 'COMPLETED', createdAt: { gte: date, lt: nextDate } }
                })
            ])

            dailyStats.push({
                date: date.toISOString().split('T')[0]!,
                deposits: Number(dayDeposits._sum.amount || 0),
                withdrawals: Number(dayWithdrawals._sum.amount || 0),
            })
        }

        return {
            dailyStats,
            userGrowth: [] as { month: string; count: number }[],
        }
    })
}
