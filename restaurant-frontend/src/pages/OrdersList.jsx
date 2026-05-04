import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../api';
import { useToast } from '../contexts/ToastContext';

const STATUS_META = {
  ALL:       { emoji: '📦', label: 'Tümü',        gradient: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)', badge: null },
  PLACED:    { emoji: '📋', label: 'Alındı',       gradient: 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)', badge: 'badge-info' },
  PREPARING: { emoji: '🔥', label: 'Hazırlanıyor', gradient: 'linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)', badge: 'badge-warning' },
  COMPLETED: { emoji: '✅', label: 'Tamamlandı',   gradient: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)', badge: 'badge-success' },
  CANCELLED: { emoji: '❌', label: 'İptal',        gradient: 'linear-gradient(135deg, #636e72 0%, #b2bec3 100%)', badge: 'badge-danger' },
};

function formatTime(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  if (d.toDateString() === new Date().toDateString()) return 'Bugün';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const toast = useToast();

  const loadOrders = useCallback(async () => {
    try { setOrders(await orderApi.getAll()); }
    catch { toast('Siparişler yüklenemedi', 'error'); }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadOrders();
    const i = setInterval(loadOrders, 10000);
    return () => clearInterval(i);
  }, [loadOrders]);

  async function updateStatus(id, status) {
    try {
      await orderApi.updateStatus(id, status);
      toast('Durum güncellendi', 'success');
      loadOrders();
    } catch { toast('Güncelleme hatası', 'error'); }
  }

  async function cancelOrder(id) {
    if (!confirm('Siparişi iptal etmek istediğinize emin misiniz?')) return;
    try {
      await orderApi.cancel(id);
      toast('Sipariş iptal edildi', 'success');
      loadOrders();
    } catch { toast('İptal hatası', 'error'); }
  }

  const STATUSES = ['ALL', 'PLACED', 'PREPARING', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  const totalRevenue = orders
    .filter(o => o.status === 'COMPLETED')
    .reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner" />
      <span>Siparişler yükleniyor...</span>
    </div>
  );

  return (
    <div>
      {/* Başlık */}
      <div className="page-header">
        <div>
          <h2>Siparişler</h2>
          <p>{orders.length} sipariş — 10 saniyede bir otomatik güncellenir</p>
        </div>
        <div className="refresh-info">
          <div className="refresh-spin" />
          Canlı takip aktif
        </div>
      </div>

      {/* İstatistik bandı */}
      <div className="menu-stats-bar">
        <div className="menu-stat-item">
          <span>📦</span>
          <strong>{orders.length}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Toplam</span>
        </div>
        <div className="menu-stat-sep" />
        <div className="menu-stat-item">
          <span>📋</span>
          <strong style={{ color: 'var(--info)' }}>{orders.filter(o => o.status === 'PLACED').length}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Alındı</span>
        </div>
        <div className="menu-stat-sep" />
        <div className="menu-stat-item">
          <span>🔥</span>
          <strong style={{ color: 'var(--warning)' }}>{orders.filter(o => o.status === 'PREPARING').length}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Hazırlanıyor</span>
        </div>
        <div className="menu-stat-sep" />
        <div className="menu-stat-item">
          <span>✅</span>
          <strong style={{ color: 'var(--success)' }}>{orders.filter(o => o.status === 'COMPLETED').length}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Tamamlandı</span>
        </div>
        <div className="menu-stat-sep" />
        <div className="menu-stat-item">
          <span>💰</span>
          <strong style={{ color: 'var(--warning)' }}>₺{totalRevenue.toFixed(0)}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Gelir</span>
        </div>
      </div>

      {/* Statü pill filtreleri */}
      <div className="category-pills">
        {STATUSES.map(s => {
          const meta = STATUS_META[s];
          const count = s === 'ALL' ? orders.length : orders.filter(o => o.status === s).length;
          return (
            <button
              key={s}
              className={`category-pill ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              <span className="category-pill-emoji">{meta.emoji}</span>
              <span className="category-pill-name">{meta.label}</span>
              <span className="category-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Sipariş kartları */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{STATUS_META[filter]?.emoji || '📦'}</div>
          <h3>Bu filtrede sipariş yok</h3>
          <p>Farklı bir durum seçin</p>
        </div>
      ) : (
        <div className="orders-grid">
          {filtered.map(order => {
            const meta = STATUS_META[order.status] || STATUS_META.ALL;
            return (
              <div key={order.id} className="menu-card">
                {/* Statü hero alanı */}
                <div
                  className="menu-card-hero"
                  style={{ background: meta.gradient, height: 80 }}
                >
                  <span className="menu-card-hero-emoji" style={{ fontSize: '2rem' }}>
                    {meta.emoji}
                  </span>
                  {/* Masa / paket rozeti */}
                  <div style={{
                    position: 'absolute', top: 10, left: 12, zIndex: 2,
                    background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
                    color: 'white', borderRadius: 20, padding: '3px 10px',
                    fontSize: '0.7rem', fontWeight: 700,
                  }}>
                    {order.tableNumber ? `🪑 Masa ${order.tableNumber}` : '📦 Paket'}
                  </div>
                  {/* Saat rozeti */}
                  <div style={{
                    position: 'absolute', top: 10, right: 12, zIndex: 2,
                    background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
                    color: 'white', borderRadius: 20, padding: '3px 10px',
                    fontSize: '0.7rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                  }}>
                    {formatDate(order.createdAt)} {formatTime(order.createdAt)}
                  </div>
                </div>

                {/* İçerik */}
                <div className="menu-card-body">
                  {/* Sipariş no + müşteri + statü */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-light)', marginBottom: 2 }}>
                        Sipariş #{order.id}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{order.customerName}</div>
                    </div>
                    {meta.badge && (
                      <span className={`badge ${meta.badge}`}>{meta.label}</span>
                    )}
                  </div>

                  {/* Ürün listesi */}
                  <ul className="order-items-list">
                    {order.items?.map((item, idx) => (
                      <li key={idx}>
                        <span style={{ fontWeight: 500 }}>{item.itemName} × {item.quantity}</span>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                          ₺{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Özel not */}
                  {order.specialInstructions && (
                    <div style={{
                      fontSize: '0.8rem', color: 'var(--warning)', fontStyle: 'italic',
                      marginBottom: 10, padding: '6px 10px',
                      background: 'var(--warning-bg)', borderRadius: 'var(--radius-sm)',
                    }}>
                      📝 {order.specialInstructions}
                    </div>
                  )}

                  {/* Toplam */}
                  <div className="order-total" style={{ marginTop: 'auto' }}>
                    <span>Toplam</span>
                    <span style={{ color: 'var(--success)', fontSize: '1.1rem' }}>
                      ₺{parseFloat(order.totalAmount).toFixed(2)}
                    </span>
                  </div>

                  {/* Aksiyon butonları */}
                  {(order.status === 'PLACED' || order.status === 'PREPARING') && (
                    <div className="order-actions">
                      {order.status === 'PLACED' && (
                        <>
                          <button className="btn btn-sm btn-warning" style={{ flex: 1 }} onClick={() => updateStatus(order.id, 'PREPARING')}>
                            🔥 Hazırla
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => cancelOrder(order.id)}>
                            İptal
                          </button>
                        </>
                      )}
                      {order.status === 'PREPARING' && (
                        <button className="btn btn-sm btn-success" style={{ flex: 1 }} onClick={() => updateStatus(order.id, 'COMPLETED')}>
                          ✅ Tamamla
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
