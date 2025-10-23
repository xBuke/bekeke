'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';

export default function StripeRefreshPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Link je istekao
          </h1>
          <p className="text-gray-600 mb-4">
            Stripe onboarding link je istekao. Molimo kontaktirajte našu podršku za novi link.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-orange-800">
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">
              Kontaktirajte podršku: support@marketplace.hr
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/pruzatelj')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Povratak na Dashboard
          </button>

          <button
            onClick={() => window.location.href = 'mailto:support@marketplace.hr?subject=Stripe Onboarding Link Request'}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Pošalji Email Podršci
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>
            Stripe onboarding linkovi istječu nakon 24 sata iz sigurnosnih razloga.
          </p>
        </div>
      </div>
    </div>
  );
}
