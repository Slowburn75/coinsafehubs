import { transactionsContract } from '@repo/types'
import { implement } from '@orpc/server'
import { Prisma, TransactionType, TransactionStatus } from '@repo/db'
import { prisma } from '@repo/db'
import { AppError } from '../utils/errors'
import { AuditService } from '../lib/auditService'

const parseAmount = (amount: string | number) => {
  const v = new Prisma.Decimal(amount)
  if (v.lte(0)) throw new AppError('Amount must be greater than zero.', 'VALIDATION_ERROR', 400)
  return v
}

export const transactionsRouter = implement(transactionsContract).router({
  list: implement(transactionsContract.list).handler(async ({ context }) => {
    const payload = (context as any)?.user
    if (!payload) throw new AppError('Authentication required.', 'UNAUTHORIZED', 401)

    const transactions = await prisma.transaction.findMany({
      where: { userId: payload.id },
      orderBy: { createdAt: 'desc' },
    })

    return { transactions: transactions as any }
  }),

  request: implement(transactionsContract.request).handler(async ({ input, context }) => {
    const payload = (context as any)?.user
    if (!payload) throw new AppError('Authentication required.', 'UNAUTHORIZED', 401)

    const amount = parseAmount(input.amount)

    const transaction = await prisma.$transaction(async (tx) => {
      const balance = await tx.userBalance.upsert({
        where: { userId: payload.id },
        update: {},
        create: { userId: payload.id },
      })

      if (input.type === TransactionType.WITHDRAWAL) {
        if (balance.available.lt(amount)) {
          throw new AppError(
            'You do not have enough balance to withdraw this amount.',
            'WITHDRAWAL_INSUFFICIENT_BALANCE',
            409,
          )
        }

        await tx.userBalance.update({
          where: { userId: payload.id },
          data: {
            available: { decrement: amount },
            pending: { increment: amount },
          },
        })
      }

      return tx.transaction.create({
        data: {
          userId: payload.id,
          type: input.type,
          amount,
          status: TransactionStatus.PENDING,
          metadata: { requestedAt: new Date().toISOString() },
        },
      })
    })

    await AuditService.log({
      adminId: payload.id,
      action: 'CREATE_TRANSACTION_REQUEST',
      entity: 'transaction',
      entityId: transaction.id,
      metadata: { type: input.type, amount: amount.toString() },
    })

    return { transaction: transaction as any }
  }),

  getById: implement(transactionsContract.getById).handler(async ({ input, context }) => {
    const payload = (context as any)?.user
    if (!payload) throw new AppError('Authentication required.', 'UNAUTHORIZED', 401)

    const transaction = await prisma.transaction.findUnique({ where: { id: input.id } })

    if (!transaction || (transaction.userId !== payload.id && payload.role !== 'ADMIN')) {
      throw new AppError('Transaction not found.', 'NOT_FOUND', 404)
    }

    return { transaction: transaction as any }
  }),
})
