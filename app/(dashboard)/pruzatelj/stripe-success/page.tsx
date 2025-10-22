'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle, ArrowRight } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StripeSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Update stripe_onboarding_complete to true
    const updateOnboardingStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Dohvati provider ID
        const { data: provider } = await supabase
          .from('service_providers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (provider) {
          await supabase
            .from('service_providers')
            .update({ stripe_onboarding_complete: true })
            .eq('id', provider.id);
        }
      } catch (error) {
        console.error('Error updating onboarding status:', error);
      }
    };

    updateOnboardingStatus();

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/pruzatelj');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Stripe račun uspješno povezan!
          </h1>
          <p className="text-gray-600">
            Vaš Stripe račun je uspješno povezan. Sada možete primati plaćanja za svoje usluge.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Preusmjeravanje na dashboard za {countdown} sekundi...
          </p>
        </div>

        <button
          onClick={() => router.push('/pruzatelj')}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Idi na Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
