
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Role & dashboard mapping
const DASHBOARD_BY_ROLE: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  FINANCE: "/dashboard/finance",
  STAFF: "/dashboard/staff",
};

// Public routes (no auth required)
const PUBLIC_ROUTES = [
  "/", "/auth/login", "/api/auth", "/favicon.ico", "/_next", "/assets"
];

// Helper: check if route is public
function isPublicRoute(path: string) {
  return PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Debug log (aktifkan di production jika perlu)
  // console.log("[Middleware] Path:", pathname, "Cookies:", request.cookies.getAll().map(c => c.name));

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Get token (try v5, fallback v4)
  let token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token"
  });
  if (!token) {
    token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      cookieName: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token"
    });
  }

  // Debug log token
  // console.log("[Middleware] Token:", token);

  // Public route logic
  if (isPublicRoute(pathname)) {
    // Jika user sudah login dan akses halaman public, redirect ke dashboard sesuai role
    if (token) {
      const role = token.role as string;
      const dashboard = DASHBOARD_BY_ROLE[role] || "/dashboard";
      if (pathname === "/" || pathname.startsWith("/auth/login")) {
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
    }
    return NextResponse.next();
  }

  // Require authentication for protected routes
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect /dashboard ke dashboard sesuai role
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    const role = token.role as string;
    const dashboard = DASHBOARD_BY_ROLE[role] || "/dashboard";
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // Batasi akses dashboard per role
  if (pathname.startsWith("/dashboard")) {
    const role = token.role as string;
    if (
      (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") ||
      (pathname.startsWith("/dashboard/finance") && role !== "FINANCE") ||
      (pathname.startsWith("/dashboard/staff") && role !== "STAFF")
    ) {
      const dashboard = DASHBOARD_BY_ROLE[role] || "/dashboard";
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
  }

  // Batasi akses API tertentu
  // Exception: /api/admin/categories bisa diakses semua authenticated users (read-only)
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/categories") && token.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (pathname.startsWith("/api/finance") && token.role !== "FINANCE" && token.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Default: allow
  return NextResponse.next();
}

// Aktifkan middleware untuk semua route kecuali static/image/favicon
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|netkrida.png).*)",
  ],
};
