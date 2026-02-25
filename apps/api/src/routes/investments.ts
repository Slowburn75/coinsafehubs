import { investmentsContract } from '@repo/types'
import { implement } from '@orpc/server'
import { prisma } from '@repo/db'
import { AppError } from '../utils/errors'

export const investmentsRouter = implement(investmentsContract).router({
    create: implement(investmentsContract.create).handler(async ({ input, context }) => {
        const payload = (context as any)?.user
        if (!payload) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

        const plan = await prisma.investmentPlan.findUnique({
            where: { id: input.planId }
        })

        if (!plan || !plan.isActive) {
            throw new AppError('Investment plan not found or inactive', 'NOT_FOUND', 404)
        }

        const amount = Number(input.amount)
        if (amount < Number(plan.minimumAmount) || amount > Number(plan.maximumAmount)) {
            throw new AppError('Amount outside plan limits', 'BAD_REQUEST', 400)
        }

        const investment = await prisma.investment.create({
            data: {
                userId: payload.id,
                amount: input.amount,
                planId: plan.id,
                roi: plan.roiPercent
            },
            include: { plan: true }
        })

        return { investment: investment as any }
    }),

    list: implement(investmentsContract.list).handler(async ({ context }) => {
        const payload = (context as any)?.user
        if (!payload) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

        const investments = await prisma.investment.findMany({
            where: { userId: payload.id },
            include: { plan: true },
            orderBy: { createdAt: 'desc' }
        })

        return { investments: investments as any }
    }),

    getById: implement(investmentsContract.getById).handler(async ({ input, context }) => {
        const payload = (context as any)?.user
        if (!payload) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

        const investment = await prisma.investment.findUnique({
            where: { id: input.id },
            include: { plan: true }
        })

        if (!investment || (investment.userId !== payload.id && payload.role !== 'ADMIN')) {
            throw new AppError('Investment not found', 'NOT_FOUND', 404)
        }

        return { investment: investment as any }
    })
})
