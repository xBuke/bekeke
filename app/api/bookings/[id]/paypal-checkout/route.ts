import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "@/lib/auth";
import { createPayPalOrder } from "@/lib/paypal";

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
    
    // Dohvati booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        provider:service_providers!provider_id(*),
        service:services(title)
      `)
      .eq('id', bookingId)
      .eq('client_id', user.id) // Provjeri da je booking korisnikov
      .single();
    
    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    if (booking.status !== 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Booking must be accepted by provider first' },
        { status: 400 }
      );
    }
    
    // Kreiraj PayPal order
    const { orderId, paymentId } = await createPayPalOrder(bookingId, booking.total_price);
    
    return NextResponse.json({
      success: true,
      orderId,
      paymentId
    });
    
  } catch (error) {
    console.error('PayPal checkout error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
