import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/api-client";
import { requireAuth } from "@/lib/auth";
import { processRefund } from "@/lib/stripe";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Create Supabase client inside the function to avoid build-time issues
    const supabase = createSupabaseClient();
    
    const user = await requireAuth();
    const { id: bookingId } = await params;
    const body = await request.json();
    const { provider_notes } = body;

    // Provjeri da je user partner
    if (user.role !== 'partner') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Dohvati provider_id za korisnika
    const { data: provider } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Dohvati booking i provjeri da je partner vlasnik
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('provider_id', provider.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Provjeri da je booking pending
    if (booking.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Booking is not pending' },
        { status: 400 }
      );
    }

    // Update booking status na 'rejected'
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'rejected',
        provider_notes: provider_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (updateError) {
      throw updateError;
    }

    // Ako je booking već plaćen, pokreni refund (Stripe Refund API)
    try {
      await processRefund(bookingId);
    } catch (refundError) {
      console.error('Refund error:', refundError);
      // Ne bacamo error jer booking je već odbijen
    }

    // Pošalji email klijentu s razlogom odbijanja
    try {
      // Dohvati booking podatke za email
      const { data: bookingData } = await supabase
        .from('bookings')
        .select(`
          requested_date,
          client:users!client_id(full_name, email),
          provider:service_providers!provider_id(
            business_name,
            user:users(full_name)
          ),
          service:services(title)
        `)
        .eq('id', bookingId)
        .single();
      
      if (bookingData?.client?.[0]?.email && bookingData.provider && bookingData.service) {
        const providerName = bookingData.provider[0]?.business_name || bookingData.provider[0]?.user[0]?.full_name;
        const clientName = bookingData.client[0].full_name;
        const serviceTitle = bookingData.service[0].title;
        
        await sendEmail({
          to: bookingData.client[0].email,
          subject: 'Zahtjev je odbijen - Marketplace',
          html: emailTemplates.bookingRejected(
            clientName,
            providerName,
            serviceTitle,
            bookingData.requested_date,
            provider_notes
          )
        });
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Ne bacamo error jer booking je već odbijen
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
