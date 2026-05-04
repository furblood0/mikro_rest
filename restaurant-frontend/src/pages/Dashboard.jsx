import { useState, useEffect } from 'react';
import { menuApi, orderApi, kitchenApi } from '../api';

const SERVICES = [
  { name: 'Eureka',  icon: '🗂️', check: () => menuApi.getAll() },
  { name: 'Gateway', icon: '🚪', check: () => orderApi.getAll() },
  { name: 'Menu',    icon: '📋', check: () => menuApi.getAll() },
  { name: 'Order',   icon: '📦', check: () => orderApi.getAll() },
  { name: 'Kitchen', icon: '👨‍🍳', check: () => kitchenApi.getAll() },
];

const STATUS_META = {
  PLACED:    { cls: 'badge-info',    label: 'Alındı' },
  PREPARING: { cls: 'badge-warning', label: 'Hazırlanıyor' },
  COMPLETED: { cls: 'badge-success', label: 'Tamamlandı' },
  CANCELLED: { cls: 'badge-danger',  label: 'İptal' },
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    menuCount: 0, orderCount: 0, kitchenCount: 0,
    totalRevenue: 0, activeOrders: 0, completedOrders: 0, cancelledOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceStatus, setServiceStatus] = useState({});

  useEffect(() => {
    loadData();
    checkServices();
    const d = setInterval(loadData, 15000);
    const s = setInterval(checkServices, 30000);
    return () => { clearInterval(d); clearInterval(s); };
  }, []);

  async function loadData() {
    try {
      const [menu, orders, kitchen] = await Promise.all([
        menuApi.getAll().catch(() => []),
        orderApi.getAll().catch(() => []),
        kitchenApi.getAll().catch(() => []),
      ]);
      const revenue = orders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);
      setStats({
        menuCount: menu.length,
        orderCount: orders.length,
        kitchenCount: kitchen.length,
        totalRevenue: revenue,
        activeOrders: orders.filter(o => o.status === 'PLACED' || o.status === 'PREPARING').length,
        completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
        cancelledOrders: orders.filter(o => o.status === 'CANCELLED').length,
      });
      setRecentOrders(orders.slice(-6).reverse());
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function checkServices() {
    const results = {};
    await Promise.all(SERVICES.map(async svc => {
      try { await svc.check(); results[svc.name] = 'up'; }
      catch { results[svc.name] = 'down'; }
    }));
    setServiceStatus(results);
  }

  const allUp = Object.keys(serviceStatus).length > 0 &&
    Object.values(serviceStatus).every(s => s === 'up');

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner" />
      <span>Yükleniyor...</span>
    </div>
  );

  return (
    <div>
      {/* Başlık */}
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Restoran genel görünümü</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {allUp && <div className="live-badge"><div className="live-dot" />CANLI</div>}
          <div className="refresh-info">
            <div className="refresh-spin" />
            15s'de bir güncellenir
          </div>
        </div>
      </div>

      {/* Servis durumu — kompakt yatay şerit */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '10px 16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 28,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginRight: 4 }}>
          Servisler
        </span>
        {SERVICES.map(svc => {
          const status = serviceStatus[svc.name];
          const isUp = status === 'up';
          const isDown = status === 'down';
          return (
            <div key={svc.name} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 12px',
              background: isUp ? 'var(--success-bg)' : isDown ? 'var(--danger-bg)' : 'var(--bg-secondary)',
              border: `1px solid ${isUp ? 'rgba(0,206,201,0.25)' : isDown ? 'rgba(255,107,107,0.25)' : 'var(--border)'}`,
              borderRadius: 20,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: isUp ? 'var(--success)' : isDown ? 'var(--danger)' : 'var(--text-muted)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isUp ? 'var(--success)' : isDown ? 'var(--danger)' : 'var(--text-muted)',
                flexShrink: 0,
                animation: isUp ? 'pulse-dot 2s ease-in-out infinite' : 'none',
              }} />
              {svc.icon} {svc.name}
            </div>
          );
        })}
      </div>

      {/* Ana stat kartları — 3 büyük */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
        <BigStatCard
          gradient="linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)"
          emoji="🔥"
          value={stats.activeOrders}
          label="Aktif Sipariş"
          sub="Hazırlanmayı bekliyor"
        />
        <BigStatCard
          gradient="linear-gradient(135deg, #00b894 0%, #55efc4 100%)"
          emoji="✅"
          value={stats.completedOrders}
          label="Tamamlanan"
          sub="Başarıyla teslim edildi"
        />
        <BigStatCard
          gradient="linear-gradient(135deg, #f9ca24 0%, #fdcb6e 100%)"
          emoji="💰"
          value={`₺${stats.totalRevenue.toFixed(0)}`}
          label="Toplam Gelir"
          sub="Tamamlanan siparişlerden"
        />
      </div>

      {/* İkincil stat kartları — 3 küçük */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <SmallStatCard emoji="📋" value={stats.menuCount}    label="Menü Ürünü"     color="var(--info)" />
        <SmallStatCard emoji="📦" value={stats.orderCount}   label="Toplam Sipariş" color="var(--accent-light)" />
        <SmallStatCard emoji="👨‍🍳" value={stats.kitchenCount} label="Mutfak Kaydı"   color="var(--success)" />
      </div>

      {/* Son siparişler tablosu */}
      <div className="card">
        <div className="card-header">
          <h3>Son Siparişler</h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>En yeni 6 sipariş</span>
        </div>
        <div>
          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Henüz sipariş yok</h3>
              <p>"Sipariş Ver" sayfasından ilk siparişi oluşturun</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Müşteri</th>
                  <th>Masa</th>
                  <th>Durum</th>
                  <th>Tutar</th>
                  <th>Saat</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => {
                  const s = STATUS_META[o.status] || { cls: 'badge-accent', label: o.status };
                  return (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent-light)' }}>#{o.id}</td>
                      <td style={{ fontWeight: 500 }}>{o.customerName}</td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {o.tableNumber ? `🪑 ${o.tableNumber}` : '📦 Paket'}
                      </td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                        ₺{parseFloat(o.totalAmount).toFixed(2)}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums' }}>
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function BigStatCard({ gradient, emoji, value, label, sub }) {
  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      transition: 'var(--transition)',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Hero */}
      <div style={{
        background: gradient, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }}>{emoji}</span>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-1px' }}>
            {value}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', marginTop: 2, fontWeight: 600 }}>
            {label}
          </div>
        </div>
      </div>
      {/* Alt */}
      <div style={{
        background: 'var(--bg-card)', padding: '10px 24px',
        fontSize: '0.75rem', color: 'var(--text-muted)',
      }}>
        {sub}
      </div>
    </div>
  );
}

function SmallStatCard({ emoji, value, label, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      transition: 'var(--transition)',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
      <div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, color, letterSpacing: '-0.5px', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
          {label}
        </div>
      </div>
    </div>
  );
}
