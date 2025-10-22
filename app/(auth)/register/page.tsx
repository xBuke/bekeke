'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<'klijent' | 'pruzatelj' | null>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (accountType === 'klijent') {
      router.push('/register/klijent')
    } else if (accountType === 'pruzatelj') {
      router.push('/register/pruzatelj')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Registracija</CardTitle>
            <CardDescription className="text-center">
              Odaberite tip računa koji najbolje odgovara vašim potrebama
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Checkbox
                    id="klijent"
                    checked={accountType === 'klijent'}
                    onCheckedChange={() => setAccountType('klijent')}
                  />
                  <div className="flex-1">
                    <Label htmlFor="klijent" className="cursor-pointer">
                      <div className="font-medium">Tražim uslugu</div>
                      <div className="text-sm text-gray-600">
                        Registrirajte se kao klijent da biste mogli tražiti i rezervirati usluge
                      </div>
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Checkbox
                    id="pruzatelj"
                    checked={accountType === 'pruzatelj'}
                    onCheckedChange={() => setAccountType('pruzatelj')}
                  />
                  <div className="flex-1">
                    <Label htmlFor="pruzatelj" className="cursor-pointer">
                      <div className="font-medium">Nudim uslugu</div>
                      <div className="text-sm text-gray-600">
                        Registrirajte se kao pružatelj da biste mogli nuditi svoje usluge
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleContinue}
              disabled={!accountType}
              className="w-full"
            >
              Nastavi
            </Button>

            <p className="text-center text-sm text-gray-600">
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
