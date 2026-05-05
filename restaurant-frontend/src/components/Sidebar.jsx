import { NavLink } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const NAV_ITEMS = [
  { to: '/', icon: '📊', label: 'Dashboard', end: true },
  { to: '/menu', icon: '📋', label: 'Menü Yönetimi' },
  { to: '/order', icon: '🛒', label: 'Sipariş Ver', cart: true },
  { to: '/orders', icon: '📦', label: 'Siparişler' },
  { to: '/kitchen', icon: '👨‍🍳', label: 'Mutfak' },
];

const TECH_TAGS = ['Spring Boot', 'Eureka', 'Gateway', 'PostgreSQL', 'React', 'Docker'];

export default function Sidebar() {
  const { count } = useCart();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>🍽️ SmartRestoran</h1>
        <span>Sipariş Yönetim Sistemi</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">
              {item.label}
              {item.cart && count > 0 && (
                <span style={{
                  marginLeft: 6,
                  background: 'var(--danger)',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '1px 7px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                }}>
                  {count}
                </span>
              )}
            </span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '20px 20px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
          Teknoloji Yığını
        </div>
        <div className="tech-tags">
          {TECH_TAGS.map(t => (
            <span key={t} className="tech-tag">{t}</span>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          Microservices v1.0
        </div>
      </div>
    </aside>
  );
}
