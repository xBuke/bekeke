import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "@/lib/supabase/api-client"
import { registerKlijentSchema, registerPruzateljSchema, validateRequestBody } from "@/lib/validation"
import { checkRateLimit } from "@/lib/rate-limit"
import { ipAddress } from '@vercel/functions'
import { z } from 'zod'

type RegisterPruzateljData = z.infer<typeof registerPruzateljSchema>

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time issues
    const supabase = createSupabaseClient();
    
    // Rate limiting - 5 requests per minute for registration
    const clientIP = ipAddress(request) || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIP, 5, 60000)) {
      return NextResponse.json(
        { success: false, error: "Previše zahtjeva. Pokušajte ponovno za minutu." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { role } = body

    // Validate based on role
    let validatedData
    if (role === 'pruzatelj') {
      validatedData = validateRequestBody(registerPruzateljSchema, body)
    } else {
      validatedData = validateRequestBody(registerKlijentSchema, body)
    }

    const { 
      full_name, 
      email, 
      phone, 
      password
    } = validatedData

    // Extract provider-specific fields only if role is pruzatelj
    let business_name, oib, description, categories, cities, emergency_available, emergency_fee
    if (role === 'pruzatelj') {
      const pruzateljData = validatedData as RegisterPruzateljData
      business_name = pruzateljData.business_name
      oib = pruzateljData.oib
      description = pruzateljData.description
      categories = pruzateljData.categories
      cities = pruzateljData.cities
      emergency_available = pruzateljData.emergency_available
      emergency_fee = pruzateljData.emergency_fee
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { success: false, error: "Greška pri kreiranju korisnika: " + authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: "Korisnik nije kreiran" },
        { status: 400 }
      )
    }

    // Create user record in users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        phone,
        role: role || 'klijent'
      })

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { success: false, error: "Greška pri kreiranju korisničkog profila" },
        { status: 500 }
      )
    }

    // If provider, create service_providers record
    if (role === 'pruzatelj') {
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .insert({
          user_id: authData.user.id,
          business_name: business_name || null,
          oib,
          description,
          emergency_available: emergency_available || false,
          emergency_fee: emergency_available ? emergency_fee : null,
          verification_status: 'pending'
        })
        .select()
        .single()

      if (providerError) {
        console.error('Provider creation error:', providerError)
        return NextResponse.json(
          { success: false, error: "Greška pri kreiranju pružateljskog profila" },
          { status: 500 }
        )
      }

      // Link categories
      if (categories && categories.length > 0) {
        const categoryLinks = categories.map((categoryId: string) => ({
          provider_id: providerData.id,
          category_id: categoryId
        }))

        const { error: categoryError } = await supabase
          .from('provider_categories')
          .insert(categoryLinks)

        if (categoryError) {
          console.error('Category linking error:', categoryError)
          // Don't fail the registration, just log the error
        }
      }

      // Link cities
      if (cities && cities.length > 0) {
        const cityLinks = cities.map((cityId: string) => ({
          provider_id: providerData.id,
          city_id: cityId
        }))

        const { error: cityError } = await supabase
          .from('provider_cities')
          .insert(cityLinks)

        if (cityError) {
          console.error('City linking error:', cityError)
          // Don't fail the registration, just log the error
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: role === 'pruzatelj' 
        ? 'Registracija uspješna! Vaš račun čeka verifikaciju.'
        : 'Registracija uspješna!'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: "Dogodila se greška na serveru" },
      { status: 500 }
    )
  }
}
