'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GalleryImage } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface GalleryGridProps {
  images: GalleryImage[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nema slika u galeriji</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelectedImage(image.image_url)}
          >
            <Image
              src={image.image_url}
              alt="Galerija radova"
              width={300}
              height={300}
              className="w-full h-full object-cover"
              priority={false} // lazy load by default
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Galerija radova</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative">
              <Image
                src={selectedImage}
                alt="Galerija radova"
                width={800}
                height={600}
                className="w-full h-auto max-h-[80vh] object-contain"
                priority={false} // lazy load by default
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
