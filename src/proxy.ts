import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const adminRoutes = ['/admin']
const authRoutes = ['/login', '/register']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r))
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r))

  // Read session token from cookie (optimistic check only — real auth in DAL)
  const sessionToken =
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value

  if (isAdminRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|opengraph-image).*)',
  ],
}
