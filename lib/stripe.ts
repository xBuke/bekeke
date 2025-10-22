import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .single();
  
  if (!payment || payment.status !== 'completed') {
    return;
  }
  
  const refund = await stripe.refunds.create({
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
