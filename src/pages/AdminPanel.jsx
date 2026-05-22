import React, { useState, useEffect } from 'react';

const ADMIN_EMAIL = 'davidgonzaga140@gmail.com';

export default function AdminPanel({ user, products }) {
  const [pedidos, setPedidos] = useState([]);
  const [tab, setTab] = useState('pendientes'); // 'pendientes' o 'completados'
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
      console.error('Error cargando pedidos:', error);
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
        alert('Pedido actualizado');
      } else {
        alert('Error al actualizar');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!esAdmin) {
    return <div style={{ padding: '20px' }}>No tienes acceso</div>;
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Cargando...</div>;
  }

  // Filtrar por estado
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
  const pedidosCompletados = pedidos.filter(p => p.estado === 'completado');

  const mostrar = tab === 'pendientes' ? pedidosPendientes : pedidosCompletados;

  return (
    <section className="view active">
      <div className="content-header">
        <h2 className="content-title">📊 Panel Administrador - Pedidos</h2>
      </div>

      <div style={{ padding: '20px' }}>
        {/* TABS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
          <button
            onClick={() => setTab('pendientes')}
            style={{
              padding: '10px 20px',
              background: tab === 'pendientes' ? '#ff5c1a' : '#f0f0f0',
              color: tab === 'pendientes' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ⏳ Pendientes ({pedidosPendientes.length})
          </button>
          <button
            onClick={() => setTab('completados')}
            style={{
              padding: '10px 20px',
              background: tab === 'completados' ? '#2ecc71' : '#f0f0f0',
              color: tab === 'completados' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✅ Completados ({pedidosCompletados.length})
          </button>
        </div>

        {/* TABLA */}
        {mostrar.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Código</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Cliente</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Franja</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Fecha</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mostrar.map(pedido => (
                  <tr key={pedido.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#ff5c1a' }}>
                      {pedido.codigo}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {pedido.usuario.split('@')[0]}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      {parseFloat(pedido.total).toFixed(2)}€
                    </td>
                    <td style={{ padding: '12px' }}>
                      {pedido.franja_horaria}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                      {new Date(pedido.fecha).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {tab === 'pendientes' ? (
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button
                            onClick={() => marcarPedido(pedido.id, 'completado')}
                            style={{
                              padding: '6px 12px',
                              background: '#2ecc71',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            ✓ Completar
                          </button>
                          <button
                            onClick={() => marcarPedido(pedido.id, 'cancelado')}
                            style={{
                              padding: '6px 12px',
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            ✗ Cancelar
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#666', fontSize: '12px' }}>Finalizado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p style={{ fontSize: '40px' }}>📭</p>
            <p>No hay pedidos {tab === 'pendientes' ? 'pendientes' : 'completados'}</p>
          </div>
        )}
      </div>
    </section>
  );
}