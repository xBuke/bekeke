import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ProfilContent from '@/components/profil/ProfilContent';

async function fetchProfileData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/profil`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile data');
    }
    
    const result = await response.json();
    return result.data;
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
  
  const profileData = await fetchProfileData();
  
  if (!profileData) {
    redirect('/login');
  }
  
  return <ProfilContent profileData={profileData} />;
}
