import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase/server';
import PartnerSidebar from '@/components/dashboard/PartnerSidebar';
import PartnerDashboardContent from '@/components/dashboard/PartnerDashboardContent';
// import { ServiceProvider } from '@/types';

export default async function PružateljDashboard() {
  // Provjeri autentifikaciju i ulogu
  const user = await requireRole(['partner']);

  // Dohvati podatke o pružatelju
  const { data: provider, error } = await supabase
    .from('service_providers')
    .select(`
      *,
      user:users(*)
    `)
    .eq('user_id', user.id)
    .single();

  if (error || !provider) {
    throw new Error('Pružatelj profil nije pronađen');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <PartnerSidebar />
        
        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Pregled</h1>
                <p className="mt-2 text-gray-600">
                  Dobrodošli, {provider.user?.full_name || 'Pružatelju'}!
                </p>
              </div>
              
              <PartnerDashboardContent provider={provider} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
