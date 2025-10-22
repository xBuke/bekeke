import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories || categories.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategorije usluga</h2>
            <p className="text-gray-600">Trenutno nema dostupnih kategorija.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategorije usluga</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Odaberite kategoriju usluge koju tražite i pronađite najbolje pružatelje u vašem gradu
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/usluge/${category.slug}`}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  {/* Icon */}
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon || '🔧'}
                  </div>
                  
                  {/* Category Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  
                  {/* Description */}
                  {category.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  
                  {/* Arrow indicator */}
                  <div className="mt-4 text-blue-600 group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
