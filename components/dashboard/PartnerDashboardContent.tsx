'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from './StatsCard';
import PartnerBookingsTable from './PartnerBookingsTable';
import ApprovedBookingsList from './ApprovedBookingsList';
import { BookingWithRelations, ServiceProvider } from '@/types';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Calendar, Euro, Users } from 'lucide-react';

interface PartnerDashboardContentProps {
  provider: ServiceProvider;
}

export default function PartnerDashboardContent({ provider }: PartnerDashboardContentProps) {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingCount: 0,
    acceptedThisMonth: 0,
    totalEarnings: 0
  });

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData: BookingWithRelations[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const pendingBookings = bookingsData.filter(b => b.status === 'pending');
    const acceptedThisMonth = bookingsData.filter(b => 
      b.status === 'accepted' && 
      new Date(b.created_at) >= startOfMonth
    );
    
    // Calculate total earnings from completed payments
    const completedBookings = bookingsData.filter(b => b.status === 'completed');
    const totalEarnings = completedBookings.reduce((sum, booking) => {
      if (booking.payment && booking.payment.status === 'completed') {
        return sum + booking.payment.provider_amount;
      }
      return sum;
    }, 0);

    setStats({
      pendingCount: pendingBookings.length,
      acceptedThisMonth: acceptedThisMonth.length,
      totalEarnings
    });
  };

  useEffect(() => {
    fetchBookings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  
  // Approved bookings for next 7 days
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const approvedBookings = bookings.filter(b => {
    if (b.status !== 'accepted') return false;
    const bookingDate = new Date(b.requested_date);
    return bookingDate >= now && bookingDate <= nextWeek;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification warning */}
      {provider.verification_status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Vaš profil čeka verifikaciju
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Privremeno ne primate nove zahtjeve. Administrator će pregledati vaš profil ubrzo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Novi zahtjevi"
          count={stats.pendingCount}
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Odobreno ovaj mjesec"
          count={stats.acceptedThisMonth}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatsCard
          title="Ukupna zarada"
          count={stats.totalEarnings.toFixed(2) + '€'}
          icon={<Euro className="h-4 w-4" />}
        />
      </div>

      {/* New bookings table */}
      <PartnerBookingsTable 
        bookings={pendingBookings}
        onBookingUpdate={fetchBookings}
      />

      {/* Approved bookings for next 7 days */}
      <ApprovedBookingsList bookings={approvedBookings} />
    </div>
  );
}
