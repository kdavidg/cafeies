import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function StripeCheckout({ total, franjaElegida, orderItems, user, products, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Crear intent en el backend
      const intentResponse = await fetch(
        'https://backend-production-2b15.up.railway.app/api/pagos/crear-intent/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            total: total,
            usuario: user?.email || 'anonimo@cafeies.com',
            items: orderItems,
            franja_horaria: franjaElegida
          })
        }
      );

      const { clientSecret } = await intentResponse.json();

      // 2. Confirmar pago
      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirm: true,
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} style={{ marginBottom: '20px' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #ddd' }}>
        <PaymentElement />
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
          ❌ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        style={{
          width: '100%',
          padding: '16px',
          background: loading ? '#ccc' : '#ff5c1a',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
      >
        {loading ? 'Procesando...' : 'Confirmar y Pagar'}
      </button>
    </form>
  );
}