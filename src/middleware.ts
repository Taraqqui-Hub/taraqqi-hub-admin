/**
 * Admin Middleware
 * Next.js middleware for admin route protection
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/login"];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Allow public routes
	if (publicRoutes.some((route) => pathname.startsWith(route))) {
		return NextResponse.next();
	}

	// Check for auth cookie/storage
	// Note: Real auth check happens client-side since we use httpOnly cookies
	// This middleware mainly ensures proper redirects

	// For now, let client-side handle auth
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!_next/static|_next/image|favicon.ico|public).*)",
	],
};
