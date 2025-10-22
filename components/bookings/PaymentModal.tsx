'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PayPalPayment from './PayPalPayment';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ bookingId, amount }: { bookingId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    setError(null);
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/klijent/bookings/${bookingId}/success`,
      },
    });
    
    if (error) {
      setError(error.message || 'Payment failed');
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Ukupno za platiti</h3>
        <p className="text-3xl font-bold">{amount.toFixed(2)}€</p>
      </div>
      
      <PaymentElement />
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Procesiranje...' : 'Plati sada'}
      </button>
    </form>
  );
}

interface PaymentModalProps {
  bookingId: string;
  amount: number;
  clientSecret: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ 
  bookingId, 
  amount, 
  clientSecret, 
  isOpen, 
  onClose 
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  
  const options = {
    clientSecret,
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 sm:mx-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Plaćanje usluge</DialogTitle>
        </DialogHeader>
        
        {/* Payment Method Selection */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setPaymentMethod('stripe')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                paymentMethod === 'stripe'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Stripe
            </button>
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                paymentMethod === 'paypal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              PayPal
            </button>
          </div>
        </div>
        
        {/* Payment Form */}
        {paymentMethod === 'stripe' ? (
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm bookingId={bookingId} amount={amount} />
          </Elements>
        ) : (
          <PayPalPayment bookingId={bookingId} amount={amount} />
        )}
      </DialogContent>
    </Dialog>
  );
}
