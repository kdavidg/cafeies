import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

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

      // 2. Confirmar pago con la tarjeta
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: user?.name || 'Usuario' }
        }
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Pago exitoso
        onSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handlePay} style={{ marginBottom: '20px' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #ddd' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '12px' }}>
          💳 Número de tarjeta
        </label>
        <div style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '6px', background: '#fafafa' }}>
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
          ❌ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe}
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