import React, { useState, useEffect } from 'react';

const ADMIN_EMAIL = 'davidgonzaga140@gmail.com';

export default function AdminPanel({ user, products }) {
  const [pedidos, setPedidos] = useState([]);
  const [tab, setTab] = useState('pendientes');
  const [loading, setLoading] = useState(true);

  const esAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await fetch(
        'https://backend-production-2b15.up.railway.app/api/pedidos/lista/'
      );
      const data = await response.json();
      setPedidos(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarPedido = async (pedidoId, nuevoEstado) => {
    if (!window.confirm(`¿Marcar como ${nuevoEstado}?`)) return;

    try {
      const response = await fetch(
        `https://backend-production-2b15.up.railway.app/api/pedidos/eliminar/${pedidoId}/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (response.ok) {
        fetchPedidos();
        alert('✅ Pedido actualizado');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!esAdmin) return <div style={{ padding: '20px' }}>No tienes acceso</div>;
  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
  const pedidosCompletados = pedidos.filter(p => p.estado === 'completado');
  const mostrar = tab === 'pendientes' ? pedidosPendientes : pedidosCompletados;

  return (
    <section className="view active">
      <div className="content-header">
        <h2 className="content-title">📊 Panel Administrador</h2>
      </div>

      <div style={{ padding: '20px' }}>
        {/* TABS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button
            onClick={() => setTab('pendientes')}
            style={{
              padding: '12px 24px',
              background: tab === 'pendientes' ? '#ff5c1a' : '#f0f0f0',
              color: tab === 'pendientes' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            ⏳ Pendientes ({pedidosPendientes.length})
          </button>
          <button
            onClick={() => setTab('completados')}
            style={{
              padding: '12px 24px',
              background: tab === 'completados' ? '#2ecc71' : '#f0f0f0',
              color: tab === 'completados' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            ✅ Completados ({pedidosCompletados.length})
          </button>
        </div>

        {/* CARDS */}
        {mostrar.length > 0 ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            {mostrar.map(pedido => (
              <div
                key={pedido.id}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderLeft: `6px solid ${tab === 'pendientes' ? '#ff5c1a' : '#2ecc71'}`,
                }}
              >
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>
                      Código: <span style={{ color: '#ff5c1a' }}>{pedido.codigo}</span>
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                      {pedido.usuario.split('@')[0]} • {pedido.franja_horaria}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>
                      {new Date(pedido.fecha).toLocaleString()}
                    </p>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ff5c1a' }}>
                      {parseFloat(pedido.total).toFixed(2)}€
                    </p>
                  </div>
                </div>

                {/* PRODUCTOS */}
                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '14px' }}>Productos:</p>
                  {Object.entries(pedido.items || {}).map(([id, qty]) => {
                    const prod = products.find(p => String(p.id) === String(id));
                    return (
                      <p key={id} style={{ margin: '4px 0', fontSize: '13px', color: '#555' }}>
                        • <strong>{qty}x</strong> {prod?.name || 'Producto'}
                      </p>
                    );
                  })}
                </div>

                {/* BOTONES */}
                {tab === 'pendientes' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={() => marcarPedido(pedido.id, 'completado')}
                      style={{
                        padding: '12px',
                        background: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                      }}
                    >
                      ✓ Completar
                    </button>
                    <button
                      onClick={() => marcarPedido(pedido.id, 'cancelado')}
                      style={{
                        padding: '12px',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                      }}
                    >
                      ✗ Cancelar
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '12px', background: '#e8f5e9', borderRadius: '8px', color: '#2e7d32', fontWeight: 'bold' }}>
                    ✅ Pedido Completado
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <p style={{ fontSize: '48px' }}>📭</p>
            <p style={{ fontSize: '16px' }}>No hay pedidos {tab === 'pendientes' ? 'pendientes' : 'completados'}</p>
          </div>
        )}
      </div>
    </section>
  );
}