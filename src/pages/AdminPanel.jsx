import React, { useState, useEffect } from 'react';
import AdminProducts from '../components/AdminProducts';

const ADMIN_EMAIL = 'davidgonzaga140@gmail.com';

export default function AdminPanel({ user, products }) {
  const [pedidos, setPedidos] = useState([]);
  const [tab, setTab] = useState('pedidos');
  const [subTab, setSubTab] = useState('pendientes');
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
  const mostrar = subTab === 'pendientes' ? pedidosPendientes : pedidosCompletados;

  // Calcular estadísticas
  // Calcular estadísticas
const hoy = new Date().toDateString();

// SOLO VENDIDO COMPLETADO (no pendiente)
const totalVendidoHoy = pedidos
  .filter(p => p.estado === 'completado' && new Date(p.fecha).toDateString() === hoy)
  .reduce((sum, p) => sum + parseFloat(p.total), 0);

const pedidosCompletadosHoy = pedidos
  .filter(p => p.estado === 'completado' && new Date(p.fecha).toDateString() === hoy)
  .length;



  return (
    <section className="view active">
      <div className="content-header">
        <h2 className="content-title">📊 Panel Administrador</h2>
      </div>

      <div style={{ padding: '20px' }}>
      {/* ESTADÍSTICAS ARRIBA */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
  <div style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
    <p style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.95, fontWeight: '600' }}>Total Vendido Hoy</p>
    <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>{totalVendidoHoy.toFixed(2)}€</h2>
  </div>
  
  <div style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
    <p style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.95, fontWeight: '600' }}>Pedidos Completados</p>
    <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>{pedidosCompletadosHoy}</h2>
  </div>
</div>

        {/* TABS PRINCIPALES */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', minHeight: '44px', alignItems: 'center' }}>
          <button
            onClick={() => { setTab('pedidos'); setSubTab('pendientes'); }}
            style={{
              padding: '12px 24px',
              background: tab === 'pedidos' ? '#ff5c1a' : '#f0f0f0',
              color: tab === 'pedidos' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              whiteSpace: 'nowrap',
            }}
          >
            📋 Pedidos
          </button>
          <button
            onClick={() => setTab('productos')}
            style={{
              padding: '12px 24px',
              background: tab === 'productos' ? '#2ecc71' : '#f0f0f0',
              color: tab === 'productos' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              whiteSpace: 'nowrap',
            }}
          >
            🍱 Productos
          </button>
        </div>

        {/* CONTENEDOR CON ALTURA FIJA */}
        <div style={{ minHeight: '700px' }}>
          {/* VISTA DE PEDIDOS */}
          {tab === 'pedidos' && (
            <>
              {/* SUB-TABS PARA PEDIDOS */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  onClick={() => setSubTab('pendientes')}
                  style={{
                    padding: '10px 20px',
                    background: subTab === 'pendientes' ? '#ff5c1a' : '#f0f0f0',
                    color: subTab === 'pendientes' ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Pendientes ({pedidosPendientes.length})
                </button>
                <button
                  onClick={() => setSubTab('completados')}
                  style={{
                    padding: '10px 20px',
                    background: subTab === 'completados' ? '#2ecc71' : '#f0f0f0',
                    color: subTab === 'completados' ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Completados ({pedidosCompletados.length})
                </button>
              </div>

              {/* CARDS DE PEDIDOS */}
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
                        borderLeft: `6px solid ${subTab === 'pendientes' ? '#ff5c1a' : '#2ecc71'}`,
                      }}
                    >
                      {/* HEADER */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div>
                          <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>
                            Código: <span style={{ color: '#ff5c1a' }}>{pedido.codigo}</span>
                          </h3>
                          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                            {pedido.usuario.split('@')[0]} • {pedido.franja_horaria?.slice(0, 5)}
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
                      {subTab === 'pendientes' ? (
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
                  <p style={{ fontSize: '16px' }}>No hay pedidos {subTab === 'pendientes' ? 'pendientes' : 'completados'}</p>
                </div>
              )}
            </>
          )}

          {/* VISTA DE PRODUCTOS */}
          {tab === 'productos' && (
            <AdminProducts user={user} />
          )}
        </div>
      </div>
    </section>
  );
}