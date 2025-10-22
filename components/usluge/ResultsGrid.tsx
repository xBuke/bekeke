'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FilterSidebar from './FilterSidebar';
import FilterModal from './FilterModal';
import ProviderCard from './ProviderCard';
import { Category, City, ProviderWithRelations } from '@/types';

interface ResultsGridProps {
  providers: ProviderWithRelations[];
  categories: Category[];
  cities: City[];
}

export default function ResultsGrid({ providers, categories, cities }: ResultsGridProps) {
  const searchParams = useSearchParams();
  
  // Parse initial filters from URL
  const [initialFilters] = useState({
    kategorija: searchParams.get('kategorija')?.split(',') || [],
    grad: searchParams.get('grad')?.split(',') || [],
    cijena_min: searchParams.get('cijena_min') ? parseInt(searchParams.get('cijena_min')!) : 0,
    cijena_max: searchParams.get('cijena_max') ? parseInt(searchParams.get('cijena_max')!) : 500,
    hitna_intervencija: searchParams.get('hitno') === 'true'
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-8">
            <FilterSidebar 
              categories={categories}
              cities={cities}
              initialFilters={initialFilters}
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="flex-1 min-w-0">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-6">
            <FilterModal 
              categories={categories}
              cities={cities}
              initialFilters={initialFilters}
            />
          </div>

          {/* Results Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {providers.length > 0 
                ? `Pronađeno ${providers.length} pružatelja`
                : 'Nema rezultata'
              }
            </h1>
            {providers.length === 0 && (
              <p className="text-gray-600">
                Pokušajte promijeniti filtere ili pretražiti u drugom gradu.
              </p>
            )}
          </div>

          {/* Results Grid */}
          {providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nema rezultata
              </h3>
              <p className="text-gray-600 mb-6">
                Nismo pronašli pružatelje koji odgovaraju vašim kriterijima.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Pokušajte:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Proširiti raspon cijene</li>
                  <li>• Odabrati druge gradove</li>
                  <li>• Ukloniti filter za hitne intervencije</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
