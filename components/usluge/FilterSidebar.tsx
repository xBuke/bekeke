'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Category, City } from '@/types';

interface FilterSidebarProps {
  categories: Category[];
  cities: City[];
  initialFilters?: {
    kategorija?: string[];
    grad?: string[];
    cijena_min?: number;
    cijena_max?: number;
    hitna_intervencija?: boolean;
  };
}

export default function FilterSidebar({ 
  categories, 
  cities, 
  initialFilters = {} 
}: FilterSidebarProps) {
  const router = useRouter();
  
  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters.kategorija || []
  );
  const [selectedCities, setSelectedCities] = useState<string[]>(
    initialFilters.grad || []
  );
  const [priceRange, setPriceRange] = useState<number[]>([
    initialFilters.cijena_min || 0,
    initialFilters.cijena_max || 500
  ]);
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(
    initialFilters.hitna_intervencija || false
  );

  // Update URL when filters change
  const updateURL = () => {
    const params = new URLSearchParams();
    
    if (selectedCategories.length > 0) {
      params.set('kategorija', selectedCategories.join(','));
    }
    if (selectedCities.length > 0) {
      params.set('grad', selectedCities.join(','));
    }
    if (priceRange[0] > 0) {
      params.set('cijena_min', priceRange[0].toString());
    }
    if (priceRange[1] < 500) {
      params.set('cijena_max', priceRange[1].toString());
    }
    if (emergencyOnly) {
      params.set('hitno', 'true');
    }

    const newURL = `${window.location.pathname}?${params.toString()}`;
    router.push(newURL);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCityToggle = (cityId: string) => {
    setSelectedCities(prev => 
      prev.includes(cityId) 
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    );
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedCities([]);
    setPriceRange([0, 500]);
    setEmergencyOnly(false);
    router.push(window.location.pathname);
  };

  return (
    <div className="space-y-6">
      {/* Categories Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kategorije</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <Label 
                htmlFor={`category-${category.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cities Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gradovi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cities.map((city) => (
            <div key={city.id} className="flex items-center space-x-2">
              <Checkbox
                id={`city-${city.id}`}
                checked={selectedCities.includes(city.id)}
                onCheckedChange={() => handleCityToggle(city.id)}
              />
              <Label 
                htmlFor={`city-${city.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {city.name}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Raspon cijene</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {priceRange[0]}€ - {priceRange[1]}€
            </Label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={500}
              min={0}
              step={10}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dodatni filteri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="emergency"
              checked={emergencyOnly}
              onCheckedChange={(checked) => setEmergencyOnly(checked as boolean)}
            />
            <Label 
              htmlFor="emergency"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Hitne intervencije dostupne
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={updateURL} className="flex-1">
          Primijeni filtere
        </Button>
        <Button onClick={handleReset} variant="outline" className="flex-1">
          Resetiraj
        </Button>
      </div>
    </div>
  );
}
