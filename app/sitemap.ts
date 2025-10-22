import { MetadataRoute } from 'next';
import { createSupabaseClient } from '@/lib/supabase/api-client';
import { seoConfig } from '@/lib/seo-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = seoConfig.url;
  
  // Statičke stranice
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/usluge`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  try {
    // Create Supabase client inside the function to avoid build-time issues
    const supabase = createSupabaseClient();
    
    // Dohvati kategorije iz baze
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .order('name');

    // Dohvati gradove iz baze
    const { data: cities } = await supabase
      .from('cities')
      .select('slug, updated_at')
      .order('name');

    // Dohvati verificirane pružatelje
    const { data: providers } = await supabase
      .from('service_providers')
      .select('id, updated_at')
      .eq('verification_status', 'verified');

    // Kategorije stranice
    const categoryPages = (categories || []).map(category => ({
      url: `${baseUrl}/usluge/${category.slug}`,
      lastModified: new Date(category.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Grad stranice
    const cityPages = (cities || []).map(city => ({
      url: `${baseUrl}/usluge?grad=${city.slug}`,
      lastModified: new Date(city.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Kombinirane kategorija + grad stranice
    const categoryCityPages: MetadataRoute.Sitemap = [];
    for (const category of categories || []) {
      for (const city of cities || []) {
        categoryCityPages.push({
          url: `${baseUrl}/usluge/${category.slug}/${city.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        });
      }
    }

    // Pružatelj profili
    const providerPages = (providers || []).map(provider => ({
      url: `${baseUrl}/pruzatelj/${provider.id}`,
      lastModified: new Date(provider.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [
      ...staticPages,
      ...categoryPages,
      ...cityPages,
      ...categoryCityPages,
      ...providerPages,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Vrati samo statičke stranice ako dođe do greške
    return staticPages;
  }
}
