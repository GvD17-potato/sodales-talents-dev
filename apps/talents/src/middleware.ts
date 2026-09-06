import { auth } from "@/lib/auth/server";
import { NextResponse, type NextRequest } from "next/server";

const authMiddleware = auth.middleware({ loginUrl: "/login" });

function publicNotFound(request: NextRequest) {
  return NextResponse.rewrite(new URL("/_not-found", request.url), {
    status: 404,
  });
}

export default async function middleware(request: NextRequest) {
  const profileMatch = request.nextUrl.pathname.match(/^\/talents\/([^/]+)$/);
  if (profileMatch) {
    let slug: string;
    try {
      slug = decodeURIComponent(profileMatch[1]);
    } catch {
      return publicNotFound(request);
    }
    const { hasApprovedTalentSlug } = await import(
      "@/features/talents/queries"
    );
    if (!(await hasApprovedTalentSlug(slug))) return publicNotFound(request);
    return NextResponse.next();
  }

  return authMiddleware(request);
}

export const config = {
  matcher: [
    "/talents/:slug",
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/auth/:path*",
  ],
  runtime: "nodejs",
};
