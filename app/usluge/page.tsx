import { supabase } from '@/lib/supabase/server';
import ResultsGrid from '@/components/usluge/ResultsGrid';
import { Category, City, ProviderWithRelations } from '@/types';

interface BaseSearchPageProps {
  searchParams: Promise<{
    grad?: string;
    kategorija?: string;
    cijena_min?: string;
    cijena_max?: string;
    hitno?: string;
  }>;
}

async function getCategories(): Promise<Category[]> {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon, created_at')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return categories || [];
}

async function getCities(): Promise<City[]> {
  const { data: cities, error } = await supabase
    .from('cities')
    .select('id, name, slug, created_at')
    .order('name');

  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }

  return cities || [];
}

async function getAllProviders(
  searchParams: BaseSearchPageProps['searchParams']
): Promise<ProviderWithRelations[]> {
  const params = await searchParams;
  
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

  // Apply category filter if specified
  if (params.kategorija) {
    const categorySlugs = params.kategorija.split(',');
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .in('slug', categorySlugs);
    
    if (categories && categories.length > 0) {
      query = query.in('provider_categories.category_id', categories.map(c => c.id));
    }
  }

  // Apply city filter if specified
  if (params.grad) {
    const citySlugs = params.grad.split(',');
    const { data: cities } = await supabase
      .from('cities')
      .select('id')
      .in('slug', citySlugs);
    
    if (cities && cities.length > 0) {
      query = query.in('provider_cities.city_id', cities.map(c => c.id));
    }
  }

  // Apply price filters
  if (params.cijena_min) {
    const minPrice = parseFloat(params.cijena_min);
    query = query.gte('services.price', minPrice);
  }

  if (params.cijena_max) {
    const maxPrice = parseFloat(params.cijena_max);
    query = query.lte('services.price', maxPrice);
  }

  // Apply emergency filter
  if (params.hitno === 'true') {
    query = query.eq('emergency_available', true);
  }

  const { data: providers, error } = await query;

  if (error) {
    console.error('Error fetching providers:', error);
    return [];
  }

  // Calculate minimum price for each provider
  const providersWithMinPrice = (providers || []).map(provider => ({
    ...provider,
    min_price: provider.services.length > 0 
      ? Math.min(...provider.services.map((s: { price: number }) => s.price))
      : 0
  }));

  return providersWithMinPrice;
}

export default async function BaseSearchPage({ searchParams }: BaseSearchPageProps) {
  // Fetch all data in parallel
  const [providers, categories, cities] = await Promise.all([
    getAllProviders(searchParams),
    getCategories(),
    getCities()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ResultsGrid 
        providers={providers}
        categories={categories}
        cities={cities}
      />
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: 'Pružatelji usluga - Marketplace',
    description: 'Pronađite provjerene pružatelje usluga u Hrvatskoj. Vodoinstalateri, električari, čistačice i više.',
  };
}
