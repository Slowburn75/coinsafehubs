import { oc } from '@orpc/contract';
import { z } from 'zod';
import { InvestmentSchema } from '../schemas';

export const investmentsContract = oc.router({
    create: oc.input(z.object({ amount: z.union([z.number(), z.string()]), planId: z.string() })).output(z.object({ investment: InvestmentSchema })),
    list: oc.output(z.object({ investments: z.array(InvestmentSchema) })),
    getById: oc.input(z.object({ id: z.string() })).output(z.object({ investment: InvestmentSchema }))
});
