'use client';

import { useState, useRef } from 'react';
import { ServiceProvider, GalleryImage } from '@/types';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface GalleryManagementProps {
  provider: ServiceProvider;
}

export default function GalleryManagement({ provider }: GalleryManagementProps) {
  const [gallery, setGallery] = useState<GalleryImage[]>(provider.gallery || []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validation
    if (gallery.length + files.length > MAX_IMAGES) {
      toast.error(`Možete imati maksimalno ${MAX_IMAGES} slika`);
      return;
    }

    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error('Neke slike su prevelike. Maksimalna veličina je 5MB po slici.');
      return;
    }

    if (files.length > 0) {
      handleUpload(files);
    }
  };

  const handleUpload = async (files: File[]) => {
    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${provider.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('provider-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage
          .from('provider-images')
          .getPublicUrl(filePath);

        // Insert gallery record
        const { data: galleryData, error: insertError } = await supabase
          .from('gallery_images')
          .insert({
            provider_id: provider.id,
            image_url: data.publicUrl
          })
          .select()
          .single();

        if (insertError) throw insertError;

        return galleryData;
      });

      const newImages = await Promise.all(uploadPromises);
      setGallery(prev => [...prev, ...newImages]);
      toast.success(`${files.length} slika uspješno dodano!`);

    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Greška pri upload-u slika');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (imageId: string, imageUrl: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovu sliku?')) {
      return;
    }

    try {
      // Extract file path from URL for deletion
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(-2).join('/'); // Get last two parts (gallery/filename)

      // Delete from Storage
      const { error: storageError } = await supabase.storage
        .from('provider-images')
        .remove([filePath]);

      if (storageError) {
        console.warn('Error deleting from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      setGallery(prev => prev.filter(img => img.id !== imageId));
      toast.success('Slika uspješno obrisana!');

    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Greška pri brisanju slike');
    }
  };

  const canAddMore = gallery.length < MAX_IMAGES;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Galerija radova</h3>
        <p className="text-sm text-gray-600">
          Prikažite svoje najbolje radove. Maksimalno {MAX_IMAGES} slika, {MAX_IMAGES - gallery.length} preostalo.
        </p>
      </div>

      {/* Upload Button */}
      <div className="flex justify-between items-center">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={!canAddMore || uploading}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={!canAddMore || uploading}
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Dodaj slike'}
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          {gallery.length}/{MAX_IMAGES} slika
        </div>
      </div>

      {/* Gallery Grid */}
      {gallery.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nema slika u galeriji</p>
          <p className="text-sm text-gray-400">Dodajte slike svojih radova</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((image) => (
            <div key={image.id} className="relative group">
              <Image
                src={image.image_url}
                alt="Gallery"
                width={200}
                height={128}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                onClick={() => handleDelete(image.id, image.image_url)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Uploading slika...</span>
          </div>
        </div>
      )}

      {/* File Requirements */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <p><strong>Zahtjevi za slike:</strong></p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Maksimalna veličina: 5MB po slici</li>
          <li>Podržani formati: JPG, PNG, WebP</li>
          <li>Maksimalno {MAX_IMAGES} slika ukupno</li>
        </ul>
      </div>
    </div>
  );
}
