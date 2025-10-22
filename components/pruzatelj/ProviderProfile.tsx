'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BookingModal from './BookingModal';
import GalleryGrid from './GalleryGrid';
import WorkingHoursTable from './WorkingHoursTable';
import { ServiceProvider } from '@/types';

interface ProviderProfileProps {
  provider: ServiceProvider;
}

export default function ProviderProfile({ provider }: ProviderProfileProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const displayName = provider.business_name || provider.user?.full_name || 'Nepoznato';
  const initials = displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Helper functions to handle different data structures
  const getCategoryName = (cat: unknown) => {
    if (typeof cat === 'object' && cat !== null && 'category' in cat) {
      return (cat as { category: { name: string } }).category.name;
    }
    return (cat as { name: string }).name;
  };

  const getCityName = (city: unknown) => {
    if (typeof city === 'object' && city !== null && 'city' in city) {
      return (city as { city: { name: string } }).city.name;
    }
    return (city as { name: string }).name;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Card className="p-6">
              {/* Profile Photo */}
              <div className="flex justify-center mb-6">
                {provider.profile_photo_url ? (
                  <Image
                    src={provider.profile_photo_url}
                    alt={displayName}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover"
                    priority={false} // lazy load by default
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {initials}
                    </span>
                  </div>
                )}
              </div>

              {/* Provider Info */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {displayName}
                </h1>
                
                {/* Categories */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {provider.categories?.map((cat, index) => (
                    <Badge key={index} variant="secondary">
                      {getCategoryName(cat)}
                    </Badge>
                  ))}
                </div>

                {/* Cities */}
                <div className="text-sm text-gray-600 mb-4">
                  <p className="font-medium">Pokriva gradove:</p>
                  <p>{provider.cities?.map(c => getCityName(c)).join(', ')}</p>
                </div>

                {/* Verification Badge */}
                {provider.verification_status === 'verified' && (
                  <Badge className="mb-2 bg-green-100 text-green-800">
                    ✓ Verificiran
                  </Badge>
                )}

                {/* Emergency Badge */}
                {provider.emergency_available && (
                  <Badge className="mb-2 bg-red-100 text-red-800">
                    🚨 Hitne intervencije dostupno
                  </Badge>
                )}

                {/* Rating (hardcoded for now) */}
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-gray-900">0.0</div>
                  <div className="text-sm text-gray-600">Još nema recenzija</div>
                </div>

                {/* CTA Button */}
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  Pošalji upit
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column - Scrollable Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* O meni sekcija */}
          <Card>
            <CardHeader>
              <CardTitle>O meni</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {provider.description || 'Nema opisa dostupnog.'}
              </p>
            </CardContent>
          </Card>

          {/* Usluge i cijene */}
          <Card>
            <CardHeader>
              <CardTitle>Usluge i cijene</CardTitle>
            </CardHeader>
            <CardContent>
              {provider.services && provider.services.length > 0 ? (
                <div className="space-y-4">
                  {provider.services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{service.title}</h3>
                        <span className="text-xl font-bold text-blue-600">
                          {service.price}€
                          {service.price_type === 'hourly' && '/sat'}
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-gray-600 mb-2">{service.description}</p>
                      )}
                      {service.duration_minutes && (
                        <p className="text-sm text-gray-500">
                          Trajanje: {service.duration_minutes} minuta
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nema usluga dostupnih.</p>
              )}
            </CardContent>
          </Card>

          {/* Radno vrijeme */}
          <Card>
            <CardHeader>
              <CardTitle>Radno vrijeme</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkingHoursTable workingHours={provider.working_hours || []} />
            </CardContent>
          </Card>

          {/* Galerija radova */}
          <Card>
            <CardHeader>
              <CardTitle>Galerija radova</CardTitle>
            </CardHeader>
            <CardContent>
              <GalleryGrid images={provider.gallery || []} />
            </CardContent>
          </Card>

          {/* Recenzije */}
          <Card>
            <CardHeader>
              <CardTitle>Recenzije</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">Još nema recenzija</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        provider={provider}
      />
    </>
  );
}
