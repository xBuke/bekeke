import { supabase } from '@/lib/supabase/server';
import ResultsGrid from '@/components/usluge/ResultsGrid';
import { Category, City, ProviderWithRelations } from '@/types';
import { seoConfig, generatePageTitle, generatePageDescription, generateOpenGraphTitle } from '@/lib/seo-config';
import type { Metadata } from 'next';

interface SearchPageProps {
  params: {
    kategorija: string;
    grad: string;
  };
  searchParams: {
    kategorija?: string;
    grad?: string;
    cijena_min?: string;
    cijena_max?: string;
    hitno?: string;
  };
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

async function getProviders(
  categorySlug: string,
  citySlug: string,
  searchParams: SearchPageProps['searchParams']
): Promise<ProviderWithRelations[]> {
  // Get category and city IDs from slugs
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  const { data: city } = await supabase
    .from('cities')
    .select('id')
    .eq('slug', citySlug)
    .single();

  if (!category || !city) {
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
    .in('provider_categories.category_id', [category.id])
    .in('provider_cities.city_id', [city.id]);

  // Apply additional filters from search params
  if (searchParams.cijena_min) {
    const minPrice = parseFloat(searchParams.cijena_min);
    query = query.gte('services.price', minPrice);
  }

  if (searchParams.cijena_max) {
    const maxPrice = parseFloat(searchParams.cijena_max);
    query = query.lte('services.price', maxPrice);
  }

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

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { kategorija, grad } = params;

  // Fetch all data in parallel
  const [providers, categories, cities] = await Promise.all([
    getProviders(kategorija, grad, searchParams),
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

export async function generateMetadata({ params }: { params: { kategorija: string; grad: string } }): Promise<Metadata> {
  const { kategorija, grad } = params;
  
  // Get category and city names for metadata
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', kategorija)
    .single();

  const { data: city } = await supabase
    .from('cities')
    .select('name')
    .eq('slug', grad)
    .single();

  const categoryName = category?.name || kategorija;
  const cityName = city?.name || grad;
  const categoryDescription = category?.description || `Profesionalni ${categoryName}`;

  const title = generatePageTitle(`${categoryName} u ${cityName}u`);
  const description = generatePageDescription(
    `Pronađite najbolje ${categoryName} u ${cityName}u. ${categoryDescription}. Provjereni pružatelji usluga s recenzijama.`,
    cityName,
    categoryName
  );

  return {
    title,
    description,
    keywords: [
      categoryName.toLowerCase(),
      cityName.toLowerCase(),
      `${categoryName} ${cityName}`,
      'usluge',
      'majstori',
      'hrvatska'
    ],
    openGraph: {
      title: generateOpenGraphTitle(`${categoryName} u ${cityName}u`, cityName, categoryName),
      description,
      url: `${seoConfig.url}/usluge/${kategorija}/${grad}`,
      siteName: seoConfig.name,
      locale: seoConfig.locale,
      type: 'website',
      images: [
        {
          url: seoConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${categoryName} u ${cityName}u`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: generateOpenGraphTitle(`${categoryName} u ${cityName}u`, cityName, categoryName),
      description,
    },
  };
}
