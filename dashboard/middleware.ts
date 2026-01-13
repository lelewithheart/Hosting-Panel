import { NextResponse, type NextRequest } from "next/server";

// Prefer server-only URLs; avoid using NEXT_PUBLIC_* in middleware/SSR
const API_URL = process.env.BACKEND_URL || process.env.INTERNAL_API_URL || "http://127.0.0.1:3001";

const protectedPaths = [
  /^\/bots(\/.*)?$/,
  /^\/billing(\/.*)?$/,
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public routes and Next internals
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public/")
  ) {
    return NextResponse.next();
  }

  const needsAuth = protectedPaths.some((rx) => rx.test(pathname));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Optional: check subscription to gate the panel to paid users
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("auth failed");
    const data = await res.json();
    const isAdmin = !!data?.user?.isAdmin;
    if (isAdmin) return NextResponse.next();
    const sub = data?.user?.subscription;
    const hasSub = !!(sub && Object.keys(sub).length > 0);

    if (!hasSub && pathname.startsWith("/bots")) {
      const url = req.nextUrl.clone();
      url.pathname = "/billing";
      return NextResponse.redirect(url);
    }
  } catch {
    // If auth check fails, redirect to login
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|assets|images|public).*)",
  ],
};
