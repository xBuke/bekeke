import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

// GET - fetch one provider by ID with all relations (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await params;

    const { data: provider, error } = await supabase
      .from('service_providers')
      .select(`
        *,
        user:users(*),
        categories:provider_categories(category:categories(*)),
        cities:provider_cities(city:cities(*)),
        services(*),
        working_hours(*),
        gallery:gallery_images(*)
      `)
      .eq('id', providerId)
      .single();

    if (error || !provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: provider });
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch provider' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: providerId } = await params;

    // Verify that the user owns this provider profile
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('user_id')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    if (provider.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      business_name,
      description,
      emergency_available,
      emergency_fee,
      profile_photo_url,
      categories,
      cities
    } = body;

    // Update provider data
    const { error: updateError } = await supabase
      .from('service_providers')
      .update({
        business_name,
        description,
        emergency_available,
        emergency_fee: emergency_available ? emergency_fee : null,
        profile_photo_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', providerId);

    if (updateError) {
      throw updateError;
    }

    // Update categories if provided
    if (categories !== undefined) {
      // Delete existing categories
      await supabase
        .from('provider_categories')
        .delete()
        .eq('provider_id', providerId);

      // Insert new categories
      if (categories.length > 0) {
        const categoryInserts = categories.map((categoryId: string) => ({
          provider_id: providerId,
          category_id: categoryId
        }));

        const { error: categoriesError } = await supabase
          .from('provider_categories')
          .insert(categoryInserts);

        if (categoriesError) {
          throw categoriesError;
        }
      }
    }

    // Update cities if provided
    if (cities !== undefined) {
      // Delete existing cities
      await supabase
        .from('provider_cities')
        .delete()
        .eq('provider_id', providerId);

      // Insert new cities
      if (cities.length > 0) {
        const cityInserts = cities.map((cityId: string) => ({
          provider_id: providerId,
          city_id: cityId
        }));

        const { error: citiesError } = await supabase
          .from('provider_cities')
          .insert(cityInserts);

        if (citiesError) {
          throw citiesError;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update provider' },
      { status: 500 }
    );
  }
}
