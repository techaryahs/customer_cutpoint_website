import createMiddleware from 'next-intl/middleware';
import {routing} from './app/routing';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Run next-intl middleware for all requests
  const response = intlMiddleware(request);

  // 2. Add custom auth logic for protected routes
  // Note: with next-intl, routes are prefixed e.g., /en/customer
  const localePrefixes = routing.locales.map(l => `/${l}`);
  const isProtectedRoute = (path: string) => {
    return localePrefixes.some(prefix => path.startsWith(`${prefix}/customer`)) || 
           path.startsWith('/customer');
  };

  if (isProtectedRoute(pathname)) {
    const token = request.cookies.get("salon_token")?.value;

    if (!token) {
      // Find the locale to redirect correctly
      const locale = routing.locales.find(l => pathname.startsWith(`/${l}`)) || routing.defaultLocale;
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(hi|en|mr)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
