import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase/server';
import ProfileEditTabs from '@/components/dashboard/ProfileEditTabs';
import { ServiceProvider, Category, City } from '@/types';

export default async function ProviderProfilePage() {
  // Provjeri autentifikaciju i ulogu
  const user = await requireRole(['partner']);

  // Dohvati podatke o partneru s svim relacijama
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
    .eq('user_id', user.id)
    .single();

  if (error || !provider) {
    throw new Error('Partner profil nije pronađen');
  }

  // Transformiraj podatke za lakše korištenje
  const transformedProvider: ServiceProvider = {
    ...provider,
    categories: provider.categories?.map((pc: { category: Category }) => pc.category) || [],
    cities: provider.cities?.map((pc: { city: City }) => pc.city) || [],
    working_hours: provider.working_hours || [],
    gallery: provider.gallery || []
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-lg">
          {/* Sidebar content - same as main dashboard */}
        </div>
        
        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Uredi profil</h1>
                <p className="mt-2 text-gray-600">
                  Upravljaj svojim podacima, uslugama i radnim vremenom
                </p>
              </div>
              
              <ProfileEditTabs provider={transformedProvider} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
