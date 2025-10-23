import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseClient } from '@/lib/supabase/api-client';
import ProfilContent from '@/components/profil/ProfilContent';

async function fetchProfileData(userId: string, userRole: string) {
  try {
    // Create Supabase client with service role key
    const supabase = createSupabaseClient();
    
    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    let providerData = null;
    
    // If user is a partner, fetch provider data
    if (userRole === 'partner') {
      const { data: provider, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!providerError && provider) {
        providerData = provider;
      }
    }

    return {
      user: userData,
      provider: providerData
    };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return null;
  }
}

export default async function ProfilPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const profileData = await fetchProfileData(user.id, user.role);
  
  if (!profileData) {
    redirect('/login');
  }
  
  return <ProfilContent profileData={profileData} />;
}
