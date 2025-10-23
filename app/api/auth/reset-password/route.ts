import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "@/lib/supabase/api-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Token i lozinka su potrebni" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Lozinka mora imati najmanje 8 znakova" },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createSupabaseClient();

    // First verify the token is valid
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      return NextResponse.json(
        { success: false, error: "Neispravan ili istekao token" },
        { status: 400 }
      )
    }

    // Update the password using the token
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { success: false, error: "Greška pri ažuriranju lozinke" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Lozinka je uspješno resetirana"
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, error: "Dogodila se greška na serveru" },
      { status: 500 }
    )
  }
}
