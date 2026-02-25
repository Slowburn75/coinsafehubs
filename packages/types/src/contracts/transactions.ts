import { oc } from '@orpc/contract';
import { z } from 'zod';
import { TransactionSchema, TransactionTypeSchema } from '../schemas';

export const transactionsContract = oc.router({
    list: oc.output(z.object({ transactions: z.array(TransactionSchema) })),
    request: oc.input(z.object({ type: TransactionTypeSchema, amount: z.union([z.number(), z.string()]) })).output(z.object({ transaction: TransactionSchema })),
    getById: oc.input(z.object({ id: z.string() })).output(z.object({ transaction: TransactionSchema }))
});
