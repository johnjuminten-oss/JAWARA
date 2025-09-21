import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in middleware')
    return NextResponse.next()
  }

  // Define public routes that don't require authentication
  const isPublicRoute = 
    request.nextUrl.pathname.startsWith('/auth') || 
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')

  // For public routes, allow the request to proceed
  if (isPublicRoute) {
    return NextResponse.next()
  }

  try {
    let res = NextResponse.next()
    
    // Create a Supabase client for auth checks
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            res.cookies.set({
              name,
              value,
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          },
          remove(name: string, options: any) {
            res.cookies.delete({
              name,
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          },
        },
      }
    )

    // Clone the request URL
    const requestUrl = new URL(request.url)

    const { data: { user } } = await supabase.auth.getUser()

    // If not logged in, redirect to login
    if (!user) {
      const redirectUrl = new URL('/auth/login', requestUrl)
      redirectUrl.searchParams.set('from', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.redirect(new URL('/auth/login', requestUrl))
    }

    // Check role-based access
    const path = request.nextUrl.pathname
    if (
      (path.startsWith('/admin') && profile.role !== 'admin') ||
      (path.startsWith('/teacher') && profile.role !== 'teacher') ||
      (path.startsWith('/student') && profile.role !== 'student')
    ) {
      // Redirect to appropriate dashboard
      return NextResponse.redirect(new URL(`/${profile.role}/dashboard`, requestUrl))
    }

    // For protected routes, update response headers
    res = NextResponse.rewrite(request.url)
    res.headers.set('x-middleware-cache', 'no-cache')
    res.headers.set('x-user-role', profile.role)
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
