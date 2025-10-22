'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingWithRelations } from '@/types';

interface ApprovedBookingsListProps {
  bookings: BookingWithRelations[];
}

export default function ApprovedBookingsList({ bookings }: ApprovedBookingsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hr-HR');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)}€`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Odobreni zahtjevi (sljedećih 7 dana)</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nema odobrenih zahtjeva za sljedećih 7 dana</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div>
                        <h4 className="font-medium">{booking.client.full_name}</h4>
                        <p className="text-sm text-gray-500">{booking.service.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(booking.total_price)}</p>
                        {booking.is_emergency && (
                          <span className="text-xs text-red-600">Hitna intervencija</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Datum i vrijeme:</p>
                        <p className="font-medium">
                          {formatDate(booking.requested_date)} u {formatTime(booking.requested_time)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">Kontakt:</p>
                        <div className="space-y-1">
                          <p className="font-medium">{booking.client.email}</p>
                          {booking.client.phone && (
                            <p className="font-medium">{booking.client.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {booking.client_notes && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500">Napomene klijenta:</p>
                        <p className="text-sm bg-gray-50 p-2 rounded">{booking.client_notes}</p>
                      </div>
                    )}

                    {booking.provider_notes && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500">Vaše napomene:</p>
                        <p className="text-sm bg-blue-50 p-2 rounded">{booking.provider_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
