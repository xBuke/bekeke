import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "@/lib/auth";
import { capturePayPalPayment } from "@/lib/paypal";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Dohvati payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings!booking_id(client_id)
      `)
      .eq('booking_id', bookingId)
      .eq('payment_intent_id', orderId)
      .single();
    
    if (paymentError || !payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // Provjeri da je payment korisnikov
    if (payment.booking.client_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Capture PayPal payment
    await capturePayPalPayment(orderId, payment.id);
    
    return NextResponse.json({
      success: true,
      message: 'Payment captured successfully'
    });
    
  } catch (error) {
    console.error('PayPal capture error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
