import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import ProviderProfile from '@/components/pruzatelj/ProviderProfile';
import { ServiceProvider } from '@/types';
import { seoConfig, generatePageTitle, generatePageDescription } from '@/lib/seo-config';
import type { Metadata } from 'next';

interface ProviderPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProvider(id: string): Promise<ServiceProvider | null> {
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
    .eq('id', id)
    .eq('verification_status', 'verified')
    .single();

  if (error || !provider) {
    return null;
  }

  return provider;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const provider = await getProvider(resolvedParams.id);

  if (!provider) {
    return {
      title: 'Pružatelj nije pronađen',
      description: 'Traženi pružatelj usluga nije pronađen.',
    };
  }

  const providerName = provider.business_name || provider.user?.full_name || 'Pružatelj';
  const categories = (provider as any).categories?.map((cat: any) => cat.category?.name).filter(Boolean).join(', ') || 'Usluge';
  const cities = (provider as any).cities?.map((city: any) => city.city?.name).filter(Boolean).join(', ') || 'Hrvatska';
  
  const title = generatePageTitle(`${providerName} - ${categories}`);
  const description = generatePageDescription(
    `${providerName} - ${categories} u ${cities}. ${provider.description || 'Profesionalni pružatelj usluga s dugogodišnjim iskustvom.'} Provjereni pružatelj s recenzijama.`,
    cities,
    categories
  );

  return {
    title,
    description,
    keywords: [
      providerName.toLowerCase(),
      categories.toLowerCase(),
      cities.toLowerCase(),
      'pružatelj',
      'usluge',
      'majstor'
    ],
    openGraph: {
      title: `${providerName} - ${categories}`,
      description,
      url: `${seoConfig.url}/pruzatelj/${resolvedParams.id}`,
      siteName: seoConfig.name,
      locale: seoConfig.locale,
      type: 'profile',
      images: provider.profile_photo_url ? [
        {
          url: provider.profile_photo_url,
          width: 400,
          height: 400,
          alt: providerName,
        },
      ] : [
        {
          url: seoConfig.ogImage,
          width: 1200,
          height: 630,
          alt: providerName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${providerName} - ${categories}`,
      description,
    },
  };
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const resolvedParams = await params;
  const provider = await getProvider(resolvedParams.id);

  if (!provider) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ProviderProfile provider={provider} />
      </div>
    </div>
  );
}
