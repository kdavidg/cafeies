import React, { useState, useEffect } from 'react';

const ADMIN_EMAIL = 'davidgonzaga140@gmail.com';

export default function AdminPanel({ user }) {
  const [loading, setLoading] = useState(true);
  const esAdmin = user.email === ADMIN_EMAIL;

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;
  if (!esAdmin) return <div style={{ padding: '20px' }}>No tienes acceso al panel admin</div>;

  return (
    <section className="view active">
      <div className="content-header">
        <h2 className="content-title">Panel Administrador</h2>
      </div>
      <div style={{ padding: '20px' }}>
        <p>Bienvenido, {user.email}</p>
        {/* Aquí irán los tabs de Pedidos y Productos */}
      </div>
    </section>
  );
}