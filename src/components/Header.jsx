import React from 'react';

export default function Header({ 
  user, 
  searchQuery, 
  setSearchQuery, 
  favoritesCount, 
  orderCount, 
  setCurrentView 
}) {
  return (
    <header className="app-header">
      <a className="header-logo" href="#" onClick={() => setCurrentView('menu')}>
        café<span>IES</span>
      </a>
      <div className="header-notice">⏰ Recreo 11:15–11:45 · Pedidos hasta las 10:00</div>
      <div className="header-spacer" />
      <div className="header-search">
        <span>🔍</span>
        <input
          type="search"
          placeholder="Busca bocadillos, zumos…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="header-actions">
        <button className="hdr-btn" onClick={() => setCurrentView('favs')} title="Mis favoritos">
          ⭐
          {favoritesCount > 0 && <span className="hdr-badge">{favoritesCount}</span>}
        </button>
        <button className="hdr-btn primary" onClick={() => setCurrentView('cart')} title="Tu pedido">
          🛒
          {orderCount > 0 && <span className="hdr-badge">{orderCount}</span>}
        </button>
        <button className="user-avatar" onClick={() => setCurrentView('profile')} title="Mi cuenta">
          {user?.avatar || 'U'}
        </button>
      </div>
    </header>
  );
}