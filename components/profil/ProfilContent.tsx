'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, Phone, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfilContentProps {
  profileData: {
    user: {
      id: string;
      email: string;
      full_name: string;
      phone?: string;
      avatar_url?: string;
      role: string;
      created_at: string;
    };
    provider?: {
      id: string;
      business_name?: string;
      description?: string;
      verification_status: string;
    };
  };
}

export default function ProfilContent({ profileData }: ProfilContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profileData.user.full_name,
    phone: profileData.user.phone || '',
    business_name: profileData.provider?.business_name || '',
    description: profileData.provider?.description || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Profil je uspješno ažuriran!');
        setIsEditing(false);
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        toast.error(result.error || 'Greška pri ažuriranju profila');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Dogodila se greška. Molimo pokušajte ponovno.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profileData.user.full_name,
      phone: profileData.user.phone || '',
      business_name: profileData.provider?.business_name || '',
      description: profileData.provider?.description || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Moj Profil</h1>
          <p className="mt-2 text-gray-600">
            Upravljajte svojim osobnim podacima i postavkama
          </p>
        </div>

        <div className="grid gap-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Osnovni podaci
              </CardTitle>
              <CardDescription>
                Vaši osnovni podaci i kontakt informacije
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Ime i prezime</Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Vaše ime i prezime"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {profileData.user.full_name}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {profileData.user.email}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Email adresa se ne može mijenjati
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Vaš broj telefona"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {profileData.user.phone || 'Nije uneseno'}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Uloga</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {profileData.user.role === 'klijent' ? 'Klijent' : 
                     profileData.user.role === 'partner' ? 'Partner' : 'Administrator'}
                  </div>
                </div>
              </div>

              <div>
                <Label>Član od</Label>
                <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  {new Date(profileData.user.created_at).toLocaleDateString('hr-HR')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Info Card (for partners) */}
          {profileData.provider && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Poslovni podaci
                </CardTitle>
                <CardDescription>
                  Informacije o vašem poslovanju
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="business_name">Naziv tvrtke</Label>
                  {isEditing ? (
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      placeholder="Naziv vaše tvrtke"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {profileData.provider.business_name || 'Nije uneseno'}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Opis usluga</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Opisite svoje usluge..."
                      rows={4}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md min-h-[100px]">
                      {profileData.provider.description || 'Nije uneseno'}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Status verifikacije</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profileData.provider.verification_status === 'verified' 
                        ? 'bg-green-100 text-green-800'
                        : profileData.provider.verification_status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {profileData.provider.verification_status === 'verified' ? 'Verificiran' :
                       profileData.provider.verification_status === 'rejected' ? 'Odbijen' : 'Na čekanju'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  Odustani
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Spremam...' : 'Spremi promjene'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Uredi profil
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
