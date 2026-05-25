import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

function StripeForm({ onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
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
    <form onSubmit={handlePay}>
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
        disabled={loading || !stripe}
        style={{
          width: '100%',
          padding: '16px',
          background: loading ? '#ccc' : '#10B981',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
      >
        {loading ? 'Procesando...' : `Confirmar y Pagar`}
      </button>
    </form>
  );
}

export default function StripeCheckout({ total, franjaElegida, orderItems, user, products, stripePromise, onSuccess }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createIntent = async () => {
      try {
        const response = await fetch(
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

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating intent:', err);
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [total, user, orderItems, franjaElegida]);

  if (loading) return <div>Cargando...</div>;
  if (!clientSecret) return <div>Error al cargar el formulario de pago</div>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeForm onSuccess={onSuccess} />
    </Elements>
  );
}