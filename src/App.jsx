import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

import Header from './components/Header.jsx';
import SideBar from './components/Sidebar.jsx';
import ProductCard from './components/ProductCard.jsx';
import OrderPanel from './components/OrderPanel.jsx';
import LoginForm from './components/Login.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

import { Elements } from '@stripe/react-stripe-js';
import StripeCheckout from './components/StripeCheckout.jsx';

import { TIME_SLOTS } from './data/timeSlots.js';
import { USER } from './data/user.js';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

<GoogleOAuthProvider clientId="389069267633-j5n6e0r6p4ec99be2v3hfjderhe54vgh.apps.googleusercontent.com">
    <CaféIES />
</GoogleOAuthProvider>


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
  const [franjaElegida, setFranjaElegida] = useState(null);
  const [metodoPago, setMetodoPago] = useState('monedero');
  const [lastOrder, setLastOrder] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [historialFilter, setHistorialFilter] = useState('todos');
  const [franjas, setFranjas] = useState([]);
  
 useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await fetch('https://backend-production-2b15.up.railway.app/api/productos/');
      const data = await response.json();
      
      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.nombre,
        desc: product.descripcion || "Producto cafetería",
        price: parseFloat(product.precio),
        cat: product.categoria || "bebidas",
        emoji: product.emoji || "☕",
        badges: []
      }));
      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, []);

useEffect(() => {
  const fetchFranjas = async () => {
    try {
      const response = await fetch('https://backend-production-2b15.up.railway.app/api/franjas-horarias/');
      const data = await response.json();
      // data es un array de {id, hora_inicio, hora_fin, activa, max_pedidos}
      setFranjas(data);
    } catch (error) {
      console.error("Error cargando franjas:", error);
    }
  };
  fetchFranjas();
}, []);


useEffect(() => {
  if (currentView === 'history' || currentView === 'menu') {
    fetchPedidos();
  }
}, [currentView]);

const stripePromise = window.Stripe ? Promise.resolve(window.Stripe('pk_test_51Tahy3Rwe5FWVGQyhAmDFvxaeR5vFiG4Ja2sjfnAA6bocTNIxfGXADfhJdMZBxmATHwFk9x0FWO8LR82qpFzIlCL00Y62Rrklm')) : Promise.reject(new Error('Stripe failed to load'));


