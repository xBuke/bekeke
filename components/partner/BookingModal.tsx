'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceProvider } from '@/types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ServiceProvider;
}

export default function BookingModal({ isOpen, onClose, provider }: BookingModalProps) {
  const [selectedService, setSelectedService] = useState<string>('');
  const [requestedDate, setRequestedDate] = useState<string>('');
  const [requestedTime, setRequestedTime] = useState<string>('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [clientNotes, setClientNotes] = useState('');

  // Calculate total price
  const selectedServiceData = provider.services?.find(s => s.id === selectedService);
  const basePrice = selectedServiceData?.price || 0;
  const emergencyFee = isEmergency && provider.emergency_available ? (provider.emergency_fee || 0) : 0;
  const totalPrice = basePrice + emergencyFee;

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedService('');
      setRequestedDate('');
      setRequestedTime('');
      setIsEmergency(false);
      setClientNotes('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in (for now, just redirect to login)
    // In a real implementation, you'd check the session
    if (!selectedService || !requestedDate || !requestedTime) {
      alert('Molimo popunite sva obavezna polja');
      return;
    }

    // Validate date is not in the past
    if (new Date(requestedDate) < new Date()) {
      alert('Datum ne može biti u prošlosti');
      return;
    }

    // For now, just log the booking data
    console.log('Booking request:', {
      provider_id: provider.id,
      service_id: selectedService,
      requested_date: requestedDate,
      requested_time: requestedTime,
      is_emergency: isEmergency,
      client_notes: clientNotes,
      total_price: totalPrice
    });

    // TODO: Implement actual booking creation
    alert('Zahtjev je poslan! (Demo - stvarni booking će biti implementiran kasnije)');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 sm:mx-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pošalji upit za uslugu</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Selection */}
          <div>
            <Label htmlFor="service">Usluga *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Odaberite uslugu" />
              </SelectTrigger>
              <SelectContent>
                {provider.services?.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.title} - {service.price}€{service.price_type === 'hourly' ? '/sat' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div>
            <Label htmlFor="date">Datum *</Label>
            <Input
              id="date"
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              min={today}
              required
            />
          </div>

          {/* Time Selection */}
          <div>
            <Label htmlFor="time">Vrijeme *</Label>
            <Input
              id="time"
              type="time"
              value={requestedTime}
              onChange={(e) => setRequestedTime(e.target.value)}
              required
            />
          </div>

          {/* Emergency Checkbox */}
          {provider.emergency_available && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emergency"
                checked={isEmergency}
                onCheckedChange={(checked) => setIsEmergency(checked as boolean)}
              />
              <Label htmlFor="emergency">
                Hitna intervencija (+{provider.emergency_fee}€)
              </Label>
            </div>
          )}

          {/* Client Notes */}
          <div>
            <Label htmlFor="notes">Dodatne napomene</Label>
            <Textarea
              id="notes"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="Opišite što trebate..."
              rows={3}
            />
          </div>

          {/* Price Display */}
          {selectedService && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Cijena usluge:</span>
                  <span>{basePrice}€</span>
                </div>
                {isEmergency && provider.emergency_available && (
                  <div className="flex justify-between">
                    <span>Hitna intervencija:</span>
                    <span>+{emergencyFee}€</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Ukupno:</span>
                  <span>{totalPrice}€</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Odustani
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedService || !requestedDate || !requestedTime}
              className="flex-1"
            >
              Nastavi na plaćanje
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
