import { supabase } from '@/lib/supabase/server';
import ResultsGrid from '@/components/usluge/ResultsGrid';
import { Category, City, ProviderWithRelations } from '@/types';

interface CategorySearchPageProps {
  params: Promise<{
    kategorija: string;
  }>;
  searchParams: Promise<{
    grad?: string;
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

async function getProvidersByCategory(
  categorySlug: string,
  searchParams: CategorySearchPageProps['searchParams']
): Promise<ProviderWithRelations[]> {
  // Get category ID from slug
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) {
    return [];
  }

  // Build the query
  let query = supabase
    .from('service_providers')
    .select(`
      *,
      user:users(*),
      categories:provider_categories(category:categories(*)),
      cities:provider_cities(city:cities(*)),
      services(*)
    `)
    .eq('verification_status', 'verified')
    .in('provider_categories.category_id', [category.id]);

  // Apply city filter if specified
  if (searchParams.grad) {
    const citySlugs = searchParams.grad.split(',');
    const { data: cities } = await supabase
      .from('cities')
      .select('id')
      .in('slug', citySlugs);
    
    if (cities && cities.length > 0) {
      query = query.in('provider_cities.city_id', cities.map(c => c.id));
    }
  }

  // Apply price filters
  if (searchParams.cijena_min) {
    const minPrice = parseFloat(searchParams.cijena_min);
    query = query.gte('services.price', minPrice);
  }

  if (searchParams.cijena_max) {
    const maxPrice = parseFloat(searchParams.cijena_max);
    query = query.lte('services.price', maxPrice);
  }

  // Apply emergency filter
  if (searchParams.hitno === 'true') {
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

export default async function CategorySearchPage({ params, searchParams }: CategorySearchPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { kategorija } = resolvedParams;

  // Fetch all data in parallel
  const [providers, categories, cities] = await Promise.all([
    getProvidersByCategory(kategorija, resolvedSearchParams),
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

export async function generateMetadata({ params }: { params: Promise<{ kategorija: string }> }) {
  const resolvedParams = await params;
  const { kategorija } = resolvedParams;
  
  // Get category name for metadata
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', kategorija)
    .single();

  const categoryName = category?.name || kategorija;

  return {
    title: `${categoryName} - Pružatelji usluga`,
    description: `Pronađite najbolje ${categoryName} u Hrvatskoj. Provjereni pružatelji usluga s recenzijama.`,
  };
}
