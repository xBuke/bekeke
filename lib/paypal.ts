import { createSupabaseClient } from './supabase/api-client';
import { calculateFees } from './stripe';

// PayPal SDK initialization
export function getPaypalConfig() {
  return {
    clientId: process.env.PAYPAL_CLIENT_ID!,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
  };
}

// Create PayPal order
export async function createPayPalOrder(bookingId: string, amount: number) {
  try {
    // Initialize Supabase client inside the function to avoid build-time issues
    const supabase = createSupabaseClient();
    const paypalConfig = getPaypalConfig();
    
    const fees = calculateFees(amount);
    
    // Create payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount: fees.amount,
        platform_fee: fees.platformFee,
        provider_amount: fees.providerAmount,
        payment_method: 'paypal',
        status: 'pending'
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error('Failed to create payment record');
    }

    // PayPal order data (commented out for now as it's not used in the mock implementation)
    // const orderData = {
    //   intent: 'CAPTURE',
    //   purchase_units: [
    //     {
    //       amount: {
    //         currency_code: 'EUR',
    //         value: fees.amount.toFixed(2),
    //       },
    //       description: `Booking payment for booking ${bookingId}`,
    //     },
    //   ],
    //   application_context: {
    //     return_url: `${process.env.NEXT_PUBLIC_APP_URL}/klijent/bookings/${bookingId}/success`,
    //     cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/klijent`,
    //   },
    // };

    // In a real implementation, you would call PayPal Orders API here
    // For now, we'll return a mock order ID
    const orderId = `paypal_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update payment record with order ID
    await supabase
      .from('payments')
      .update({ payment_intent_id: orderId })
      .eq('id', payment.id);

    return {
      orderId,
      paymentId: payment.id,
    };
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
}

// Capture PayPal payment
export async function capturePayPalPayment(orderId: string, paymentId: string) {
  try {
    // Initialize Supabase client inside the function to avoid build-time issues
    const supabase = createSupabaseClient();
    // In a real implementation, you would call PayPal Orders API to capture
    // For now, we'll simulate a successful capture
    
    // Update payment status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        paid_at: new Date().toISOString(),
        payout_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (paymentError) {
      throw new Error('Failed to update payment status');
    }

    // Get booking ID from payment
    const { data: payment } = await supabase
      .from('payments')
      .select('booking_id')
      .eq('id', paymentId)
      .single();

    if (payment) {
      // Update booking status
      await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', payment.booking_id);
    }

    return { success: true };
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    throw error;
  }
}
