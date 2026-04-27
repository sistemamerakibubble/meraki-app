import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { routes } from '@/lib/constants/routes';

const PUBLIC_PATHS = new Set<string>([routes.login, routes.forgotPassword, routes.resetPassword]);

function redirectPreservingCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie.name, cookie.value);
  });
  return redirect;
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.has(pathname);
  const isAuthed = !!user;

  if (!isAuthed && pathname === '/') {
    return redirectPreservingCookies(request, response, routes.login);
  }

  if (!isAuthed && !isPublic) {
    return redirectPreservingCookies(request, response, routes.login);
  }

  if (isAuthed && (isPublic || pathname === '/')) {
    return redirectPreservingCookies(request, response, routes.dashboard);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/webhooks).*)',
  ],
};
