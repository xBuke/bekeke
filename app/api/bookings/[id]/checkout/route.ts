import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, calculateFees } from "@/lib/stripe";
import { createSupabaseClient } from "@/lib/supabase/api-client";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Create Supabase client inside the function to avoid build-time issues
    const supabase = createSupabaseClient();
    
    const user = await requireAuth();
    const { id: bookingId } = await params;
    
    // Dohvati booking s provider i service detaljima
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        provider:service_providers!provider_id(stripe_account_id),
        service:services(title)
      `)
      .eq('id', bookingId)
      .single();
    
    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Provjeri da je user klijent bookinga
    if (booking.client_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Provjeri da je booking status 'accepted'
    if (booking.status !== 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Booking must be accepted by provider first' },
        { status: 400 }
      );
    }
    
    // Provjeri da provider ima Stripe account
    if (!booking.provider?.stripe_account_id) {
      return NextResponse.json(
        { success: false, error: 'Provider has not completed Stripe setup' },
        { status: 400 }
      );
    }
    
    // Kalkuliraj fees
    const fees = calculateFees(booking.total_price);
    
    // Kreiraj Payment Intent
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(fees.amount * 100), // convert to cents
      currency: 'eur',
      application_fee_amount: Math.round(fees.platformFee * 100),
      transfer_data: {
        destination: booking.provider.stripe_account_id,
      },
      metadata: {
        booking_id: bookingId,
        client_id: user.id,
      },
    });
    
    // Kreiraj payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount: fees.amount,
        platform_fee: fees.platformFee,
        provider_amount: fees.providerAmount,
        payment_method: 'stripe',
        payment_intent_id: paymentIntent.id,
        status: 'pending'
      });
    
    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return NextResponse.json(
        { success: false, error: 'Failed to create payment record' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
    
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Payment processing failed' },
      { status: 500 }
    );
  }
}
