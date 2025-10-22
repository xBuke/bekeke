'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookingWithRelations } from '@/types';
import toast from 'react-hot-toast';

interface AcceptBookingModalProps {
  booking: BookingWithRelations;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AcceptBookingModal({
  booking,
  isOpen,
  onClose,
  onSuccess
}: AcceptBookingModalProps) {
  const [providerNotes, setProviderNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/bookings/${booking.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_notes: providerNotes.trim() || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri prihvaćanju zahtjeva');
      }

      toast.success('Zahtjev uspješno prihvaćen!');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Greška pri prihvaćanju zahtjeva');
    } finally {
      setLoading(false);
    }
  };

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle>Prihvati zahtjev</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Booking details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Klijent</Label>
              <p className="font-medium">{booking.client.full_name}</p>
              <p className="text-sm text-gray-500">{booking.client.email}</p>
              {booking.client.phone && (
                <p className="text-sm text-gray-500">{booking.client.phone}</p>
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-500">Usluga</Label>
              <p className="font-medium">{booking.service.title}</p>
              {booking.service.description && (
                <p className="text-sm text-gray-500">{booking.service.description}</p>
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-500">Datum i vrijeme</Label>
              <p className="font-medium">
                {formatDate(booking.requested_date)} u {formatTime(booking.requested_time)}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-500">Cijena</Label>
              <p className="font-medium text-lg">{formatPrice(booking.total_price)}</p>
              {booking.is_emergency && (
                <p className="text-sm text-red-600">+ Hitna intervencija</p>
              )}
            </div>
          </div>

          {/* Client notes */}
          {booking.client_notes && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Napomene klijenta</Label>
              <p className="mt-1 p-3 bg-gray-50 rounded-md">{booking.client_notes}</p>
            </div>
          )}

          {/* Provider message */}
          <div>
            <Label htmlFor="provider-notes" className="text-sm font-medium">
              Poruka klijentu (opciono)
            </Label>
            <Textarea
              id="provider-notes"
              placeholder="Dodajte poruku klijentu..."
              value={providerNotes}
              onChange={(e) => setProviderNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Odustani
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Prihvata se...' : 'Prihvati zahtjev'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
