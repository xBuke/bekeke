import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - fetch one booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: bookingId } = await params;

    // Fetch booking with all relations
    const { data: booking, error } = await supabase
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
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify user is either client or provider of the booking
    const isClient = booking.client_id === user.id;
    const isProvider = user.role === 'pruzatelj' && booking.provider?.user_id === user.id;

    if (!isClient && !isProvider) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}
