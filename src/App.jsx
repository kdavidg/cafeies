import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

import Header from './components/Header.jsx';
import SideBar from './components/Sidebar.jsx';
import ProductCard from './components/ProductCard.jsx';
import OrderPanel from './components/OrderPanel.jsx';
import LoginForm from './components/Login.jsx';

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
  const franjasDisponibles = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00"];
  const [franjaElegida, setFranjaElegida] = useState('10:45');
  const [metodoPago, setMetodoPago] = useState('monedero');
  

 useEffect(() => {
  const fetchProducts = async () => { // La función async se define AQUÍ dentro
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
  if (currentView === 'history' || currentView === 'menu') {
    fetchPedidos();
  }
}, [currentView]);


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

  const finalizarPedido = async () => {
  const pedidoParaEnviar = {
    usuario: user?.email || "usuario_anonimo@cafeies.com",
    items: orderItems,
    total: orderTotal,
    franja_horaria: franjaElegida,
    fecha: new Date().toISOString(),
    nota: document.getElementById('order-note-input')?.value || ""
  };

  try {
    // CAMBIA ESTA URL por la que te dio Railway para el backend
    const response = await fetch('https://backend-production-2b15.up.railway.app/api/pedidos/crear/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoParaEnviar),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Respuesta de MySQL:", result);
      
      alert("¡Pedido guardado correctamente! 🎉");
      
      // Limpiar y navegar
      setOrderItems({});
      if (typeof fetchPedidos === 'function') fetchPedidos();
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

const finalizarPedidoGestion = async (pedidoId, accion) => {
    // accion será 'completado' o 'cancelado'
    const nuevoEstado = accion === 'listo' ? 'completado' : 'cancelado';
    
    if (!window.confirm(`¿Seguro que quieres marcar como ${accion.toUpperCase()}?`)) return;

    const API_URL = window.location.hostname === "localhost" 
      ? "http://127.0.0.1:8000" 
      : "https://backend-production-2b15.up.railway.app";

    try {
      // Cambiamos el método de 'DELETE' a 'POST' o 'PATCH'
      const response = await fetch(`${API_URL}/api/pedidos/eliminar/${pedidoId}/`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        fetchPedidos(); // Refresca las listas
      } else {
        alert("Error al actualizar el pedido.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
};


  // Filtrado y Cálculos
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

  // --- RENDER ---
  return (
    <GoogleOAuthProvider clientId="389069267633-j5n6e0r6p4ec99be2v3hfjderhe54vgh.apps.googleusercontent.com">
    <div className="app-container">
      {!isLoggedIn ? (
        /* --- PANTALLA DE LOGIN OSCURA --- */
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
            {/* Tu logo cuadrado naranja */}
            <div style={{ 
              background: '#ff5c1a', 
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
              boxShadow: '0 8px 20px rgba(255, 92, 26, 0.3)'
            }}>café</div>

            <h1 style={{ color: 'white', fontSize: '32px', marginBottom: '8px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Bienvenido a <span style={{ color: '#ff5c1a' }}>CaféIES</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '35px', fontSize: '15px' }}>Pide sin hacer cola</p>
            
            {/* CONTENEDOR DEL BOTÓN BLANCO */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              width: '100%' 
            }}>
              <GoogleLogin
            onSuccess={credentialResponse => {
              // Decodificamos el token para obtener tus datos reales
              const decoded = jwtDecode(credentialResponse.credential);
              console.log("Datos de Google:", decoded);

              // Guardamos los datos reales en el estado
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
                <span className="slots-label">SELECCIONA HORA DE RECOGIDA:</span>
                <div className="time-slots-container">
                  {TIME_SLOTS.map(slot => (
                    <button 
                      key={slot.time} 
                      // Si la hora del botón coincide con el estado, le ponemos la clase 'active' o 'selected'
                      className={`time-chip ${franjaElegida === slot.time ? 'active' : ''}`}
                      // IMPORTANTE: Al hacer clic, actualizamos el estado
                      onClick={() => setFranjaElegida(slot.time)}
                      style={franjaElegida === slot.time ? {backgroundColor: 'var(--orange)', color: 'white'} : {}}
                    >
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
{/* VISTA DE PAGO (CHECKOUT) */}
{currentView === 'checkout' && (
  <section className="view active">
    <div className="content-header">
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
          
          {/* OPCIÓN 1: MONEDERO */}
          <label className="payment-card" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '20px', 
            borderRadius: '15px', 
            cursor: 'pointer',
            transition: '0.3s',
            // El borde y el fondo cambian dinámicamente:
            border: metodoPago === 'monedero' ? '2px solid var(--orange)' : '1px solid var(--border)', 
            background: metodoPago === 'monedero' ? 'var(--orange-light)' : 'white' 
          }}>
            <input 
              type="radio" 
              name="payment" // Mismo nombre para que se deseleccionen entre sí
              value="monedero"
              checked={metodoPago === 'monedero'} 
              onChange={(e) => setMetodoPago(e.target.value)} 
              style={{ marginRight: '15px' }} 
            />
            <div>
              <div style={{ fontWeight: 'bold' }}>💰 Monedero Virtual</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Saldo disponible: 14.50€</div>
            </div>
          </label>

          {/* OPCIÓN 2: EFECTIVO */}
          <label className="payment-card" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '20px', 
            borderRadius: '15px', 
            cursor: 'pointer',
            transition: '0.3s',
            // El borde y el fondo cambian dinámicamente:
            border: metodoPago === 'efectivo' ? '2px solid var(--orange)' : '1px solid var(--border)', 
            background: metodoPago === 'efectivo' ? 'var(--orange-light)' : 'white' 
          }}>
            <input 
              type="radio" 
              name="payment" // Mismo nombre para que se deseleccionen entre sí
              value="efectivo"
              checked={metodoPago === 'efectivo'} 
              onChange={(e) => setMetodoPago(e.target.value)} 
              style={{ marginRight: '15px' }} 
            />
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


{/* VISTA DE PANEL DE CAFETERÍA (ADMIN) - VERSIÓN CON ESTADOS */}
{currentView === 'admin' && (
  <section className="view active admin-view-fix">
    {/* 1. CABECERA FIJA */}
    <div className="admin-header-main" style={{ textAlign: 'center', padding: '20px 0' }}>
      <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>
        Panel de Gestión - Cafetería
      </h2>
      <button 
        className="btn-secondary" 
        onClick={fetchPedidos} 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
      >
        🔄 Actualizar Pedidos
      </button>
    </div>

    <div className="admin-content-wrapper" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
      
      {/* 2. BLOQUE DE ESTADÍSTICAS */}
      <div className="stats-row" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        {/* Solo contamos los que NO están cancelados para la estadística */}
        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '15px', borderLeft: '6px solid #2196f3', textAlign: 'center' }}>
          <small style={{ fontWeight: 'bold', color: '#1976d2', textTransform: 'uppercase' }}>Pendientes</small>
          <div style={{ fontSize: '32px', fontWeight: '900' }}>
            {pedidos.filter(p => p.estado === 'pendiente' || !p.estado).length}
          </div>
        </div>
        
        <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '15px', borderLeft: '6px solid #ff9800', textAlign: 'center' }}>
          <small style={{ fontWeight: 'bold', color: '#e65100', textTransform: 'uppercase' }}>Caja Hoy</small>
          <div style={{ fontSize: '32px', fontWeight: '900' }}>
            {pedidos
              .filter(p => p.estado !== 'cancelado')
              .reduce((acc, p) => acc + (parseFloat(p.total) || 0), 0).toFixed(2)}€
          </div>
        </div>

        <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '15px', borderLeft: '6px solid #4caf50', textAlign: 'center' }}>
          <small style={{ fontWeight: 'bold', color: '#2e7d32', textTransform: 'uppercase' }}>Servicio</small>
          <div style={{ fontSize: '32px', fontWeight: '900' }}>ACTIVO</div>
        </div>
      </div>

      {/* 3. LISTADO DE PEDIDOS FILTRADO */}
      <div className="orders-section">
        <h3 style={{ marginBottom: '20px', fontSize: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
          Pedidos Entrantes (Sólo Pendientes)
        </h3>
        
        <div className="orders-container-fixed" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* CRÍTICO: Filtramos para que el admin vea solo los pendientes */}
          {pedidos.filter(p => p.estado === 'pendiente' || !p.estado).length > 0 ? (
            [...pedidos]
              .filter(p => p.estado === 'pendiente' || !p.estado)
              .reverse()
              .map((pedido) => (
              <div key={pedido.id} className="admin-order-card" style={{ 
                background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ background: '#ff5c1a', color: 'white', padding: '5px 12px', borderRadius: '8px', fontWeight: 'bold' }}>
                      ⏰ {pedido.franja_horaria || "10:45"}
                    </span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{pedido.usuario?.split('@')[0]}</span>
                  </div>
                  <span style={{ fontWeight: '900', color: '#ff5c1a', fontSize: '20px' }}>{pedido.total?.toFixed(2)}€</span>
                </div>

                <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {Object.entries(pedido.items || {}).map(([id, qty]) => {
                      const prod = products.find(p => String(p.id) === String(id));
                      return <li key={id} style={{ marginBottom: '5px' }}><strong>{qty}x</strong> {prod?.nombre || 'Producto'}</li>;
                    })}
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => finalizarPedidoGestion(pedido.id, 'listo')}
                    className="btn-primary" 
                    style={{ flex: 1, background: '#2ecc71', padding: '12px' }}
                  >
                    Marcar como Listo
                  </button>
                  <button 
                    onClick={() => finalizarPedidoGestion(pedido.id, 'cancelar')}
                    className="btn-secondary" 
                    style={{ background: '#ffeded', color: '#e74c3c', border: '1px solid #ffc1c1', padding: '12px' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: '#ccc' }}>
              <p style={{ fontSize: '40px' }}>😴</p>
              <p>No hay pedidos pendientes por ahora.</p>
            </div>
          )}
        </div>
      </div>
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


            {/* --- VISTA DE CARRITO (LA QUE TE FALTA) --- */}
{currentView === 'cart' && (
  <section className="view active">
    <div className="content-header">
      <h2 className="content-title">Tu Pedido Actual 🛒</h2>
    </div>
    
    <div className="cart-container" style={{ padding: '20px' }}>
      {Object.keys(orderItems).length > 0 ? (
        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          {Object.entries(orderItems).map(([id, qty]) => {
            const product = products.find(p => String(p.id) === String(id));
            return (
              <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '24px' }}>{product?.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{product?.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{product?.price.toFixed(2)}€ / ud.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <button onClick={() => changeQty(id, -1)} className="btn-qty">-</button>
                  <span style={{ fontWeight: 'bold' }}>{qty}</span>
                  <button onClick={() => changeQty(id, 1)} className="btn-qty">+</button>
                  <span style={{ marginLeft: '15px', fontWeight: '900', width: '60px', textAlign: 'right' }}>
                    {(product?.price * qty).toFixed(2)}€
                  </span>
                </div>
              </div>
            );
          })}
          
          <div style={{ marginTop: '30px', textAlign: 'right' }}>
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

            {/* 3. VISTA DE HISTORIAL ACTUALIZADA */}
{currentView === 'history' && (
  <section className="view active">
    <div className="content-header">
      <h2 className="content-title">Historial de Pedidos 📋</h2>
    </div>
    <div className="pedidos-list" style={{ padding: '20px' }}>
      {/* 1. FILTRO: Solo mostramos los pedidos del usuario logueado */}
      {pedidos.filter(p => p.usuario === user.email).length > 0 ? (
        pedidos
          .filter(p => p.usuario === user.email)
          .reverse() // Para que el más nuevo salga arriba
          .map((pedido) => (
          <div key={pedido.id} className="payment-card" style={{ 
            marginBottom: '15px', 
            display: 'block',
            borderLeft: `6px solid ${
              pedido.estado === 'completado' ? '#2ecc71' : 
              pedido.estado === 'cancelado' ? '#e74c3c' : '#ff5c1a'
            }` 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', alignItems: 'center' }}>
              <span>Pedido #{String(pedido.id).slice(-5)}</span>
              
              {/* 2. ETIQUETA DE ESTADO DINÁMICA */}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                {new Date(pedido.fecha).toLocaleString()}
              </p>
              <span style={{ color: 'var(--orange)', fontWeight: '900' }}>{pedido.total?.toFixed(2)}€</span>
            </div>

            {/* 3. DETALLE DE PRODUCTOS (Opcional pero recomendado) */}
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#555', background: '#f9f9f9', padding: '8px', borderRadius: '8px' }}>
              <span style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Productos:</span>
              {Object.entries(pedido.items || {}).map(([id, qty]) => {
                const prod = products.find(p => String(p.id) === String(id));
                return <span key={id} style={{ fontSize: '12px', marginRight: '10px' }}>• {qty}x {prod?.nombre || 'Producto'}</span>;
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
            </main>
            {currentView !== 'checkout' && 
            currentView !== 'staff' && 
            currentView !== 'admin' && 
            currentView !== 'cart' && ( 
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