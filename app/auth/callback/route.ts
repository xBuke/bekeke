import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "@/lib/supabase/api-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'
    const type = searchParams.get('type')

    if (code) {
      const supabase = createSupabaseClient()
      
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/reset-password?error=invalid_token`)
      }

      if (data.session) {
        // For password reset flow, redirect to reset password page
        if (type === 'recovery') {
          return NextResponse.redirect(`${origin}/reset-password`)
        }
        
        // For other auth flows, redirect to intended destination
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    // If no code or session, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=invalid_callback`)
    
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }
}
