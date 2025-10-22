import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { serviceSchema, validateRequestBody } from '@/lib/validation';
import { z } from 'zod';

// GET - fetch all services for the authenticated provider
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

    // Fetch services
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST - create new service
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate service data
    const validatedData = validateRequestBody(serviceSchema, body);
    const { title, description, price_type, price, duration_minutes } = validatedData;

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

    // Create service
    const { data: service, error } = await supabase
      .from('services')
      .insert({
        provider_id: provider.id,
        title,
        description,
        price_type,
        price,
        duration_minutes: price_type === 'fixed' ? duration_minutes : null
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// PUT - update service
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate service data (including id)
    const serviceUpdateSchema = serviceSchema.extend({
      id: z.string().uuid('Nevažeći ID usluge')
    });
    const validatedData = validateRequestBody(serviceUpdateSchema, body);
    const { id, title, description, price_type, price, duration_minutes } = validatedData;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Verify that the service belongs to the user's provider
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select(`
        id,
        provider_id
      `)
      .eq('id', id)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if the service belongs to the user's provider
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('user_id')
      .eq('id', service.provider_id)
      .single();

    if (providerError || !provider || provider.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update service
    const { data: updatedService, error } = await supabase
      .from('services')
      .update({
        title,
        description,
        price_type,
        price,
        duration_minutes: price_type === 'fixed' ? duration_minutes : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: updatedService });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE - delete service
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('id');

    if (!serviceId) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Verify that the service belongs to the user's provider
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select(`
        id,
        provider_id
      `)
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if the service belongs to the user's provider
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('user_id')
      .eq('id', service.provider_id)
      .single();

    if (providerError || !provider || provider.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete service
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
