
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase/config';
// Audit logging would be triggered from a backend service or API route after authentication
// import { auditLogger } from '@/lib/audit/logger';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users from dashboard pages to the login page
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is authenticated and tries to access login/register, redirect them to the dashboard
  if (token && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
      return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Here, you would typically verify the token with Firebase Admin SDK on your backend.
  // Since this is client-side middleware, we can only do a basic check.
  // A robust implementation involves an API route that verifies the token.
  
  console.log(`Middleware: Path '${pathname}' accessed. Auth token present: ${!!token}`);
  
  // Placeholder for role-based access control. This would require token verification
  // and checking custom claims, which must happen on the backend.
  if (pathname.startsWith('/admin') && token) {
    console.log('Admin route accessed. Backend verification needed.');
    // Example: const claims = await verifyTokenOnBackend(token);
    // if (claims.role !== 'admin') {
    //   return NextResponse.redirect(new URL('/unauthorized', request.url));
    // }
  }

  // Audit logging should be performed on the backend after a request is authenticated
  // and the user's identity is confirmed.
  // Example call from an API route:
  // auditLogger.log({ userId: decodedToken.uid, path: pathname, ... });

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
