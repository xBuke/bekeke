import Stripe from 'stripe';
import { createSupabaseClient } from './supabase/api-client';

export function getStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-09-30.clover',
  });
}

// Kalkulacija fees
export function calculateFees(amount: number) {
  const platformFee = amount * 0.07; // 7%
  const providerAmount = amount - platformFee;
  
  return {
    amount,
    platformFee: Math.round(platformFee * 100) / 100, // round to 2 decimals
    providerAmount: Math.round(providerAmount * 100) / 100
  };
}

// Refund logika
export async function processRefund(bookingId: string, refundAmount?: number) {
  // Initialize clients inside the function to avoid build-time issues
  const supabase = createSupabaseClient();
  const stripe = getStripeClient();
  
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .single();
  
  if (!payment || payment.status !== 'completed') {
    return;
  }
  
  await stripe.refunds.create({
    payment_intent: payment.payment_intent_id,
    amount: refundAmount 
      ? Math.round(refundAmount * 100) 
      : undefined, // full refund if not specified
  });
  
  await supabase
    .from('payments')
    .update({ status: 'refunded' })
    .eq('id', payment.id);
}
