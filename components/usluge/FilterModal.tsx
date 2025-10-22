'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import FilterSidebar from './FilterSidebar';
import { Category, City } from '@/types';

interface FilterModalProps {
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

export default function FilterModal({ 
  categories, 
  cities, 
  initialFilters = {} 
}: FilterModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <Filter className="w-4 h-4 mr-2" />
          Filteri
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filteri pretrage</DialogTitle>
        </DialogHeader>
        <FilterSidebar 
          categories={categories}
          cities={cities}
          initialFilters={initialFilters}
        />
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={() => setOpen(false)} 
            className="flex-1"
          >
            Zatvori
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
