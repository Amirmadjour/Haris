// Create middleware.ts at project root
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/auth/login" || path === "/auth/signup";

  const token = request.cookies.get("auth-token")?.value;

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }
}

export const config = {
  matcher: ["/", "/auth/login", "/auth/signup"],
};
