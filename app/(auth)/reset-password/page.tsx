'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValidSession, setIsValidSession] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    // Check for error from auth callback
    if (error) {
      toast.error('Neispravan link za resetiranje lozinke')
      router.push('/forgot-password')
      return
    }
    
    // Check if user has a valid session (from Supabase auth callback)
    checkSession()
  }, [error, router, checkSession])

  const checkSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        toast.error('Link za resetiranje je neispravan ili je istekao')
        router.push('/forgot-password')
        return
      }
      
      setIsValidSession(true)
    } catch {
      toast.error('Greška pri provjeri sesije')
      router.push('/forgot-password')
    } finally {
      setIsValidating(false)
    }
  }, [router])

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Lozinka mora imati najmanje 8 znakova'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      toast.error('Molimo unesite lozinku i potvrdu lozinke')
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    if (password !== confirmPassword) {
      toast.error('Lozinke se ne podudaraju')
      return
    }

    setIsLoading(true)

    try {
      // Update password using Supabase session
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('Password update error:', error)
        toast.error('Greška pri ažuriranju lozinke')
        return
      }

      setIsSuccess(true)
      toast.success('Lozinka je uspješno resetirana!')
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('Dogodila se greška. Molimo pokušajte ponovno.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Provjeravam link...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-green-600">Lozinka resetirana!</CardTitle>
              <CardDescription>
                Vaša lozinka je uspješno resetirana. Sada se možete prijaviti s novom lozinkom.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                asChild
              >
                <Link href="/login">Prijavite se</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-red-600">Neispravan link</CardTitle>
              <CardDescription>
                Link za resetiranje lozinke je neispravan ili je istekao.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                asChild
              >
                <Link href="/forgot-password">Zatraži novi link</Link>
              </Button>
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
            <CardTitle className="text-2xl font-bold text-center">Postavite novu lozinku</CardTitle>
            <CardDescription className="text-center">
              Unesite novu lozinku za svoj račun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova lozinka</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Najmanje 8 znakova"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ponovite lozinku"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="text-sm text-gray-600">
                <p>Lozinka mora imati najmanje 8 znakova.</p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Resetiranje...' : 'Resetiraj lozinku'}
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