const fetchPedidos = async () => {
    try {
        const response = await fetch('https://backend-production-2b15.up.railway.app/api/pedidos/lista/');
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
  setUser(null);
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

const finalizarPedidoConPago = async (paymentIntentId) => {
  if (!franjaElegida) {
    alert("⚠️ Debes seleccionar una franja horaria");
    return;
  }

  const pedidoParaEnviar = {
    usuario: user?.email || "usuario_anonimo@cafeies.com",
    items: orderItems,
    total: orderTotal,
    franja_horaria_id: parseInt(franjaElegida),
    fecha: new Date().toISOString(),
    payment_intent_id: paymentIntentId
  };

  

  try {
    const response = await fetch('https://backend-production-2b15.up.railway.app/api/pedidos/crear/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoParaEnviar),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Pedido creado:", result);
      
      setLastOrder({
        codigo: result.codigo || 'XXXX',
        franja_horaria: franjaElegida,
        items: orderItems,
        total: orderTotal
      });
      
      setOrderItems({});
      fetchPedidos();
      setCurrentView('confirmation');
    } else {
      const errorData = await response.json();
      alert("⚠️ " + (errorData.error || "Error al guardar"));
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    alert("❌ No se pudo conectar con el servidor");
  }
};

const finalizarPedidoGestion = async (pedidoId, accion) => {
    const nuevoEstado = accion === 'listo' ? 'completado' : 'cancelado';
    
    if (!window.confirm(`¿Seguro que quieres marcar como ${accion.toUpperCase()}?`)) return;

    const API_URL = window.location.hostname === "localhost" 
      ? "http://127.0.0.1:8000" 
      : "https://backend-production-2b15.up.railway.app";

    try {
      const response = await fetch(`${API_URL}/api/pedidos/eliminar/${pedidoId}/`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        fetchPedidos();
      } else {
        alert("Error al actualizar el pedido.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
};


  const filteredProducts = products.filter(p => 
    (selectedCategory === 'todo' || p.cat === selectedCategory) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const orderTotal = useMemo(() => {
  return Object.entries(orderItems).reduce((sum, [id, qty]) => {
    const product = products.find(p => String(p.id) === String(id));
    const price = parseFloat(product?.price) || 0; 
    return sum + (price * qty);
  }, 0);
}, [orderItems, products]);

  const orderCount = React.useMemo(() => {
    return Object.values(orderItems).reduce((sum, qty) => sum + qty, 0);
  }, [orderItems]);

  return (
    <GoogleOAuthProvider clientId="389069267633-j5n6e0r6p4ec99be2v3hfjderhe54vgh.apps.googleusercontent.com">
    <div className="app-container">
      {!isLoggedIn ? (
        <div className="login-screen" style={{ 
          background: 'radial-gradient(circle at center, #2c1a10 0%, #000000 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          margin: 0
        }}>
          <div className="login-card" style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '50px 40px',
            borderRadius: '28px',
            textAlign: 'center',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ 
              background: '#10B981', 
              width: '64px', 
              height: '64px', 
              borderRadius: '16px', 
              margin: '0 auto 24px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 8px 20px rgba(26, 255, 167, 0.3)'
            }}>café</div>

            <h1 style={{ color: 'white', fontSize: '32px', marginBottom: '8px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Bienvenido a <span style={{ color: '#10B981' }}>CaféIES</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '35px', fontSize: '15px' }}>Pide sin hacer cola</p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              width: '100%' 
            }}>
              <GoogleLogin
            onSuccess={credentialResponse => {
              const decoded = jwtDecode(credentialResponse.credential);
              console.log("Datos de Google:", decoded);

              setUser({ 
                name: decoded.given_name,
                email: decoded.email,
    });
    
    setIsLoggedIn(true);
    setCurrentView('menu');
  }}
  onError={() => console.log('Login Fallido')}
  theme="outline"
  size="large"
  shape="pill"
  locale="es"
/>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Header 
            user={user} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            favoritesCount={favoritesCount}
            orderCount={orderCount}
            setCurrentView={setCurrentView}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <div className="app-body">
            <SideBar 
              currentView={currentView} 
              setCurrentView={setCurrentView} 
              favoritesCount={favorites.size}
              orderCount={orderCount}
              user={user}
              handleLogout={handleLogout}
              onClick={() => setCurrentView('admin')}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />

            {/* Overlay para cerrar sidebar en móvil */}
            {sidebarOpen && (
              <div 
                className="sidebar-overlay"
                onClick={() => setSidebarOpen(false)}
              />
            )}

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
                <span className="slots-label">SELECCIONA HORA DE RECOGIDA:</span>
                <div className="time-slots-container">
                  {franjas.map(franja => (
                    <button 
                      key={franja.id} 
                      className={`time-chip ${franjaElegida === franja.id ? 'active' : ''}`}
                      onClick={() => setFranjaElegida(franja.id)}
                      style={franjaElegida === franja.id ? {backgroundColor: 'var(--orange)', color: 'white'} : {}}
                    >
                      <span className="time-value">{franja.hora_inicio.slice(0, 5)} - {franja.hora_fin.slice(0, 5)}</span>
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
                      {cat === 'todo' ? ' Todo' : cat.charAt(0).toUpperCase() + cat.slice(1)}
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

            {/* VISTA DE PAGO (CHECKOUT) CON STRIPE */}
{currentView === 'checkout' && (
  <section className="view active">
    <div className="content-header" style={{ marginBottom: '10px', paddingBottom: '5px' }}>
      <button className="btn-secondary" onClick={() => setCurrentView('menu')} style={{marginRight: '15px'}}>
        Volver
      </button>
      <h2 className="content-title">Finalizar Pedido</h2>
    </div>

    <div className="checkout-container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px', padding: '10px 20px', maxWidth: '1200px', margin: '0 auto', alignItems: 'start', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } }}>
      
      {/* Columna Izquierda: Stripe */}
      <div className="checkout-methods">
        <h3 style={{ marginBottom: '20px' }}>Pago con tarjeta</h3>
        
        <StripeCheckout 
          total={orderTotal}
          franjaElegida={franjaElegida}
          orderItems={orderItems}
          user={user}
          products={products}
          stripePromise={stripePromise}
          onSuccess={(paymentIntentId) => {
            finalizarPedidoConPago(paymentIntentId);
          }}
        />
      </div>

      {/* Columna Derecha: Resumen */}
      <div className="checkout-summary" style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)', height: 'fit-content' }}>
        <h3 style={{ marginBottom: '20px' }}>Resumen</h3>
        <div style={{ background: '#fff3e0', padding: '12px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', color: '#10B981', fontSize: '14px' }}>
          📍 {franjas.find(f => f.id === franjaElegida) ? `${franjas.find(f => f.id === franjaElegida).hora_inicio} - ${franjas.find(f => f.id === franjaElegida).hora_fin}` : 'Selecciona franja'}
        </div>
        <div className="summary-items">
          {Object.entries(orderItems).map(([id, qty]) => {
            const product = products.find(p => String(p.id) === String(id));
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
      </div>
    </div>
  </section>
)}



            {/*VISTA DE ADMIN */}
            {currentView === 'admin' && (
              <AdminPanel user={user} products={products} />
            )}


            {/*VISTA DE FAVORITOS */}
            {currentView === 'favs' && (
              <section className="view active">
                <div className="favorites-container">
                  <div className="content-header">
                    <h2 className="content-title">Mis Favoritos</h2>
                  </div>
                  <div className="products-grid" style={products.filter(p => favorites.has(p.id)).length === 0 ? {justifyContent: 'center', width: '100%'} : {}}>
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
                      <div className="empty-state">
                        
                        <h3 className="empty-title">Aún no tienes productos favoritos</h3>
                        <p className="empty-text">Marca tus productos favoritos para verlos aquí</p>
                        <button 
                          className="btn-secondary" 
                          onClick={() => setCurrentView('menu')}
                          style={{ marginTop: '20px' }}
                        >
                          Ir al menú
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}


            {/*VISTA DE CARRITO*/}
          {currentView === 'cart' && (
            <section className="view active">
              <div className="content-header">
                <h2 className="content-title">Tu Pedido Actual</h2>
              </div>
              
              <div className="cart-container" style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
                {Object.keys(orderItems).length > 0 ? (
                  <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    {Object.entries(orderItems).map(([id, qty]) => {
                      const product = products.find(p => String(p.id) === String(id));
            return (
              <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '24px' }}>{product?.emoji}</span>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{product?.name}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{product?.price.toFixed(2)}€ / ud.</div>
      </div>
    </div>
    <span style={{ fontWeight: '900', minWidth: '50px', textAlign: 'right' }}>
      {(product?.price * qty).toFixed(2)}€
    </span>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
    <button onClick={() => changeQty(id, -1)} className="btn-qty">-</button>
    <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>{qty}</span>
    <button onClick={() => changeQty(id, 1)} className="btn-qty">+</button>
  </div>
</div>
            );
          })}
          
                  <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '20px' }}>
            Total: <span style={{ color: '#ff5c1a', fontWeight: '900' }}>{orderTotal.toFixed(2)}€</span>
          </div>
          <button 
            className="btn-primary" 
            style={{ padding: '15px 40px' }}
            onClick={() => setCurrentView('checkout')}
          >
            Ir a Pagar
          </button>
        </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ fontSize: '50px' }}>🛒</p>
          <h3>Tu carrito está vacío</h3>
          <button className="btn-secondary" onClick={() => setCurrentView('menu')}>Ir al menú</button>
        </div>
      )}
    </div>
  </section>
)}

        {/*VISTA DE HISTORIAL ACTUALIZADA */}
      {currentView === 'history' && (
      <section className="view active">
        <div className="content-header">
          <h2 className="content-title">Historial de Pedidos</h2>
        </div>

        {/* BOTONES DE FILTRO */}
        <div style={{ padding: '20px', display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
          <button
            onClick={() => setHistorialFilter('todos')}
            style={{
              padding: '10px 20px',
              background: !historialFilter || historialFilter === 'todos' ? '#10B981' : '#f0f0f0',
              color: !historialFilter || historialFilter === 'todos' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Todos
          </button>
          <button
            onClick={() => setHistorialFilter('pendientes')}
            style={{
              padding: '10px 20px',
              background: historialFilter === 'pendientes' ? '#ff9800' : '#f0f0f0',
              color: historialFilter === 'pendientes' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ⏳ Pendientes
          </button>
          <button
            onClick={() => setHistorialFilter('completados')}
            style={{
              padding: '10px 20px',
              background: historialFilter === 'completados' ? '#2ecc71' : '#f0f0f0',
              color: historialFilter === 'completados' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✅ Completados
          </button>
        </div>

        <div className="pedidos-list" style={{ padding: '20px' }}>
          {pedidos.filter(p => p.usuario === user.email).length > 0 ? (
            pedidos
              .filter(p => p.usuario === user.email)
              .filter(p => {
                if (!historialFilter || historialFilter === 'todos') return true;
                if (historialFilter === 'pendientes') return p.estado === 'pendiente';
                if (historialFilter === 'completados') return p.estado === 'completado';
                return true;
              })
              .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
              .map((pedido) => (
          <div key={pedido.id} className="payment-card" style={{ 
            marginBottom: '15px', 
            display: 'block',
            borderLeft: `6px solid ${
              pedido.estado === 'completado' ? '#2ecc71' : 
              pedido.estado === 'cancelado' ? '#e74c3c' : '#10B981'
            }` 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', alignItems: 'center' }}>
              <span>Pedido #{pedido.codigo || String(pedido.id).slice(-5)}</span>
              <span style={{ 
                fontSize: '11px', 
                padding: '4px 8px', 
                borderRadius: '12px',
                textTransform: 'uppercase',
                background: pedido.estado === 'completado' ? '#e8f5e9' : 
                            pedido.estado === 'cancelado' ? '#fdecea' : '#fff3e0',
                color: pedido.estado === 'completado' ? '#2e7d32' : 
                       pedido.estado === 'cancelado' ? '#c62828' : '#e65100',
              }}>
                {pedido.estado || 'en preparación'}
              </span>
            </div>
            <div style={{ marginTop: '8px', padding: '10px', background: '#fff3e0', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', color: '#10B981' }}>
                Código de pedido: <span style={{ fontSize: '16px' }}>{pedido.codigo}</span>
              </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                {new Date(pedido.fecha).toLocaleString()}
              </p>
              <span style={{ color: 'var(--orange)', fontWeight: '900' }}>{pedido.total?.toFixed(2)}€</span>
            </div>

            {/*DETALLE DE PRODUCTOS */}
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#555', background: '#f9f9f9', padding: '8px', borderRadius: '8px' }}>
              <span style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Productos:</span>
              {Object.entries(pedido.items || {}).map(([id, qty]) => {
                const prod = products.find(p => String(p.id) === String(id));
                return <span key={id} style={{ fontSize: '12px', marginRight: '10px' }}>• {qty}x {prod?.name || 'Producto'}</span>;
              })}
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '40px' }}>🛒</p>
          <p>No has realizado ningún pedido todavía.</p>
        </div>
      )}
    </div>
  </section>
)}

{currentView === 'confirmation' && lastOrder && (
  <section className="view active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
    <div style={{ textAlign: 'center', maxWidth: '900px', width: '100%', background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
      <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '10px', color: '#333' }}>¡Pedido Enviado!</h1>
      <p style={{ fontSize: '16px', color: '#999', marginBottom: '40px' }}>Tu pedido ha sido registrado correctamente</p>

      {/* LAYOUT HORIZONTAL: Código a la izquierda, datos a la derecha */}
      <div className="confirmation-grid">
        
        {/* CÓDIGO */}
        <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '15px', border: '2px solid #10B981' }}>
          <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Tu código de pedido</p>
          <div style={{ fontSize: '48px', fontWeight: '900', color: '#10B981', letterSpacing: '8px', marginBottom: '20px', fontFamily: 'monospace' }}>
            {lastOrder.codigo}
          </div>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '0' }}>Usa este código para recoger tu pedido</p>
        </div>

        {/* DATOS */}
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333', fontSize: '14px' }}>📍 Franja horaria</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#10B981', marginBottom: '20px' }}>
            {franjas.find(f => f.id === lastOrder.franja_horaria) 
              ? `${franjas.find(f => f.id === lastOrder.franja_horaria).hora_inicio} - ${franjas.find(f => f.id === lastOrder.franja_horaria).hora_fin}` 
              : 'N/A'}
          </p>

          <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333', fontSize: '14px' }}>🛒 Productos</p>
          <div style={{ marginBottom: '20px' }}>
            {Object.entries(lastOrder.items).map(([id, qty]) => {
              const prod = products.find(p => String(p.id) === String(id));
              return (
                <p key={id} style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  • <strong>{qty}x</strong> {prod?.name || 'Producto'}
                </p>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid #ddd', paddingTop: '15px' }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '0' }}>
              Total: <span style={{ color: '#10B981' }}>{parseFloat(lastOrder.total).toFixed(2)}€</span>
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          setCurrentView('menu');
          setLastOrder(null);
        }}
        style={{
          width: '100%',
          padding: '16px',
          background: '#10B981',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
      >
        Volver al menú
      </button>
    </div>
  </section>
)}

            </main>
            {currentView !== 'checkout' && 
            currentView !== 'admin' && 
            currentView !== 'cart' &&
            currentView !== 'confirmation' && ( 
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
    </GoogleOAuthProvider>
  );
}