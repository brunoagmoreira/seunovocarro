import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Quando o browser usa o mesmo host do site em `NEXT_PUBLIC_API_URL` (ex.: …/api),
 * as chamadas caem no Next. Com `API_INTERNAL_URL` (ex.: http://api:3001 no Docker),
 * reescrevemos internamente para o container da API Nest (prefixo global /api).
 */
export function middleware(request: NextRequest) {
  const internal = process.env.API_INTERNAL_URL?.replace(/\/$/, '');
  if (!internal) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  try {
    const destination = new URL(`${pathname}${search}`, internal);
    return NextResponse.rewrite(destination);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
