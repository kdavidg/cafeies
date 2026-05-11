import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

import Header from './components/Header.jsx';
import SideBar from './components/Sidebar.jsx';
import ProductCard from './components/ProductCard.jsx';
import OrderPanel from './components/OrderPanel.jsx';
import LoginForm from './components/Login.jsx';

import { TIME_SLOTS } from './data/timeSlots.js';
import { USER } from './data/user.js';


export default function CaféIES() {
  const [currentView, setCurrentView] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [orderItems, setOrderItems] = useState({});
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState([]);

 useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/productos/');
      const data = await response.json();

      console.log(data);

      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.nombre,
        desc: product.descripcion || "Producto cafetería",
        price: product.precio,
        cat: product.categoria || "bebidas",
        emoji: product.emoji || "☕",
        badges: product.badges || []
      }));

      setProducts(formattedProducts);

    } catch (error) {
      console.error("Error cargando productos de Django:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, []);

useEffect(() => {
  if (currentView === 'history' || currentView === 'menu') {
    fetchPedidos();
  }
}, [currentView]);


const fetchPedidos = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/pedidos/lista/');
        const data = await response.json();
        setPedidos(data);
    } catch (error) {
        console.error("Error cargando pedidos:", error);
    }
};

useEffect(() => {
    if (currentView === 'history') {
        fetchPedidos();
    }
}, [currentView]);

  const handleLogin = (email, password) => {
    setUser({ name: email.split('@')[0], email, avatar: email[0].toUpperCase() });
    setIsLoggedIn(true);
    setCurrentView('menu');
  };

  const handleGoogleLogin = () => {
    setUser(USER);
    setIsLoggedIn(true);
    setCurrentView('menu');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('login');
  };

  const toggleFav = (id) => {
    const newFavs = new Set(favorites);
    newFavs.has(id) ? newFavs.delete(id) : newFavs.add(id);
    setFavorites(newFavs);
  };

  const changeQty = (id, delta) => {
  setOrderItems(prev => {
    const newQty = (prev[id] || 0) + delta;
    if (newQty <= 0) {
      const { [id]: _, ...rest } = prev;
      return rest;
    }
    return { ...prev, [id]: newQty };
  });
};

  const finalizarPedido = async () => {
  // 1. Preparamos el objeto exactamente como lo espera Django
  const pedidoParaEnviar = {
    usuario: user?.email || "usuario_anonimo@cafeies.com",
    items: orderItems,
    total: orderTotal,
    fecha: new Date().toISOString(),
    nota: document.getElementById('order-note-input')?.value || ""
  };

  console.log("Enviando pedido a Django:", pedidoParaEnviar);

  try {
    // IMPORTANTE: Revisa que esta URL sea la misma que en tu urls.py
    // Si en urls.py pusiste 'api/pedidos/crear/', asegúrate de que termine en /
    const response = await fetch('http://127.0.0.1:8000/api/pedidos/crear/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoParaEnviar),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Respuesta de Mongo:", result);
      
      alert("¡Pedido guardado correctamente! 🎉");
      
      // Limpiar y navegar
      setOrderItems({});
      if (typeof fetchPedidos === 'function') fetchPedidos(); // Recarga el historial
      setCurrentView('history');
    } else {
      const errorText = await response.text();
      console.error("Error del servidor Django:", errorText);
      alert("Error al guardar: " + errorText);
    }
  } catch (error) {
    console.error("Error de conexión (CORS o Servidor apagado):", error);
    alert("No se pudo conectar con el servidor. ¿Está Django encendido?");
  }
};

  // Filtrado y Cálculos
  const filteredProducts = products.filter(p => 
    (selectedCategory === 'todo' || p.cat === selectedCategory) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const orderTotal = useMemo(() => {
    return Object.entries(orderItems).reduce((sum, [id, qty]) => 
      sum + (products.find(p => p.id == id)?.price || 0) * qty, 0);
  }, [orderItems, products]);

  const orderCount = React.useMemo(() => {
    return Object.values(orderItems).reduce((sum, qty) => sum + qty, 0);
  }, [orderItems]);

  // --- RENDER ---
  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <div className="login-screen">
          <div className="login-card">
            <div className="login-logo-mark">café</div>
            <h1 className="login-headline">Bienvenido a Café<em>IES</em></h1>
            <p className="login-sub">Pide sin hacer cola</p>
            <LoginForm onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />
          </div>
        </div>
      ) : (
        <>
          <Header 
            user={user} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            favoritesCount={favorites.size}
            orderCount={orderCount}
            setCurrentView={setCurrentView}
          />

          <div className="app-body">
            <SideBar 
              currentView={currentView} 
              setCurrentView={setCurrentView} 
              favoritesCount={favorites.size}
              orderCount={orderCount}
              user={user}
              handleLogout={handleLogout}
            />
           <main className="app-main">
            {/* 1. VISTA DE MENÚ*/}
            {currentView === 'menu' && (
              <section className="view active">
                <div className="content-header">
              <div className="header-text-group">
                <div className="content-greeting">Buenos días, {user?.name} 👋</div>
                <h2 className="content-title">¿Qué quieres hoy?</h2>
              </div>
              
              <div className="time-slots-wrapper">
                <span className="slots-label">Selecciona hora de recogida:</span>
                <div className="time-slots-container">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot.time} className="time-chip">
                      <span className="time-value">{slot.time}</span>
                      <span className="time-label">{slot.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
                <div className="category-tabs">
                  {['todo', 'bebidas', 'bocadillos', 'dulces', 'fresco'].map(cat => (
                    <button 
                      key={cat} 
                      className={`cat-tab ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat === 'todo' ? '🥪 Todo' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="menu-scroll">
                  <div className="products-grid">
                    {filteredProducts.map(product => (
                      <ProductCard 
                        key={product.id}
                        product={product}
                        isFavorite={favorites.has(product.id)}
                        onToggleFav={toggleFav}
                        quantity={orderItems[product.id] || 0}
                        onChangeQty={changeQty}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}
          {/* VISTA DE PAGO (CHECKOUT) */}
{currentView === 'checkout' && (
  <section className="view active">
    <div className="content-header">
      {/* Botón para volver al menú si el usuario se arrepiente */}
      <button className="btn-secondary" onClick={() => setCurrentView('menu')} style={{marginRight: '15px'}}>
        Volver
      </button>
      <h2 className="content-title">Finalizar Pedido</h2>
    </div>

    <div className="checkout-container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', padding: '20px' }}>
      
      {/* Columna Izquierda: Métodos de Pago */}
      <div className="checkout-methods">
        <h3 style={{ marginBottom: '20px' }}>Método de pago</h3>
        
        <div className="payment-options" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label className="payment-card" style={{ display: 'flex', alignItems: 'center', padding: '20px', border: '2px solid var(--orange)', borderRadius: '15px', cursor: 'pointer', background: 'var(--orange-light)' }}>
            <input type="radio" name="payment" defaultChecked style={{ marginRight: '15px' }} />
            <div>
              <div style={{ fontWeight: 'bold' }}>💰 Monedero Virtual</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Saldo disponible: 14.50€</div>
            </div>
          </label>

          <label className="payment-card" style={{ display: 'flex', alignItems: 'center', padding: '20px', border: '1px solid var(--border)', borderRadius: '15px', cursor: 'pointer' }}>
            <input type="radio" name="payment" style={{ marginRight: '15px' }} />
            <div>
              <div style={{ fontWeight: 'bold' }}>💵 Efectivo en barra</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Paga al recoger tu pedido</div>
            </div>
          </label>
        </div>

        <div className="order-note" style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '10px' }}>¿Alguna nota especial?</h3>
          <textarea 
            placeholder="Ej: Sin cebolla, alérgico a la lactosa..." 
            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
            rows="3"
            id="order-note-input"
          ></textarea>
        </div>
      </div>

      {/* Columna Derecha: Resumen Final */}
      <div className="checkout-summary" style={{ background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid var(--border)', height: 'fit-content' }}>
        <h3 style={{ marginBottom: '20px' }}>Resumen</h3>
        <div className="summary-items">
          {Object.entries(orderItems).map(([id, qty]) => {
            const product = products.find(p => p.id == id);
            return (
              <div key={id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                <span>{qty}x {product?.name}</span>
                <span>{(product?.price * qty).toFixed(2)}€</span>
              </div>
            );
          })}
        </div>
        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '18px', color: 'var(--orange)' }}>
          <span>Total:</span>
          <span>{orderTotal.toFixed(2)}€</span>
        </div>

        {/* BOTÓN MODIFICADO: Ahora llama a la función de conexión con el Backend */}
        <button 
          className="btn-primary" 
          style={{ width: '100%', marginTop: '25px', padding: '15px', fontSize: '16px' }}
          onClick={finalizarPedido} 
          disabled={orderCount === 0}
        >
          Confirmar y Pagar
        </button>
      </div>
    </div>
  </section>
)}




            {/* VISTA DE PANEL DE CAFETERÍA (ADMIN) */}
{currentView === 'admin' && (
  <section className="view active">
    <div className="content-header">
      <h2 className="content-title">Panel de Gestión - Cafetería ☕</h2>
    </div>

    <div className="admin-container" style={{ padding: '20px' }}>
      <div className="admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '10px', borderLeft: '5px solid #2196f3' }}>
          <small>Pedidos hoy</small>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>12</div>
        </div>
        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '10px', borderLeft: '5px solid #ff9800' }}>
          <small>Pendientes</small>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>3</div>
        </div>
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '10px', borderLeft: '5px solid #4caf50' }}>
          <small>Recaudado</small>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>42.50€</div>
        </div>
      </div>

      <h3 style={{ marginBottom: '10px' }}>Pedidos en curso</h3>
      <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Pedido de ejemplo 1 */}
        <div style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 'bold' }}>#1204 - Ana M. Rodríguez</span>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>1x Bocadillo de jamón, 1x Café con leche</div>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button style={{ padding: '5px 10px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Listo</button>
            <button style={{ padding: '5px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>X</button>
          </div>
        </div>

        {/* Pedido de ejemplo 2 */}
        <div style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 'bold' }}>#1205 - Juan Pérez</span>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>2x Napolitana chocolate</div>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button style={{ padding: '5px 10px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Listo</button>
            <button style={{ padding: '5px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>X</button>
          </div>
        </div>
      </div>
    </div>
  </section>
)}

            {/* VISTA DE MI PEDIDO (DETALLADA) */}
            {currentView === 'cart' && (
              <section className="view active">
                <div className="content-header">
                  <h2 className="content-title">Detalle de tu pedido 🛒</h2>
                </div>

                <div className="cart-detail-container" style={{ padding: '20px' }}>
                  {orderCount === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>
                      <div style={{ fontSize: '50px' }}>🛒</div>
                      <h3>Tu carrito está vacío</h3>
                      <button 
                        className="btn-primary" 
                        onClick={() => setCurrentView('menu')}
                        style={{ width: 'auto', marginTop: '20px' }}
                      >
                        Ir al menú para añadir productos
                      </button>
                    </div>
                  ) : (
                    <div className="cart-table-wrapper" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Producto</th>
                            <th style={{ padding: '12px' }}>Cantidad</th>
                            <th style={{ padding: '12px' }}>Precio</th>
                            <th style={{ padding: '12px' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(orderItems).map(([id, qty]) => {
                            const product = products.find(p => p.id == id);
                            return (
                              <tr key={id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '12px' }}>{product.emoji} {product.name}</td>
                                <td style={{ padding: '12px' }}>{qty}</td>
                                <td style={{ padding: '12px' }}>{product.price.toFixed(2)}€</td>
                                <td style={{ padding: '12px' }}>{(product.price * qty).toFixed(2)}€</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      
                      <div style={{ marginTop: '20px', textAlign: 'right' }}>
                        <h3 style={{ color: 'var(--orange)' }}>Total a pagar: {orderTotal.toFixed(2)}€</h3>
                        <button 
                          className="btn-primary" 
                          style={{ width: 'auto', marginTop: '10px' }}
                          onClick={() => alert('¡Pedido enviado a cocina!')}
                        >
                          Confirmar y enviar pedido
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 2. VISTA DE FAVORITOS */}
            {currentView === 'favs' && (
              <section className="view active">
                <div className="content-header">
                  <h2 className="content-title">Mis Favoritos ⭐</h2>
                </div>
                <div className="products-grid">
                  {products.filter(p => favorites.has(p.id)).length > 0 ? (
                    products.filter(p => favorites.has(p.id)).map(product => (
                      <ProductCard 
                        key={product.id}
                        product={product}
                        isFavorite={true}
                        onToggleFav={toggleFav}
                        quantity={orderItems[product.id] || 0}
                        onChangeQty={changeQty}
                      />
                    ))
                  ) : (
                    <p style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>
                      Aún no tienes productos favoritos.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* 3. VISTA DE HISTORIAL*/}
            {currentView === 'history' && (
  <section className="view active">
    <div className="content-header">
      <h2 className="content-title">Historial de Pedidos 📋</h2>
    </div>
    <div className="pedidos-list" style={{ padding: '20px' }}>
      {pedidos.length > 0 ? (
        pedidos.map((pedido) => (
          <div key={pedido.id} className="payment-card" style={{ marginBottom: '15px', display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Pedido #{pedido.id.slice(-5)}</span>
              <span style={{ color: 'var(--orange)' }}>{pedido.total?.toFixed(2)}€</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {new Date(pedido.fecha).toLocaleString()}
            </p>
            <div style={{ marginTop: '10px', fontSize: '13px' }}>
                {/* Aquí podrías listar los productos del pedido si quieres */}
                Usuario: {pedido.usuario}
            </div>
          </div>
        ))
      ) : (
        <p>No has realizado ningún pedido todavía.</p>
      )}
    </div>
  </section>
)}
          </main>

            {currentView !== 'checkout' && currentView !== 'staff' && currentView !== 'admin' && (
              <OrderPanel 
                orderItems={orderItems} 
                PRODUCTS={products} 
                orderTotal={orderTotal}
                orderCount={orderCount}
                setCurrentView={setCurrentView}
                setOrderItems={setOrderItems}
                changeQty={changeQty}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}