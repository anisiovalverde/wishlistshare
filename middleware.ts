// Middleware temporariamente desabilitado para teste
// TODO: Reativar após instalar @supabase/auth-helpers-nextjs

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Middleware desabilitado temporariamente
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
} 