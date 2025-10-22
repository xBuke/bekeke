import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/api-client";
import { requireAuth } from "@/lib/auth";
import { sendEmail, emailTemplates } from "@/lib/email";
import { bookingSchema, validateRequestBody } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { ipAddress } from '@vercel/functions';

// GET - dohvati bookinge korisnika
export async function GET() {
  try {
    // Create Supabase client inside the function to avoid build-time issues
    const supabase = createSupabaseClient();
    
    const user = await requireAuth();
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        client:users!client_id(*),
        provider:service_providers!provider_id(
          *,
          user:users(*)
        ),
        service:services(*),
        payment:payments(*)
      `);
    
    if (user.role === 'klijent') {
      query = query.eq('client_id', user.id);
    } else if (user.role === 'pruzatelj') {
      // Dohvati provider_id za korisnika
      const { data: provider } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (provider) {
        query = query.eq('provider_id', provider.id);
      }
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - kreiraj novi booking
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time issues
    const supabase = createSupabaseClient();
    
    // Rate limiting - 10 requests per minute for booking creation
    const clientIP = ipAddress(request) || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIP, 10, 60000)) {
      return NextResponse.json(
        { success: false, error: "Previše zahtjeva. Pokušajte ponovno za minutu." },
        { status: 429 }
      )
    }

    const user = await requireAuth();
    const body = await request.json();
    
    // Validate booking data
    const validatedData = validateRequestBody(bookingSchema, body);
    const { provider_id, service_id, requested_date, requested_time, is_emergency, client_notes } = validatedData;
    
    // Dohvati cijenu usluge
    const { data: service } = await supabase
      .from('services')
      .select('price')
      .eq('id', service_id)
      .single();
    
    if (!service) {
      throw new Error('Service not found');
    }
    
    let total_price = service.price;
    
    // Ako je hitna intervencija, dodaj emergency_fee
    if (is_emergency) {
      const { data: provider } = await supabase
        .from('service_providers')
        .select('emergency_fee')
        .eq('id', provider_id)
        .single();
      
      if (provider) {
        total_price += provider.emergency_fee || 0;
      }
    }
    
    // Kreiraj booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        client_id: user.id,
        provider_id,
        service_id,
        requested_date,
        requested_time,
        is_emergency,
        client_notes,
        total_price,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Pošalji email notifikaciju pružatelju
    try {
      // Dohvati provider i client podatke za email
      const { data: providerData } = await supabase
        .from('service_providers')
        .select(`
          business_name,
          user:users(full_name, email)
        `)
        .eq('id', provider_id)
        .single();
      
      const { data: clientData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      const { data: serviceData } = await supabase
        .from('services')
        .select('title')
        .eq('id', service_id)
        .single();
      
      if (providerData?.user?.[0]?.email && clientData && serviceData) {
        const providerName = providerData.business_name || providerData.user[0].full_name;
        const clientName = clientData.full_name;
        const serviceTitle = serviceData.title;
        
        await sendEmail({
          to: providerData.user[0].email,
          subject: 'Novi zahtjev za uslugu - Marketplace',
          html: emailTemplates.newBooking(
            providerName,
            clientName,
            serviceTitle,
            requested_date,
            requested_time,
            is_emergency
          )
        });
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Ne bacamo error jer booking je već kreiran
    }
    
    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
