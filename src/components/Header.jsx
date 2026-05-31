import React from 'react';

const ADMIN_EMAIL = 'davidgonzaga140@gmail.com';

export default function Header({ 
  user, 
  searchQuery, 
  setSearchQuery, 
  favoritesCount, 
  orderCount, 
  setCurrentView,
  sidebarOpen,
  setSidebarOpen
}) {
  const esAdmin = user?.email === ADMIN_EMAIL;
  
  return (
    <header className="app-header">
      <button 
        className="hamburger-menu"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title="Menú"
      >
        ☰
      </button>

      <a className="header-logo" href="#" onClick={() => setCurrentView('menu')}>
        café<span>IES</span>
      </a>
      <div className="header-notice">⏰ Recreo 11:15–11:45</div>
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
        {!esAdmin && (
          <>
            <button className="hdr-btn" onClick={() => setCurrentView('favs')} title="Mis favoritos">
              ⭐
              {favoritesCount > 0 && <span className="hdr-badge">{favoritesCount}</span>}
            </button>
            <button className="hdr-btn primary" onClick={() => setCurrentView('cart')} title="Tu pedido">
              🛒
              {orderCount > 0 && <span className="hdr-badge">{orderCount}</span>}
            </button>
          </>
        )}
        
      </div>
    </header>
  );
}