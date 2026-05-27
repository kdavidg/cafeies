import React from 'react';

const ADMIN_EMAIL = 'davidgonzaga140@gmail.com';

function SideBar({
  currentView,
  setCurrentView,
  favoritesCount,
  orderCount,
  user,
  handleLogout,
  sidebarOpen,
  setSidebarOpen,
}) {
  const esAdmin = user?.email === ADMIN_EMAIL;

  return (
    <nav className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <span className="sidebar-section-label">Usuario</span>

      {/* MENÚ - aparece para todos */}
      <button
        className={`nav-link ${currentView === 'menu' ? 'active' : ''}`}
        onClick={() => setCurrentView('menu')}
      >
        <span className="nav-link-icon">🏠</span>
        <span className="nav-link-text">Menú del día</span>
      </button>

      {/* Opciones del CLIENTE - solo si NO es admin */}
      {!esAdmin && (
        <>
          <button
            className={`nav-link ${currentView === 'favs' ? 'active' : ''}`}
            onClick={() => setCurrentView('favs')}
          >
            <span className="nav-link-icon">⭐</span>
            <span className="nav-link-text">Mis favoritos</span>
            {favoritesCount && <span className="nav-link-badge">{favoritesCount}</span>}
          </button>

          <button
            className={`nav-link ${currentView === 'cart' ? 'active' : ''}`}
            onClick={() => setCurrentView('cart')}
          >
            <span className="nav-link-icon">🛒</span>
            <span className="nav-link-text">Tu pedido</span>
            {orderCount && <span className="nav-link-badge">{orderCount}</span>}
          </button>

          <button
            className={`nav-link ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentView('history')}
          >
            <span className="nav-link-icon">📋</span>
            <span className="nav-link-text">Historial</span>
          </button>
        </>
      )}

      {/* Panel Admin - solo si es admin */}
      {esAdmin && (
        <>
          <span className="sidebar-section-label">Administración</span>

          <button
            className={`nav-link ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentView('admin')}
          >
            <span className="nav-link-icon">📊</span>
            <span className="nav-link-text">Panel Admin</span>
          </button>
        </>
      )}

      <div className="sidebar-divider" />

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div
            className="user-avatar"
            style={{ width: '38px', height: '38px', fontSize: '13px' }}
          >
            {user?.avatar || 'U'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name">{user?.name || 'Usuario'}</div>
            <div className="sidebar-user-email">{user?.email || ''}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '8px 12px',
            background: 'var(--orange)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default SideBar;