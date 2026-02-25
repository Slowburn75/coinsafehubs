import { oc } from '@orpc/contract';
import { authContract } from './contracts/auth';
import { investmentsContract } from './contracts/investments';
import { transactionsContract } from './contracts/transactions';
import { adminContract } from './contracts/admin';
import { supportContract } from './contracts/support';

export * from './contracts/auth';
export * from './contracts/investments';
export * from './contracts/transactions';
export * from './contracts/admin';
export * from './contracts/support';

export const appContract = oc.router({
    auth: authContract,
    investments: investmentsContract,
    transactions: transactionsContract,
    admin: adminContract,
    support: supportContract
});
