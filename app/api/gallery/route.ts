import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

// POST - upload images to Supabase Storage and create gallery records
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Get provider ID for the user
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check current gallery count
    const { data: currentGallery, error: countError } = await supabase
      .from('gallery_images')
      .select('id')
      .eq('provider_id', provider.id);

    if (countError) {
      throw countError;
    }

    const MAX_IMAGES = 10;
    if (currentGallery.length + files.length > MAX_IMAGES) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_IMAGES} images allowed` },
        { status: 400 }
      );
    }

    // Upload files and create gallery records
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${provider.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('provider-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('provider-images')
        .getPublicUrl(filePath);

      // Create gallery record
      const { data: galleryData, error: insertError } = await supabase
        .from('gallery_images')
        .insert({
          provider_id: provider.id,
          image_url: data.publicUrl
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return galleryData;
    });

    const uploadedImages = await Promise.all(uploadPromises);

    return NextResponse.json({ 
      success: true, 
      data: uploadedImages 
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

// GET - fetch gallery images for the authenticated provider
export async function GET() {
  try {
    const user = await requireAuth();

    // Get provider ID for the user
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Fetch gallery images
    const { data: gallery, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: gallery });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}

// DELETE - delete gallery image
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Get provider ID for the user
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Get image data first
    const { data: image, error: imageError } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('id', imageId)
      .eq('provider_id', provider.id)
      .single();

    if (imageError || !image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Extract file path from URL for deletion
    const urlParts = image.image_url.split('/');
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

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
