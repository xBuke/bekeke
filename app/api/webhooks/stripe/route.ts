import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { createSupabaseClient } from '@/lib/supabase/api-client';
import Stripe from 'stripe';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  // Create Supabase client inside the function to avoid build-time issues
  const supabase = createSupabaseClient();
  
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
  
  // Handle različite event tipove
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      try {
        // Update payment status
        const { error: paymentUpdateError } = await supabase
          .from('payments')
          .update({
            status: 'completed',
            paid_at: new Date().toISOString()
          })
          .eq('payment_intent_id', paymentIntent.id);
        
        if (paymentUpdateError) {
          console.error('Error updating payment status:', paymentUpdateError);
          throw paymentUpdateError;
        }
        
        // Get booking_id from payment record
        const { data: payment, error: paymentFetchError } = await supabase
          .from('payments')
          .select('booking_id')
          .eq('payment_intent_id', paymentIntent.id)
          .single();
        
        if (paymentFetchError || !payment) {
          console.error('Error fetching payment record:', paymentFetchError);
          throw paymentFetchError;
        }
        
        // Update booking status
        const { error: bookingUpdateError } = await supabase
          .from('bookings')
          .update({ status: 'completed' })
          .eq('id', payment.booking_id);
        
        if (bookingUpdateError) {
          console.error('Error updating booking status:', bookingUpdateError);
          throw bookingUpdateError;
        }
        
        // Auto-payout partneru (transfer je već napravljen u Payment Intent)
        const { error: payoutUpdateError } = await supabase
          .from('payments')
          .update({ payout_at: new Date().toISOString() })
          .eq('payment_intent_id', paymentIntent.id);
        
        if (payoutUpdateError) {
          console.error('Error updating payout timestamp:', payoutUpdateError);
          throw payoutUpdateError;
        }
        
        console.log(`Payment succeeded for booking ${payment.booking_id}`);
        
        // Pošalji email notifikacije
        try {
          // Dohvati booking podatke s client i provider informacijama
          const { data: bookingData } = await supabase
            .from('bookings')
            .select(`
              requested_date,
              requested_time,
              total_price,
              client:users!client_id(full_name, email),
              provider:service_providers!provider_id(
                business_name,
                user:users(full_name, email)
              ),
              service:services(title)
            `)
            .eq('id', payment.booking_id)
            .single();
          
          const { data: paymentData } = await supabase
            .from('payments')
            .select('amount, platform_fee, provider_amount')
            .eq('booking_id', payment.booking_id)
            .single();
          
          if (bookingData?.client?.[0]?.email && bookingData.provider?.[0]?.user?.[0]?.email && paymentData) {
            const clientName = bookingData.client[0].full_name;
            const providerName = bookingData.provider[0].business_name || bookingData.provider[0].user[0].full_name;
            const serviceTitle = bookingData.service[0].title;
            
            // Email klijentu
            await sendEmail({
              to: bookingData.client[0].email,
              subject: 'Plaćanje uspješno - Marketplace',
              html: emailTemplates.paymentSuccessClient(
                clientName,
                providerName,
                serviceTitle,
                bookingData.requested_date,
                bookingData.requested_time,
                paymentData.amount
              )
            });
            
            // Email partneru
            await sendEmail({
              to: bookingData.provider[0].user[0].email,
              subject: 'Novo plaćanje primljeno - Marketplace',
              html: emailTemplates.paymentSuccessProvider(
                providerName,
                clientName,
                serviceTitle,
                bookingData.requested_date,
                bookingData.requested_time,
                paymentData.amount,
                paymentData.provider_amount
              )
            });
          }
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Ne bacamo error jer payment je već obrađen
        }
        
      } catch (error) {
        console.error('Error processing payment_intent.succeeded:', error);
        // Return 200 to prevent Stripe retries for internal errors
        return NextResponse.json({ received: true });
      }
      
      break;
    
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
      
      try {
        // Update payment status to failed
        const { error: paymentUpdateError } = await supabase
          .from('payments')
          .update({
            status: 'failed'
          })
          .eq('payment_intent_id', failedPaymentIntent.id);
        
        if (paymentUpdateError) {
          console.error('Error updating failed payment status:', paymentUpdateError);
        } else {
          console.log(`Payment failed for intent ${failedPaymentIntent.id}`);
        }
        
        // TODO: Pošalji email klijentu o neuspješnom plaćanju
        // await sendEmail({
        //   to: client.email,
        //   subject: 'Plaćanje neuspješno',
        //   html: emailTemplates.paymentFailed(...)
        // });
        
      } catch (error) {
        console.error('Error processing payment_intent.payment_failed:', error);
        // Return 200 to prevent Stripe retries for internal errors
        return NextResponse.json({ received: true });
      }
      
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  return NextResponse.json({ received: true });
}
