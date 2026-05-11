import React from 'react';

function SideBar({
  currentView,
  setCurrentView,
  favoritesCount,
  orderCount,
  user,
  handleLogout,
}) {
  return (
    <nav className="app-sidebar">
      <span className="sidebar-section-label">Usuario</span>

      {[
        { id: 'menu', icon: '🏠', label: 'Menú del día' },
        { id: 'favs', icon: '⭐', label: 'Mis favoritos', badge: favoritesCount || null },
        { id: 'cart', icon: '🛒', label: 'Tu pedido', badge: orderCount || null },
        { id: 'history', icon: '📋', label: 'Historial' },
      ].map(item => (
        <button
          key={item.id}
          className={`nav-link ${currentView === item.id ? 'active' : ''}`}
          onClick={() => setCurrentView(item.id)}
        >
          <span className="nav-link-icon">{item.icon}</span>
          <span className="nav-link-text">{item.label}</span>
          {item.badge && <span className="nav-link-badge">{item.badge}</span>}
        </button>
      ))}

      <div className="sidebar-divider" />

      <span className="sidebar-section-label">Personal</span>

      <button className="nav-link" onClick={() => setCurrentView('admin')}>
        <span className="nav-link-icon">👨‍🍳</span>
        <span className="nav-link-text">Panel cafetería</span>
      </button>

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