import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - fetch all verified providers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategorija = searchParams.get('kategorija');
    const grad = searchParams.get('grad');
    const cijena_min = searchParams.get('cijena_min');
    const cijena_max = searchParams.get('cijena_max');
    const hitno = searchParams.get('hitno');

    // Build the base query
    let query = supabase
      .from('service_providers')
      .select(`
        *,
        user:users(*),
        categories:provider_categories(category:categories(*)),
        cities:provider_cities(city:cities(*)),
        services(*)
      `)
      .eq('verification_status', 'verified');

    // Apply emergency filter
    if (hitno === 'true') {
      query = query.eq('emergency_available', true);
    }

    const { data: providers, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Apply filters in memory since we need to check relations
    let filteredProviders = providers || [];

    // Filter by categories
    if (kategorija) {
      const categoryIds = kategorija.split(',');
      filteredProviders = filteredProviders.filter(provider => {
        if (!provider.categories || provider.categories.length === 0) return false;
        return provider.categories.some((pc: { category: { id: string } }) => 
          categoryIds.includes(pc.category.id)
        );
      });
    }

    // Filter by cities
    if (grad) {
      const cityIds = grad.split(',');
      filteredProviders = filteredProviders.filter(provider => {
        if (!provider.cities || provider.cities.length === 0) return false;
        return provider.cities.some((pc: { city: { id: string } }) => 
          cityIds.includes(pc.city.id)
        );
      });
    }

    // Filter by price range
    if (cijena_min || cijena_max) {
      filteredProviders = filteredProviders.filter(provider => {
        if (!provider.services || provider.services.length === 0) return false;
        
        const minPrice = Math.min(...provider.services.map((s: { price: number }) => s.price));
        const maxPrice = Math.max(...provider.services.map((s: { price: number }) => s.price));
        
        if (cijena_min && maxPrice < parseFloat(cijena_min)) return false;
        if (cijena_max && minPrice > parseFloat(cijena_max)) return false;
        
        return true;
      });
    }

    return NextResponse.json({ success: true, data: filteredProviders });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}
