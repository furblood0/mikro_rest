import { NavLink } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function Sidebar() {
  const { count } = useCart();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>🍽️ SmartRestoran</h1>
        <span>Sipariş Yönetim Sistemi</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          <span className="nav-icon">📊</span>
          <span className="nav-label">Dashboard</span>
        </NavLink>
        <NavLink to="/menu" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📋</span>
          <span className="nav-label">Menü</span>
        </NavLink>
        <NavLink to="/order" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🛒</span>
          <span className="nav-label">Sipariş Ver {count > 0 && `(${count})`}</span>
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📦</span>
          <span className="nav-label">Siparişler</span>
        </NavLink>
        <NavLink to="/kitchen" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">👨‍🍳</span>
          <span className="nav-label">Mutfak</span>
        </NavLink>
      </nav>
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Microservices v1.0</div>
      </div>
    </aside>
  );
}
