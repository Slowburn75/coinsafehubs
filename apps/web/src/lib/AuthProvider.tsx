'use client'

import React, { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orpc } from './orpc'

interface AuthContextType {
    user: any | null
    isLoading: boolean
    isAuthenticated: boolean
    refetch: () => void
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    refetch: () => { }
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data, isLoading, refetch } = useQuery(orpc.auth.me.queryOptions({
        retry: false,
        refetchOnWindowFocus: false,
    }))

    return (
        <AuthContext.Provider value={{
            user: data?.user || null,
            isLoading,
            isAuthenticated: !!data?.user,
            refetch
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
