import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const authRoutes = ["/login", "/register", "/forgot-password", "/verify-email"];
  const protectedPrefixes = [
    "/dashboard",
    "/compass",
    "/coach",
    "/school",
    "/therapy",
    "/goals",
    "/habits",
    "/schedules",
    "/calm-plan",
    "/resource-library",
    "/analytics",
    "/search",
    "/onboarding",
    "/children",
    "/debrief",
    "/timeline",
    "/settings",
    "/profile",
    "/check-in",
    "/reports",
    "/teacher-guide",
    "/pda-passport",
    "/documents",
    "/health",
    "/pilot-feedback",
    "/pilot-settings",
    "/admin",
  ];

  const isAuthRoute = authRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const isProtected = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
