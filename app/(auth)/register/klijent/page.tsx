'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

export default function RegisterKlijentPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
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

    // Croatian phone number validation (basic)
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

    if (!formData.acceptTerms) {
      toast.error('Morate prihvatiti uvjete korištenja')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'klijent'
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Registracija uspješna! Prijavljujemo vas...')
        // The API will handle the sign-in and redirect
        router.push('/klijent/dashboard')
      } else {
        toast.error(data.error || 'Dogodila se greška tijekom registracije')
      }
    } catch {
      toast.error('Dogodila se greška. Molimo pokušajte ponovno.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Registracija klijenta</CardTitle>
            <CardDescription className="text-center">
              Unesite svoje podatke za kreiranje računa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
