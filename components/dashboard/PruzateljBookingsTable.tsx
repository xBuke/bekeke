'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { BookingWithRelations } from '@/types';
import AcceptBookingModal from './AcceptBookingModal';
import RejectBookingModal from './RejectBookingModal';

interface PruzateljBookingsTableProps {
  bookings: BookingWithRelations[];
  onBookingUpdate: () => void;
}

export default function PruzateljBookingsTable({ 
  bookings, 
  onBookingUpdate 
}: PruzateljBookingsTableProps) {
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null);

  const handleAccept = (booking: BookingWithRelations) => {
    setSelectedBooking(booking);
    setAcceptModalOpen(true);
  };

  const handleReject = (booking: BookingWithRelations) => {
    setSelectedBooking(booking);
    setRejectModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hr-HR');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM format
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)}€`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Novi zahtjevi</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nema novih zahtjeva</p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Klijent</th>
                      <th className="text-left py-3 px-2">Usluga</th>
                      <th className="text-left py-3 px-2">Datum</th>
                      <th className="text-left py-3 px-2">Vrijeme</th>
                      <th className="text-left py-3 px-2">Hitno?</th>
                      <th className="text-left py-3 px-2">Cijena</th>
                      <th className="text-left py-3 px-2">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div>
                            <div className="font-medium">{booking.client.full_name}</div>
                            <div className="text-sm text-gray-500">{booking.client.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <div className="font-medium">{booking.service.title}</div>
                            {booking.service.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {booking.service.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">{formatDate(booking.requested_date)}</td>
                        <td className="py-3 px-2">{formatTime(booking.requested_time)}</td>
                        <td className="py-3 px-2">
                          {booking.is_emergency && (
                            <Badge variant="destructive" className="bg-red-500">
                              HITNO
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-2 font-medium">
                          {formatPrice(booking.total_price)}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAccept(booking)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Prihvati
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(booking)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Odbij
                            </Button>
                          </div>
                        </td>
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
                        <h3 className="font-medium text-lg">{booking.client.full_name}</h3>
                        <p className="text-sm text-gray-500">{booking.client.email}</p>
                      </div>
                      {booking.is_emergency && (
                        <Badge variant="destructive" className="bg-red-500">
                          HITNO
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Usluga:</span>
                        <span className="ml-2">{booking.service.title}</span>
                      </div>
                      {booking.service.description && (
                        <div>
                          <span className="font-medium">Opis:</span>
                          <span className="ml-2 text-sm text-gray-600">
                            {booking.service.description}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Datum:</span>
                        <span className="ml-2">{formatDate(booking.requested_date)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Vrijeme:</span>
                        <span className="ml-2">{formatTime(booking.requested_time)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Cijena:</span>
                        <span className="ml-2 font-bold">{formatPrice(booking.total_price)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(booking)}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Prihvati
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(booking)}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Odbij
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedBooking && (
        <>
          <AcceptBookingModal
            booking={selectedBooking}
            isOpen={acceptModalOpen}
            onClose={() => {
              setAcceptModalOpen(false);
              setSelectedBooking(null);
            }}
            onSuccess={() => {
              setAcceptModalOpen(false);
              setSelectedBooking(null);
              onBookingUpdate();
            }}
          />
          <RejectBookingModal
            booking={selectedBooking}
            isOpen={rejectModalOpen}
            onClose={() => {
              setRejectModalOpen(false);
              setSelectedBooking(null);
            }}
            onSuccess={() => {
              setRejectModalOpen(false);
              setSelectedBooking(null);
              onBookingUpdate();
            }}
          />
        </>
      )}
    </>
  );
}
