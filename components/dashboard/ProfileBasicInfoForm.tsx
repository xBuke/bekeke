'use client';

import { useState, useEffect } from 'react';
import { ServiceProvider, Category, City } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Upload, User } from 'lucide-react';
import Image from 'next/image';

interface ProfileBasicInfoFormProps {
  provider: ServiceProvider;
}

export default function ProfileBasicInfoForm({ provider }: ProfileBasicInfoFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [formData, setFormData] = useState({
    business_name: provider.business_name || '',
    description: provider.description || '',
    emergency_available: provider.emergency_available,
    emergency_fee: provider.emergency_fee || 0,
    selected_categories: provider.categories?.map(c => c.id) || [],
    selected_cities: provider.cities?.map(c => c.id) || [],
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    provider.profile_photo_url || null
  );

  // Fetch categories and cities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, citiesRes] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase.from('cities').select('*').order('name')
        ]);

        if (categoriesRes.data) setCategories(categoriesRes.data);
        if (citiesRes.data) setCities(citiesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Greška pri učitavanju podataka');
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Slika je prevelika. Maksimalna veličina je 5MB.');
        return;
      }
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload profile photo if changed
      let profilePhotoUrl = provider.profile_photo_url;
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `${provider.id}-${Date.now()}.${fileExt}`;
        const filePath = `profile-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('provider-images')
          .upload(filePath, profilePhoto);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('provider-images')
          .getPublicUrl(filePath);

        profilePhotoUrl = data.publicUrl;
      }

      // Update provider data
      const { error: providerError } = await supabase
        .from('service_providers')
        .update({
          business_name: formData.business_name,
          description: formData.description,
          emergency_available: formData.emergency_available,
          emergency_fee: formData.emergency_available ? formData.emergency_fee : null,
          profile_photo_url: profilePhotoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', provider.id);

      if (providerError) throw providerError;

      // Update categories
      await supabase
        .from('provider_categories')
        .delete()
        .eq('provider_id', provider.id);

      if (formData.selected_categories.length > 0) {
        const categoryInserts = formData.selected_categories.map(categoryId => ({
          provider_id: provider.id,
          category_id: categoryId
        }));

        const { error: categoriesError } = await supabase
          .from('provider_categories')
          .insert(categoryInserts);

        if (categoriesError) throw categoriesError;
      }

      // Update cities
      await supabase
        .from('provider_cities')
        .delete()
        .eq('provider_id', provider.id);

      if (formData.selected_cities.length > 0) {
        const cityInserts = formData.selected_cities.map(cityId => ({
          provider_id: provider.id,
          city_id: cityId
        }));

        const { error: citiesError } = await supabase
          .from('provider_cities')
          .insert(cityInserts);

        if (citiesError) throw citiesError;
      }

      toast.success('Profil uspješno ažuriran!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Greška pri ažuriranju profila');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions: MultiSelectOption[] = categories.map(cat => ({
    label: cat.name,
    value: cat.id
  }));

  const cityOptions: MultiSelectOption[] = cities.map(city => ({
    label: city.name,
    value: city.id
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Photo */}
      <div className="space-y-2">
        <Label>Profilna fotografija</Label>
        <div className="flex items-center space-x-4">
          <div className="relative">
            {profilePhotoPreview ? (
              <Image
                src={profilePhotoPreview}
                alt="Profile"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              id="profile-photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <Label htmlFor="profile-photo" className="cursor-pointer">
              <Button type="button" variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {profilePhotoPreview ? 'Promijeni sliku' : 'Dodaj sliku'}
                </span>
              </Button>
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              Maksimalna veličina: 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="business_name">Naziv obrta</Label>
        <Input
          id="business_name"
          value={formData.business_name}
          onChange={(e) => handleInputChange('business_name', e.target.value)}
          placeholder="Unesite naziv obrta (opciono)"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Opis usluga</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Opišite svoje usluge i iskustvo..."
          rows={4}
        />
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Label>Kategorije usluga</Label>
        <MultiSelect
          options={categoryOptions}
          selected={formData.selected_categories}
          onChange={(selected) => handleInputChange('selected_categories', selected)}
          placeholder="Odaberite kategorije..."
        />
      </div>

      {/* Cities */}
      <div className="space-y-2">
        <Label>Gradovi u kojima radite</Label>
        <MultiSelect
          options={cityOptions}
          selected={formData.selected_cities}
          onChange={(selected) => handleInputChange('selected_cities', selected)}
          placeholder="Odaberite gradove..."
        />
      </div>

      {/* Emergency Services */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="emergency_available"
            checked={formData.emergency_available}
            onCheckedChange={(checked) => 
              handleInputChange('emergency_available', checked)
            }
          />
          <Label htmlFor="emergency_available">
            Dostupan za hitne intervencije
          </Label>
        </div>

        {formData.emergency_available && (
          <div className="space-y-2">
            <Label htmlFor="emergency_fee">Dodatna naknada za hitno (€)</Label>
            <Input
              id="emergency_fee"
              type="number"
              min="0"
              step="0.01"
              value={formData.emergency_fee}
              onChange={(e) => handleInputChange('emergency_fee', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Spremanje...' : 'Spremi promjene'}
        </Button>
      </div>
    </form>
  );
}
