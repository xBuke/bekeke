'use client';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from 'react';

interface PayPalPaymentProps {
  bookingId: string;
  amount: number;
}

export default function PayPalPayment({ bookingId, amount }: PayPalPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: "EUR",
    intent: "capture",
  };

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/bookings/${bookingId}/paypal-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order');
      }

      return data.orderId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (data: { orderID: string }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bookings/${bookingId}/paypal-capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: data.orderID }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to capture payment');
      }

      // Redirect to success page
      window.location.href = `/klijent/bookings/${bookingId}/success`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment capture failed');
      setLoading(false);
    }
  };

  const handleError = (err: unknown) => {
    console.error('PayPal error:', err);
    setError('Payment failed. Please try again.');
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Ukupno za platiti</h3>
        <p className="text-3xl font-bold">{amount.toFixed(2)}€</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}

      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onError={handleError}
          disabled={loading}
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
          }}
        />
      </PayPalScriptProvider>

      {loading && (
        <div className="text-center text-gray-600">
          Procesiranje plaćanja...
        </div>
      )}
    </div>
  );
}
