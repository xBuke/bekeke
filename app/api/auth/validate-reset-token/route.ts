import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "@/lib/supabase/api-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token je potreban" },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createSupabaseClient();

    // Verify the token by attempting to get the user
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return NextResponse.json(
        { success: false, error: "Neispravan ili istekao token" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Token je valjan"
    })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { success: false, error: "Greška pri validaciji tokena" },
      { status: 500 }
    )
  }
}
