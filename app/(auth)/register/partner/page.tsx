'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
}

interface City {
  id: string
  name: string
}

export default function RegisterPartnerPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    business_name: '',
    oib: '',
    description: '',
    categories: [] as string[],
    cities: [] as string[],
    emergency_available: false,
    emergency_fee: '',
    acceptTerms: false
  })
  const [idCardFile, setIdCardFile] = useState<File | null>(null)
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  // Fetch categories and cities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, citiesRes] = await Promise.all([
          supabase.from('categories').select('id, name').order('name'),
          supabase.from('cities').select('id, name').order('name')
        ])

        if (categoriesRes.data) setCategories(categoriesRes.data)
        if (citiesRes.data) setCities(citiesRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Greška pri učitavanju podataka')
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'idCard' | 'profilePhoto') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Datoteka je prevelika. Maksimalna veličina je 5MB.')
      return
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      toast.error('Molimo odaberite sliku.')
      return
    }

    if (type === 'idCard') {
      setIdCardFile(file)
    } else {
      setProfilePhotoFile(file)
    }
  }

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error('Molimo unesite puno ime')
      return false
    }

    if (!formData.email.trim()) {
      toast.error('Molimo unesite email')
      return false
    }

    if (!formData.email.includes('@')) {
      toast.error('Molimo unesite valjan email')
      return false
    }

    if (!formData.phone.trim()) {
      toast.error('Molimo unesite broj telefona')
      return false
    }

    const phoneRegex = /^[0-9]{9,10}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      toast.error('Molimo unesite valjan broj telefona (9-10 znamenki)')
      return false
    }

    if (!formData.password) {
      toast.error('Molimo unesite lozinku')
      return false
    }

    if (formData.password.length < 8) {
      toast.error('Lozinka mora imati najmanje 8 znakova')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Lozinke se ne podudaraju')
      return false
    }

    if (!formData.oib || formData.oib.length !== 11 || !/^\d{11}$/.test(formData.oib)) {
      toast.error('OIB mora imati točno 11 znamenki')
      return false
    }

    if (!formData.description || formData.description.length < 50) {
      toast.error('Opis mora imati najmanje 50 znakova')
      return false
    }

    if (formData.categories.length === 0) {
      toast.error('Morate odabrati najmanje jednu kategoriju')
      return false
    }

    if (formData.cities.length === 0) {
      toast.error('Morate odabrati najmanje jedan grad')
      return false
    }

    if (!idCardFile) {
      toast.error('Morate priložiti osobu iskaznicu')
      return false
    }

    if (formData.emergency_available && (!formData.emergency_fee || parseFloat(formData.emergency_fee) <= 0)) {
      toast.error('Molimo unesite valjanu dodatnu naknadu za hitne intervencije')
      return false
    }

    if (!formData.acceptTerms) {
      toast.error('Morate prihvatiti uvjete korištenja')
      return false
    }

    return true
  }

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('provider-documents')
      .upload(path, file)

    if (error) {
      throw new Error(`Greška pri upload-u: ${error.message}`)
    }

    return data
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Upload files first
      const userId = `temp-${Date.now()}` // Temporary ID for file path
      const idCardPath = `${userId}/id-card-${Date.now()}.${idCardFile!.name.split('.').pop()}`
      const profilePhotoPath = profilePhotoFile 
        ? `${userId}/profile-${Date.now()}.${profilePhotoFile.name.split('.').pop()}`
        : null

      // Upload ID card
      await uploadFile(idCardFile!, idCardPath)
      
      // Upload profile photo if provided
      let profilePhotoUrl = null
      if (profilePhotoFile) {
        await uploadFile(profilePhotoFile, profilePhotoPath!)
        const { data: profileData } = supabase.storage
          .from('provider-documents')
          .getPublicUrl(profilePhotoPath!)
        profilePhotoUrl = profileData.publicUrl
      }

      // Get ID card URL
      const { data: idCardData } = supabase.storage
        .from('provider-documents')
        .getPublicUrl(idCardPath)

      // Submit registration
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'partner',
          id_card_url: idCardData.publicUrl,
          profile_photo_url: profilePhotoUrl,
          emergency_fee: formData.emergency_available ? parseFloat(formData.emergency_fee) : null
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Registracija uspješna! Vaš račun čeka verifikaciju.')
        router.push('/partner/dashboard')
      } else {
        toast.error(data.error || 'Dogodila se greška tijekom registracije')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Dogodila se greška. Molimo pokušajte ponovno.')
    } finally {
      setIsLoading(false)
    }
  }

  const categoryOptions: MultiSelectOption[] = categories.map(cat => ({
    label: cat.name,
    value: cat.id
  }))

  const cityOptions: MultiSelectOption[] = cities.map(city => ({
    label: city.name,
    value: city.id
  }))

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Registracija partnera</CardTitle>
            <CardDescription className="text-center">
              Unesite svoje podatke za kreiranje partnerskog računa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Osnovni podaci</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Puno ime *</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder="Ivan Horvat"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_name">Naziv obrta</Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      type="text"
                      placeholder="Horvat d.o.o."
                      value={formData.business_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="ivan@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Broj telefona *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="0912345678"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oib">OIB *</Label>
                  <Input
                    id="oib"
                    name="oib"
                    type="text"
                    placeholder="12345678901"
                    value={formData.oib}
                    onChange={handleInputChange}
                    maxLength={11}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Opis usluga *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Opisite usluge koje nudite..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    {formData.description.length}/50 znakova (minimum 50)
                  </p>
                </div>
              </div>

              {/* Categories and Cities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Kategorije i lokacije</h3>
                
                <div className="space-y-2">
                  <Label>Kategorije usluga *</Label>
                  <MultiSelect
                    options={categoryOptions}
                    selected={formData.categories}
                    onChange={(selected) => setFormData(prev => ({ ...prev, categories: selected }))}
                    placeholder="Odaberite kategorije..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gradovi u kojima radite *</Label>
                  <MultiSelect
                    options={cityOptions}
                    selected={formData.cities}
                    onChange={(selected) => setFormData(prev => ({ ...prev, cities: selected }))}
                    placeholder="Odaberite gradove..."
                  />
                </div>
              </div>

              {/* Emergency Services */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Hitne intervencije</h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency_available"
                    name="emergency_available"
                    checked={formData.emergency_available}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emergency_available: !!checked }))}
                  />
                  <Label htmlFor="emergency_available">Nudim hitne intervencije</Label>
                </div>

                {formData.emergency_available && (
                  <div className="space-y-2">
                    <Label htmlFor="emergency_fee">Dodatna naknada za hitno (€) *</Label>
                    <Input
                      id="emergency_fee"
                      name="emergency_fee"
                      type="number"
                      placeholder="50"
                      value={formData.emergency_fee}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>

              {/* File Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dokumenti</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="id_card">Osobna iskaznica *</Label>
                  <Input
                    id="id_card"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'idCard')}
                    required
                  />
                  {idCardFile && (
                    <p className="text-sm text-green-600">
                      Odabrana datoteka: {idCardFile.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile_photo">Profilna fotografija</Label>
                  <Input
                    id="profile_photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profilePhoto')}
                  />
                  {profilePhotoFile && (
                    <p className="text-sm text-green-600">
                      Odabrana datoteka: {profilePhotoFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lozinka</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Lozinka *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Najmanje 8 znakova"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Potvrdite lozinku *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Ponovite lozinku"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptTerms: !!checked }))}
                />
                <Label htmlFor="acceptTerms" className="text-sm">
                  Prihvaćam uvjete korištenja *
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Registriranje...' : 'Registriraj se'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Već imate račun?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Prijavite se
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
