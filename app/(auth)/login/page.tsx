'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Molimo unesite email i lozinku')
      return
    }

    if (!email.includes('@')) {
      toast.error('Molimo unesite valjan email')
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Neispravni podaci za prijavu')
      } else {
        toast.success('Uspješno ste se prijavili!')
        router.push('/')
        router.refresh()
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
            <CardTitle className="text-2xl font-bold text-center">Prijavite se</CardTitle>
            <CardDescription className="text-center">
              Unesite svoje podatke za prijavu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vas@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Lozinka</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Vaša lozinka"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <Link 
                  href="#" 
                  className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    e.preventDefault()
                    toast.error('Funkcija resetiranja lozinke nije dostupna u MVP verziji')
                  }}
                >
                  Zaboravili ste lozinku?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Prijavljivanje...' : 'Prijavite se'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ili</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                  onClick={() => toast.error('Google prijava nije dostupna u MVP verziji')}
                >
                  Nastavi s Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                  onClick={() => toast.error('Facebook prijava nije dostupna u MVP verziji')}
                >
                  Nastavi s Facebookom
                </Button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              Nemate račun?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Registrirajte se
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
