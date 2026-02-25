import { transactionsContract } from '@repo/types'
import { implement } from '@orpc/server'
import { prisma } from '@repo/db'
import { AppError } from '../utils/errors'

export const transactionsRouter = implement(transactionsContract).router({
    list: implement(transactionsContract.list).handler(async ({ context }) => {
        const payload = (context as any)?.user
        if (!payload) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

        const transactions = await prisma.transaction.findMany({
            where: { userId: payload.id },
            orderBy: { createdAt: 'desc' }
        })

        return { transactions: transactions as any }
    }),

    request: implement(transactionsContract.request).handler(async ({ input, context }) => {
        const payload = (context as any)?.user
        if (!payload) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

        const transaction = await prisma.transaction.create({
            data: {
                userId: payload.id,
                type: input.type,
                amount: input.amount,
                status: 'PENDING'
            }
        })

        return { transaction: transaction as any }
    }),

    getById: implement(transactionsContract.getById).handler(async ({ input, context }) => {
        const payload = (context as any)?.user
        if (!payload) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

        const transaction = await prisma.transaction.findUnique({
            where: { id: input.id }
        })

        if (!transaction || (transaction.userId !== payload.id && payload.role !== 'ADMIN')) {
            throw new AppError('Transaction not found', 'NOT_FOUND', 404)
        }

        return { transaction: transaction as any }
    })
})
