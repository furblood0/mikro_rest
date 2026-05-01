import { useState, useEffect } from 'react';
import { menuApi, orderApi, kitchenApi } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ menuCount: 0, orderCount: 0, kitchenCount: 0, totalRevenue: 0, activeOrders: 0, completedOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [menu, orders, kitchen] = await Promise.all([
        menuApi.getAll().catch(() => []),
        orderApi.getAll().catch(() => []),
        kitchenApi.getAll().catch(() => []),
      ]);
      const revenue = orders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);
      const active = orders.filter(o => o.status === 'PLACED' || o.status === 'PREPARING').length;
      const completed = orders.filter(o => o.status === 'COMPLETED').length;
      setStats({ menuCount: menu.length, orderCount: orders.length, kitchenCount: kitchen.length, totalRevenue: revenue, activeOrders: active, completedOrders: completed });
      setRecentOrders(orders.slice(-5).reverse());
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Yükleniyor...</span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Restoran durumu genel görünüm</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.menuCount}</div>
          <div className="stat-label">Menü Ürünü</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.orderCount}</div>
          <div className="stat-label">Toplam Sipariş</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.activeOrders}</div>
          <div className="stat-label">Aktif Sipariş</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.completedOrders}</div>
          <div className="stat-label">Tamamlanan</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🍳</div>
          <div className="stat-value">{stats.kitchenCount}</div>
          <div className="stat-label">Mutfak Siparişi</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₺{stats.totalRevenue.toFixed(2)}</div>
          <div className="stat-label">Toplam Gelir</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>📦 Son Siparişler</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Henüz sipariş yok</h3>
              <p>Siparişler burada görünecek</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sipariş No</th>
                  <th>Müşteri</th>
                  <th>Masa</th>
                  <th>Durum</th>
                  <th>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-light)' }}>#{o.id}</td>
                    <td>{o.customerName}</td>
                    <td>{o.tableNumber || '-'}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ fontWeight: 600 }}>₺{parseFloat(o.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PLACED: { cls: 'badge-info', label: 'Alındı' },
    PREPARING: { cls: 'badge-warning', label: 'Hazırlanıyor' },
    COMPLETED: { cls: 'badge-success', label: 'Tamamlandı' },
    CANCELLED: { cls: 'badge-danger', label: 'İptal' },
  };
  const s = map[status] || { cls: 'badge-accent', label: status };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
