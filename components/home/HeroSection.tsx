'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface City {
  id: string;
  name: string;
  slug: string;
}

interface HeroSectionProps {
  categories: Category[];
  cities: City[];
}

export default function HeroSection({ categories, cities }: HeroSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const router = useRouter();

  const handleSearch = () => {
    if (selectedCategory && selectedCity) {
      router.push(`/usluge/${selectedCategory}/${selectedCity}`);
    } else if (selectedCategory) {
      router.push(`/usluge/${selectedCategory}`);
    } else if (selectedCity) {
      router.push(`/usluge?grad=${selectedCity}`);
    } else {
      router.push('/usluge');
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Pronađite pouzdane majstore u svom gradu
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Povezujemo vas s provjerenim pružateljima usluga. Brzo, sigurno i pouzdano.
          </p>

          {/* Search Bar */}
          <Card className="p-6 max-w-2xl mx-auto shadow-lg">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Select */}
              <div className="flex-1">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberite kategoriju" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Select */}
              <div className="flex-1">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberite grad" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.slug}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                size="lg"
                className="w-full sm:w-auto"
              >
                Pretraži
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
