import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/api/auth",
  "/favicon.ico",
  "/_next",
  "/assets",
]

const DASHBOARD_BY_ROLE: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  FINANCE: "/dashboard/finance",
  STAFF: "/dashboard/staff",
}

function isPublicRoute(path: string) {
  return PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route + "/"))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public routes without auth
  if (isPublicRoute(pathname)) {
    // Jika user sudah login dan akses halaman public, redirect ke dashboard sesuai role
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (token) {
      const role = token.role as string
      const dashboard = DASHBOARD_BY_ROLE[role] || "/dashboard"
      
      // Jika user sudah login, redirect dari halaman public ke dashboard
      if (pathname === "/" || pathname.startsWith("/auth/login")) {
        return NextResponse.redirect(new URL(dashboard, req.url))
      }
    }
    return NextResponse.next()
  }

  // Cek token autentikasi
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  if (!token) {
    // Jika belum login dan akses halaman protected, redirect ke login
    const loginUrl = new URL("/auth/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Jika akses /dashboard langsung, redirect ke dashboard sesuai role
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    const role = token.role as string
    const dashboard = DASHBOARD_BY_ROLE[role] || "/dashboard"
    return NextResponse.redirect(new URL(dashboard, req.url))
  }

  // Batasi akses dashboard per role
  if (pathname.startsWith("/dashboard")) {
    const role = token.role as string
    if (
      (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") ||
      (pathname.startsWith("/dashboard/finance") && role !== "FINANCE") ||
      (pathname.startsWith("/dashboard/staff") && role !== "STAFF")
    ) {
      // Forbidden, redirect ke dashboard sesuai role
      const dashboard = DASHBOARD_BY_ROLE[role] || "/dashboard"
      return NextResponse.redirect(new URL(dashboard, req.url))
    }
  }

  // Batasi akses API tertentu
  if (pathname.startsWith("/api/admin") && token.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (pathname.startsWith("/api/finance") && token.role !== "FINANCE" && token.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Default: allow
  return NextResponse.next()
}

// Aktifkan middleware untuk semua route
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|netkrida.png).*)",
  ],
}
