import { os } from '@orpc/server';
import { appContract } from '@repo/types';
import { authRouter } from './auth';
import { investmentsRouter } from './investments';
import { transactionsRouter } from './transactions';
import { adminRouter } from './admin/index';
import { supportRouter } from './support';

export const appRouter = {
    auth: authRouter,
    investments: investmentsRouter,
    transactions: transactionsRouter,
    admin: adminRouter,
    support: supportRouter
};
