import React, { useState, useEffect } from 'react';

const ADMIN_EMAIL = 'davidgonzaga140@gmail.com';

export default function AdminProducts({ user }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    emoji: '☕',
    categoria: 'bebidas',
    descripcion: '',
    stock: 0
  });

  const esAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await fetch(
        'https://backend-production-2b15.up.railway.app/api/productos/'
      );
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setEditando(null);
    setFormData({
      nombre: '',
      precio: '',
      emoji: '☕',
      categoria: 'bebidas',
      descripcion: '',
      stock: 0
    });
    setShowModal(true);
  };

  const abrirModalEditar = (producto) => {
    setEditando(producto);
    setFormData({
      nombre: producto.nombre,
      precio: producto.precio,
      emoji: producto.emoji,
      categoria: producto.categoria,
      descripcion: producto.descripcion,
      stock: producto.stock
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precio' || name === 'stock' ? parseFloat(value) : value
    }));
  };

  const guardarProducto = async () => {
    if (!formData.nombre || !formData.precio) {
      alert('Nombre y precio son requeridos');
      return;
    }

    try {
      let response;
      if (editando) {
        // Editar
        response = await fetch(
          `https://backend-production-2b15.up.railway.app/api/productos/editar/${editando.id}/`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          }
        );
      } else {
        // Crear
        response = await fetch(
          'https://backend-production-2b15.up.railway.app/api/productos/crear/',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          }
        );
      }

      if (response.ok) {
        fetchProductos();
        setShowModal(false);
        alert(editando ? '✅ Producto actualizado' : '✅ Producto creado');
      } else {
        alert('Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const borrarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;

    try {
      const response = await fetch(
        `https://backend-production-2b15.up.railway.app/api/productos/borrar/${id}/`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        fetchProductos();
        alert('✅ Producto eliminado');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!esAdmin) return <div style={{ padding: '20px' }}>No tienes acceso</div>;
  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

  return (
    <div style={{ padding: '0' }}>
      {/* BOTÓN AGREGAR */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={abrirModalNuevo}
          style={{
            padding: '12px 24px',
            background: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          + Agregar Producto
        </button>
      </div>

      {/* TABLA DE PRODUCTOS - Desktop */}
      {productos.length > 0 ? (
        <>
          {/* Vista Desktop - Tabla */}
          <div style={{ display: 'none' }} className="desktop-table">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Emoji</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Precio</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Stock</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Categoría</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(producto => (
                    <tr key={producto.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontSize: '20px' }}>{producto.emoji}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 'bold' }}>{producto.nombre}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{producto.descripcion}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{producto.precio}€</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          background: producto.stock > 0 ? '#e8f5e9' : '#ffebee',
                          color: producto.stock > 0 ? '#2e7d32' : '#c62828',
                          borderRadius: '4px',
                          fontWeight: 'bold'
                        }}>
                          {producto.stock}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{producto.categoria}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => abrirModalEditar(producto)}
                          style={{
                            padding: '6px 12px',
                            background: '#ff5c1a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '5px',
                            fontSize: '12px',
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => borrarProducto(producto.id)}
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
                          🗑️ Borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista Móvil - Cards */}
          <div style={{ display: 'grid', gap: '15px' }} className="mobile-cards">
            {productos.map(producto => (
              <div key={producto.id} style={{ 
                background: 'white', 
                padding: '15px', 
                borderRadius: '12px', 
                border: '1px solid #eee',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{producto.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{producto.nombre}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{producto.descripcion}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px', fontSize: '14px' }}>
                  <div>
                    <span style={{ color: '#666', fontSize: '12px' }}>Precio</span>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#ff5c1a' }}>{producto.precio}€</div>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '12px' }}>Stock</span>
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '18px',
                      color: producto.stock > 0 ? '#2e7d32' : '#c62828',
                      padding: '4px 8px',
                      background: producto.stock > 0 ? '#e8f5e9' : '#ffebee',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}>
                      {producto.stock}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ color: '#666', fontSize: '12px' }}>Categoría</span>
                  <div style={{ fontWeight: '600' }}>{producto.categoria}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => abrirModalEditar(producto)}
                    style={{
                      padding: '10px 12px',
                      background: '#ff5c1a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => borrarProducto(producto.id)}
                    style={{
                      padding: '10px 12px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                  >
                    🗑️ Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <p style={{ fontSize: '40px' }}>📦</p>
          <p>No hay productos</p>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ marginTop: 0 }}>
              {editando ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
            </h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Precio (€)</label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                step="0.01"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Emoji</label>
              <input
                type="text"
                name="emoji"
                value={formData.emoji}
                onChange={handleInputChange}
                maxLength="2"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '20px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Categoría</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option>bebidas</option>
                <option>bocadillos</option>
                <option>dulces</option>
                <option>fresco</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  minHeight: '80px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={guardarProducto}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Guardar
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}