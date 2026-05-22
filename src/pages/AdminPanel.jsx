import React, { useState, useEffect } from 'react';

export default function AdminPanel({ user }) {
  const [esAdmin, setEsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarAdmin = async () => {
      try {
        const response = await fetch(
          `https://backend-production-2b15.up.railway.app/api/es-admin/?email=${user.email}`
        );
        const data = await response.json();
        setEsAdmin(data.es_admin);
      } catch (error) {
        console.error('Error verificando admin:', error);
      } finally {
        setLoading(false);
      }
    };

    verificarAdmin();
  }, [user.email]);

  if (loading) return <div>Cargando...</div>;
  if (!esAdmin) return <div>No tienes acceso al panel admin</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Panel Administrador</h1>
      <p>Bienvenido, {user.email}</p>
      {/* Aquí irán los tabs de Pedidos y Productos */}
    </div>
  );
}