import { createORPCReactQueryUtils } from '@orpc/react-query'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { appContract } from '@repo/types'
import type { ContractRouterClient } from '@orpc/contract'

const link = new RPCLink({
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    headers: () => ({
        // We can pass additional headers here if needed
    })
})

export const orpcClient = createORPCClient<ContractRouterClient<typeof appContract>>(link)

export const orpc = createORPCReactQueryUtils<ContractRouterClient<typeof appContract>>(orpcClient)
