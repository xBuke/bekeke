'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingWithRelations } from "@/types";

// Lazy load PaymentModal to improve initial page load
const PaymentModal = dynamic(() => import("@/components/bookings/PaymentModal"), {
  loading: () => <p>Učitavanje...</p>,
  ssr: false, // ne renderaj na serveru
});

interface BookingsTableProps {
  bookings: BookingWithRelations[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    bookingId: string;
    amount: number;
    clientSecret: string;
  }>({
    isOpen: false,
    bookingId: '',
    amount: 0,
    clientSecret: ''
  });
  const [loadingPayment, setLoadingPayment] = useState<string | null>(null);

  const handlePayment = async (bookingId: string, amount: number) => {
    setLoadingPayment(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/checkout`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPaymentModal({
          isOpen: true,
          bookingId,
          amount,
          clientSecret: data.clientSecret
        });
      } else {
        console.error('Payment setup failed:', data.error);
        // TODO: Show error toast
      }
    } catch (error) {
      console.error('Payment setup error:', error);
      // TODO: Show error toast
    } finally {
      setLoadingPayment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Čeka odgovor</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Prihvaćeno</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Odbijeno</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Završeno</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Otkazano</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActionButtons = (booking: BookingWithRelations) => {
    switch (booking.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => console.log('Cancel booking:', booking.id)}
            >
              Odustani
            </Button>
            <Button variant="outline" size="sm">
              Detalji
            </Button>
          </div>
        );
      case 'accepted':
        return (
          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handlePayment(booking.id, booking.total_price)}
              disabled={loadingPayment === booking.id}
            >
              {loadingPayment === booking.id ? 'Učitavanje...' : 'Plati'}
            </Button>
            <Button variant="outline" size="sm">
              Detalji
            </Button>
          </div>
        );
      default:
        return (
          <Button variant="outline" size="sm">
            Detalji
          </Button>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hr-HR');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM format
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nemate aktivnih zahtjeva</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium">Pružatelj</th>
              <th className="text-left p-4 font-medium">Usluga</th>
              <th className="text-left p-4 font-medium">Datum</th>
              <th className="text-left p-4 font-medium">Vrijeme</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-muted/50">
                <td className="p-4">
                  <div>
                    <div className="font-medium">
                      {booking.provider.business_name || booking.provider.user.full_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.provider.user.email}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-medium">{booking.service.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {booking.total_price.toFixed(2)}€
                    </div>
                  </div>
                </td>
                <td className="p-4">{formatDate(booking.requested_date)}</td>
                <td className="p-4">{formatTime(booking.requested_time)}</td>
                <td className="p-4">{getStatusBadge(booking.status)}</td>
                <td className="p-4">{getActionButtons(booking)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">
                  {booking.provider.business_name || booking.provider.user.full_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {booking.provider.user.email}
                </p>
              </div>
              {getStatusBadge(booking.status)}
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="font-medium">Usluga:</span>
                <span className="ml-2">{booking.service.title}</span>
              </div>
              <div>
                <span className="font-medium">Cijena:</span>
                <span className="ml-2">{booking.total_price.toFixed(2)}€</span>
              </div>
              <div>
                <span className="font-medium">Datum:</span>
                <span className="ml-2">{formatDate(booking.requested_date)}</span>
              </div>
              <div>
                <span className="font-medium">Vrijeme:</span>
                <span className="ml-2">{formatTime(booking.requested_time)}</span>
              </div>
            </div>
            
            <div className="pt-2">
              {getActionButtons(booking)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        bookingId={paymentModal.bookingId}
        amount={paymentModal.amount}
        clientSecret={paymentModal.clientSecret}
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
