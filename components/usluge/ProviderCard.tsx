'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getInitials, formatPrice } from '@/lib/utils';
import { ProviderWithRelations } from '@/types';

interface ProviderCardProps {
  provider: ProviderWithRelations;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const displayName = provider.business_name || provider.user.full_name;
  const initials = getInitials(displayName);
  
  // Calculate minimum price from services
  const minPrice = provider.services.length > 0 
    ? Math.min(...provider.services.map(s => s.price))
    : 0;

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        {/* Profile Section */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
            {provider.profile_photo_url ? (
              <Image 
                src={provider.profile_photo_url} 
                alt={displayName}
                width={64}
                height={64}
                className="w-full h-full rounded-full object-cover"
                priority={false} // lazy load by default
              />
            ) : (
              initials
            )}
          </div>
          
          {/* Name and Badges */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
              {displayName}
            </h3>
            
            {/* Verification Badge */}
            {provider.verification_status === 'verified' && (
              <Badge variant="secondary" className="text-green-600 bg-green-50 mb-2">
                ✓ Verificiran
              </Badge>
            )}
            
            {/* Emergency Badge */}
            {provider.emergency_available && (
              <Badge variant="destructive" className="mb-2">
                HITNO
              </Badge>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {provider.categories.slice(0, 3).map((cat, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {cat.category.name}
              </Badge>
            ))}
            {provider.categories.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{provider.categories.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Cities */}
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Lokacije:</span>{' '}
            {provider.cities.map(c => c.city.name).join(', ')}
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-lg font-bold text-blue-600">
            od {formatPrice(minPrice)}
          </p>
        </div>

        {/* Rating (placeholder for now) */}
        <div className="mb-4">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-600">0.0 (0 recenzija)</span>
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/pruzatelj/${provider.id}`}>
          <Button className="w-full">
            Pogledaj profil
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
