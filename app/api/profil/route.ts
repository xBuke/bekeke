import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await requireAuth();

    // Fetch user data with role-specific information
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let providerData = null;
    
    // If user is a partner, fetch provider data
    if (userData.role === 'partner') {
      const { data: provider, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!providerError && provider) {
        providerData = provider;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        provider: providerData
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { full_name, phone, avatar_url, business_name, description } = body;

    // Update user basic info
    const { error: userError } = await supabase
      .from('users')
      .update({
        full_name,
        phone,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (userError) {
      throw userError;
    }

    // If user is a partner, update provider data
    if (business_name !== undefined || description !== undefined) {
      const { error: providerError } = await supabase
        .from('service_providers')
        .update({
          business_name,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (providerError) {
        throw providerError;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
