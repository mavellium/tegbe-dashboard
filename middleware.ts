import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip middleware during static generation
  if (request.headers.get('x-middleware-skip') === 'true') {
    return NextResponse.next();
  }
  
  const response = NextResponse.next();
  
  // Injetar pathname nos headers para uso no server-side
  response.headers.set('x-pathname', request.nextUrl.pathname);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
