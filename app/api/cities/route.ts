import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cache cities for 1 hour
export const revalidate = 3600;

// GET - fetch all cities (public endpoint)
export async function GET() {
  try {
    const { data: cities, error } = await supabase
      .from('cities')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { success: true, data: cities },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}
