import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { workingHoursSchema, validateRequestBody } from '@/lib/validation';
import { z } from 'zod';

// POST - upsert working hours (delete existing and insert new)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Get provider ID for the user
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Validate working hours data
    const workingHoursArraySchema = z.object({
      working_hours: z.array(workingHoursSchema).min(0).max(7, 'Maksimalno 7 dana u tjednu')
    });
    const validatedData = validateRequestBody(workingHoursArraySchema, body);
    const { working_hours } = validatedData;

    // Delete existing working hours
    const { error: deleteError } = await supabase
      .from('working_hours')
      .delete()
      .eq('provider_id', provider.id);

    if (deleteError) {
      throw deleteError;
    }

    // Insert new working hours
    if (working_hours.length > 0) {
      const workingHoursData = working_hours.map((schedule: { day_of_week: number; start_time: string; end_time: string }) => ({
        provider_id: provider.id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time
      }));

      const { error: insertError } = await supabase
        .from('working_hours')
        .insert(workingHoursData);

      if (insertError) {
        throw insertError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving working hours:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save working hours' },
      { status: 500 }
    );
  }
}

// GET - fetch working hours for the authenticated provider
export async function GET() {
  try {
    const user = await requireAuth();

    // Get provider ID for the user
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Fetch working hours
    const { data: workingHours, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('provider_id', provider.id)
      .order('day_of_week');

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: workingHours });
  } catch (error) {
    console.error('Error fetching working hours:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch working hours' },
      { status: 500 }
    );
  }
}
