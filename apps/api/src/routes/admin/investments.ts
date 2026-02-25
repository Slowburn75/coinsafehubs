import { adminInvestmentsContract } from '@repo/types'
import { implement } from '@orpc/server'
import { prisma } from '@repo/db'
import { AppError } from '../../utils/errors'
import { AuditService } from '../../lib/auditService'
import { InvestmentStatus, TransactionSource, TransactionType } from '@repo/db'

export const investmentsRouter = implement(adminInvestmentsContract).router({
    list: implement(adminInvestmentsContract.list).handler(async ({ input }) => {
        const { page, limit, status } = input
        const skip = (page - 1) * limit

        const where = {
            ...(status && { status }),
        }

        const [investments, total] = await Promise.all([
            prisma.investment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { email: true } },
                    plan: true
                }
            }),
            prisma.investment.count({ where })
        ])

        return {
            data: investments as any,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }
    }),

    complete: implement(adminInvestmentsContract.complete).handler(async ({ input, context }) => {
        const admin = (context as any).user

        const investment = await prisma.investment.findUnique({
            where: { id: input.investmentId },
            include: { plan: true }
        })

        if (!investment || investment.status !== InvestmentStatus.ACTIVE) {
            throw new AppError('Investment not found or not active', 'NOT_FOUND', 404)
        }

        const payoutAmount = investment.amount.add(investment.amount.mul(investment.roi.div(100)))

        await prisma.$transaction(async (tx) => {
            await tx.investment.update({
                where: { id: input.investmentId },
                data: { status: InvestmentStatus.COMPLETED }
            })

            await tx.userBalance.update({
                where: { userId: investment.userId },
                data: {
                    available: { increment: payoutAmount },
                    invested: { decrement: investment.amount },
                    earnings: { increment: investment.amount.mul(investment.roi.div(100)) }
                }
            })

            await tx.transaction.create({
                data: {
                    userId: investment.userId,
                    type: TransactionType.INTEREST,
                    amount: payoutAmount,
                    status: 'COMPLETED',
                    source: TransactionSource.SYSTEM,
                    adminNote: `Manual investment completion by admin ${admin.id}`,
                }
            })
        })

        await AuditService.log({
            adminId: admin.id,
            action: 'COMPLETE_INVESTMENT_MANUALLY',
            entity: 'investment',
            entityId: input.investmentId,
            after: { status: InvestmentStatus.COMPLETED }
        })

        return { success: true }
    }),

    cancel: implement(adminInvestmentsContract.cancel).handler(async ({ input, context }) => {
        const admin = (context as any).user

        const investment = await prisma.investment.findUnique({
            where: { id: input.investmentId }
        })

        if (!investment || investment.status !== InvestmentStatus.ACTIVE) {
            throw new AppError('Investment not found or not active', 'NOT_FOUND', 404)
        }

        await prisma.$transaction(async (tx) => {
            await tx.investment.update({
                where: { id: input.investmentId },
                data: { status: InvestmentStatus.CANCELLED }
            })

            await tx.userBalance.update({
                where: { userId: investment.userId },
                data: {
                    available: { increment: investment.amount },
                    invested: { decrement: investment.amount }
                }
            })

            await tx.transaction.create({
                data: {
                    userId: investment.userId,
                    type: TransactionType.DEPOSIT,
                    amount: investment.amount,
                    status: 'COMPLETED',
                    source: TransactionSource.SYSTEM,
                    adminNote: `Investment cancelled by admin ${admin.id}. Principal refunded.`,
                }
            })
        })

        await AuditService.log({
            adminId: admin.id,
            action: 'CANCEL_INVESTMENT',
            entity: 'investment',
            entityId: input.investmentId,
            after: { status: InvestmentStatus.CANCELLED }
        })

        return { success: true }
    }),

    pause: implement(adminInvestmentsContract.pause).handler(async ({ input, context }) => {
        const admin = (context as any).user

        await prisma.investment.update({
            where: { id: input.investmentId },
            data: { isPaused: input.pause }
        })

        await AuditService.log({
            adminId: admin.id,
            action: input.pause ? 'PAUSE_INVESTMENT' : 'UNPAUSE_INVESTMENT',
            entity: 'investment',
            entityId: input.investmentId
        })

        return { success: true }
    }),

    adjustRoi: implement(adminInvestmentsContract.adjustRoi).handler(async ({ input, context }) => {
        const admin = (context as any).user

        const oldInvestment = await prisma.investment.findUnique({ where: { id: input.investmentId } })
        if (!oldInvestment) throw new AppError('Investment not found', 'NOT_FOUND', 404)

        await prisma.investment.update({
            where: { id: input.investmentId },
            data: { roi: input.newRoi }
        })

        await AuditService.log({
            adminId: admin.id,
            action: 'ADJUST_INVESTMENT_ROI',
            entity: 'investment',
            entityId: input.investmentId,
            before: { roi: Number(oldInvestment.roi) },
            after: { roi: input.newRoi }
        })

        return { success: true }
    })
})
