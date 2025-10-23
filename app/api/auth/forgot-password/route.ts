import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "@/lib/supabase/api-client"
import { checkRateLimit } from "@/lib/rate-limit"
import { ipAddress } from '@vercel/functions'
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createSupabaseClient();
    
    // Rate limiting - 3 requests per 15 minutes for password reset
    const clientIP = ipAddress(request) || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIP, 3, 900000)) { // 15 minutes = 900000ms
      return NextResponse.json(
        { success: false, error: "Previše zahtjeva. Pokušajte ponovno za 15 minuta." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: "Molimo unesite valjan email" },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: userData } = await supabase
      .from('users')
      .select('full_name')
      .eq('email', email)
      .single()

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (userData) {
      try {
        // Use Supabase's built-in password reset
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
        })

        if (resetError) {
          console.error('Password reset error:', resetError)
          // Still return success to prevent enumeration
        } else {
          // Send branded email notification
          try {
            await sendEmail({
              to: email,
              subject: 'Resetiranje lozinke - Uslugo',
              html: emailTemplates.passwordReset(
                userData.full_name || 'Korisniče',
                `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
              )
            })
          } catch (emailError) {
            console.error('Email sending failed:', emailError)
            // Don't fail the request, Supabase already sent the reset email
          }
        }
      } catch (error) {
        console.error('Password reset process error:', error)
        // Still return success to prevent enumeration
      }
    }

    // Always return success message
    return NextResponse.json({
      success: true,
      message: "Ako email postoji, poslan je link za resetiranje lozinke"
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, error: "Dogodila se greška na serveru" },
      { status: 500 }
    )
  }
}
