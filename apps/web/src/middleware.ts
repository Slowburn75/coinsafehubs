import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')
    const { pathname } = request.nextUrl

    const isProtected = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/investments') ||
        pathname.startsWith('/transactions') ||
        pathname.startsWith('/support') ||
        pathname.startsWith('/admin')

    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')

    if (isProtected && !token?.value) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isAuthRoute && token?.value) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
