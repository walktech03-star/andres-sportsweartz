import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// =============================================================================
// ADMIN ROUTE PROTECTION (Next.js calls this file a "proxy")
// =============================================================================
// This runs before every /admin page is rendered.
//
// Layer 1 (here): is there a valid signed-in session? If not, the visitor is sent
// to the login page and never reaches the dashboard at all.
//
// Layer 2 (src/lib/admin.ts): is that account on the admin allow list? That check
// happens inside each page, so a signed-in but unauthorised account is refused.
//
// Both layers are needed. This one is fast, the other one is authoritative.
// =============================================================================

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  // Safe default: if the database is not configured yet, the admin area does not
  // exist at all. It is far better to hide it than to leave it unprotected.
  if (!url || !anonKey) {
    if (path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser checks the session with Supabase rather than trusting the cookie alone.
  const { data } = await supabase.auth.getUser();

  const isLoginPage = path === "/admin/login";

  if (!data.user && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (data.user && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};