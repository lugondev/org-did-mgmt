import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

/**
 * Middleware to protect routes that require authentication
 * Redirects unauthenticated users to sign-in page
 */
export default withAuth(
  function middleware(req) {
    // Additional middleware logic can be added here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is authenticated
        const isAuthenticated = !!token
        
        // Allow access to auth pages without authentication
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        
        // Require authentication for all other protected routes
        return isAuthenticated
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

/**
 * Configure which routes should be protected by the middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}