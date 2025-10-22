import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { KlijentDashboardContent } from '@/components/dashboard/KlijentDashboardContent';
import { BookingWithRelations } from '@/types';

async function fetchBookings(): Promise<BookingWithRelations[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bookings`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

export default async function KlijentDashboard() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  if (user.role !== 'klijent') {
    redirect('/');
  }
  
  const bookings = await fetchBookings();
  
  return <KlijentDashboardContent bookings={bookings} />;
}
