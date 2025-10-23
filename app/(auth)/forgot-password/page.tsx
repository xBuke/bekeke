'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Molimo unesite email adresu')
      return
    }

    if (!email.includes('@')) {
      toast.error('Molimo unesite valjan email')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
        toast.success('Ako email postoji, poslan je link za resetiranje lozinke')
      } else {
        toast.error(data.error || 'Dogodila se greška. Molimo pokušajte ponovno.')
      }
    } catch {
      toast.error('Dogodila se greška. Molimo pokušajte ponovno.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-green-600">Email poslan!</CardTitle>
              <CardDescription>
                Ako email postoji u našoj bazi, poslan je link za resetiranje lozinke.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-gray-600">
                <p>Provjerite svoju email poštu i slijedite upute za resetiranje lozinke.</p>
                <p className="mt-2">Link je valjan 24 sata.</p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                  }}
                >
                  Pošalji novi zahtjev
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full"
                  asChild
                >
                  <Link href="/login">Povratak na prijavu</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Zaboravili ste lozinku?</CardTitle>
            <CardDescription className="text-center">
              Unesite svoju email adresu i poslat ćemo vam link za resetiranje lozinke
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email adresa</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vas@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Slanje...' : 'Pošalji link za resetiranje'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Sjećate se lozinke?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Prijavite se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
