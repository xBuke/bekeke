import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/api-client";
import { requireAuth } from "@/lib/auth";
import { processRefund } from "@/lib/stripe";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Create Supabase client inside the function to avoid build-time issues
    const supabase = createSupabaseClient();
    
    const user = await requireAuth();
    const { id: bookingId } = await params;

    // Provjeri da je user klijent
    if (user.role !== 'klijent') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Dohvati booking s payment relacijom
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        payment:payments(*)
      `)
      .eq('id', bookingId)
      .eq('client_id', user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Provjeri da je booking pending ili accepted
    if (booking.status !== 'pending' && booking.status !== 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Booking cannot be cancelled' },
        { status: 400 }
      );
    }

    // Izračunaj vrijeme do termina
    const appointmentDateTime = new Date(`${booking.requested_date}T${booking.requested_time}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundMessage = '';
    let refundAmount: number | undefined = undefined;

    // Refund logika
    if (booking.payment && booking.payment.status === 'completed') {
      if (hoursUntilAppointment < 24) {
        // Manje od 24h - nema refund
        refundMessage = 'Otkazivanje manje od 24h prije termina - nema povrata novca';
      } else {
        // Više od 24h - 50% partial refund
        refundAmount = booking.total_price * 0.5;
        refundMessage = `Otkazivanje više od 24h prije termina - povrat 50% (${refundAmount.toFixed(2)}€)`;
      }

      // Pokreni refund ako je potreban
      if (refundAmount) {
        try {
          await processRefund(bookingId, refundAmount);
        } catch (refundError) {
          console.error('Refund error:', refundError);
          return NextResponse.json(
            { success: false, error: 'Failed to process refund' },
            { status: 500 }
          );
        }
      }
    } else {
      // Nije plaćen - samo otkaži
      refundMessage = 'Booking nije bio plaćen - otkazivanje bez povrata';
    }

    // Update booking status na 'cancelled'
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ 
      success: true, 
      message: refundMessage,
      refundAmount: refundAmount || 0
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
