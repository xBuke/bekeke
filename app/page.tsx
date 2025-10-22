import { supabase } from '@/lib/supabase/client';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';

// Server Component - fetch data on server side
async function getCategories() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return categories || [];
}

async function getCities() {
  const { data: cities, error } = await supabase
    .from('cities')
    .select('id, name, slug')
    .order('name');

  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }

  return cities || [];
}

export default async function Home() {
  // Fetch data in parallel
  const [categories, cities] = await Promise.all([
    getCategories(),
    getCities()
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection categories={categories} cities={cities} />
      
      {/* Category Grid */}
      <CategoryGrid categories={categories} />
    </main>
  );
}