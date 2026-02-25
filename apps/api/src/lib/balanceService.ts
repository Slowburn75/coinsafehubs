import { prisma } from '@repo/db'
import { Prisma, TransactionType, TransactionSource, TransactionStatus } from '@repo/db'
import { AppError } from '../utils/errors'

export class BalanceService {
    /**
     * Credits a user's balance and creates a transaction record.
     */
    static async credit(params: {
        userId: string
        amount: number | Prisma.Decimal
        type: TransactionType
        source: TransactionSource
        reference?: string
        adminNote?: string
        metadata?: any
    }) {
        const amount = new Prisma.Decimal(params.amount)

        return await prisma.$transaction(async (tx) => {
            // 1. Update UserBalance
            const balance = await tx.userBalance.update({
                where: { userId: params.userId },
                data: {
                    available: { increment: amount }
                }
            })

            // 2. Create Transaction
            const transaction = await tx.transaction.create({
                data: {
                    userId: params.userId,
                    type: params.type,
                    amount: amount,
                    status: TransactionStatus.COMPLETED,
                    source: params.source,
                    reference: params.reference,
                    adminNote: params.adminNote,
                    metadata: params.metadata,
                }
            })

            return { balance, transaction }
        })
    }

    /**
     * Debits a user's balance and creates a transaction record.
     */
    static async debit(params: {
        userId: string
        amount: number | Prisma.Decimal
        type: TransactionType
        source: TransactionSource
        reference?: string
        adminNote?: string
        metadata?: any
    }) {
        const amount = new Prisma.Decimal(params.amount)

        return await prisma.$transaction(async (tx) => {
            // 1. Check current balance
            const currentBalance = await tx.userBalance.findUnique({
                where: { userId: params.userId }
            })

            if (!currentBalance || currentBalance.available.lt(amount)) {
                throw new AppError('Insufficient balance', 'INSUFFICIENT_BALANCE', 400)
            }

            // 2. Update UserBalance
            const balance = await tx.userBalance.update({
                where: { userId: params.userId },
                data: {
                    available: { decrement: amount }
                }
            })

            // 3. Create Transaction
            const transaction = await tx.transaction.create({
                data: {
                    userId: params.userId,
                    type: params.type,
                    amount: amount,
                    status: TransactionStatus.COMPLETED,
                    source: params.source,
                    reference: params.reference,
                    adminNote: params.adminNote,
                    metadata: params.metadata,
                }
            })

            return { balance, transaction }
        })
    }

    /**
     * Directly edits user balances (Admin only capability).
     * Computes the delta and creates a SYSTEM transaction record.
     */
    static async editBalance(params: {
        userId: string
        newBalances: {
            available?: number | Prisma.Decimal
            invested?: number | Prisma.Decimal
            earnings?: number | Prisma.Decimal
            bonus?: number | Prisma.Decimal
            pending?: number | Prisma.Decimal
        }
        adminId: string
        reason: string
    }) {
        return await prisma.$transaction(async (tx) => {
            const oldBalance = await tx.userBalance.findUnique({
                where: { userId: params.userId }
            })

            if (!oldBalance) throw new AppError('User balance record not found', 'NOT_FOUND', 404)

            const updateData: Prisma.UserBalanceUpdateInput = {}
            const deltas: any = {}

            for (const [key, value] of Object.entries(params.newBalances)) {
                if (value !== undefined) {
                    const newVal = new Prisma.Decimal(value)
                    if (newVal.lt(0)) throw new AppError(`${key} balance cannot be negative`, 'BAD_REQUEST', 400)

                    updateData[key as keyof Prisma.UserBalanceUpdateInput] = newVal
                    deltas[key] = newVal.minus((oldBalance as any)[key]).toNumber()
                }
            }

            // Update balance
            const updatedBalance = await tx.userBalance.update({
                where: { userId: params.userId },
                data: updateData
            })

            // Create a SYSTEM transaction to reflect the adjustment
            const totalDelta = Object.values(deltas).reduce((acc: number, val: any) => acc + val, 0)

            await tx.transaction.create({
                data: {
                    userId: params.userId,
                    type: TransactionType.INTEREST, // Using INTEREST as a placeholder for adjustments or we could add 'ADJUSTMENT' to enum
                    amount: new Prisma.Decimal(Math.abs(totalDelta)),
                    status: TransactionStatus.COMPLETED,
                    source: TransactionSource.SYSTEM,
                    adminNote: `Admin ${params.adminId} manual adjustment: ${params.reason}. Deltas: ${JSON.stringify(deltas)}`,
                }
            })

            return updatedBalance
        })
    }
}
