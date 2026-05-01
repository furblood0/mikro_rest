import { useState, useEffect } from 'react';
import { orderApi } from '../api';
import { useToast } from '../contexts/ToastContext';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const toast = useToast();

  useEffect(() => { loadOrders(); const i = setInterval(loadOrders, 10000); return () => clearInterval(i); }, []);

  async function loadOrders() {
    try { setOrders(await orderApi.getAll()); } catch { toast('Siparişler yüklenemedi', 'error'); }
    setLoading(false);
  }

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

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);
  const statuses = ['ALL', 'PLACED', 'PREPARING', 'COMPLETED', 'CANCELLED'];
  const statusLabels = { ALL: 'Tümü', PLACED: 'Alındı', PREPARING: 'Hazırlanıyor', COMPLETED: 'Tamamlandı', CANCELLED: 'İptal' };

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Yükleniyor...</span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Siparişler</h2>
          <p>{orders.length} sipariş mevcut</p>
        </div>
      </div>

      <div className="filter-tabs">
        {statuses.map(s => (
          <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {statusLabels[s]} {s !== 'ALL' && `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📦</div><h3>Sipariş bulunamadı</h3></div>
      ) : (
        <div className="orders-grid">
          {filtered.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <div className="order-id">Sipariş #{order.id}</div>
                  <div className="order-customer">{order.customerName}</div>
                  <div className="order-table">{order.tableNumber ? `Masa: ${order.tableNumber}` : 'Paket'}</div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <ul className="order-items-list">
                {order.items?.map((item, idx) => (
                  <li key={idx}>
                    <span>{item.itemName} × {item.quantity}</span>
                    <span>₺{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              {order.specialInstructions && (
                <div style={{ fontSize: '0.82rem', color: 'var(--warning)', fontStyle: 'italic', marginBottom: 8, padding: '6px 10px', background: 'var(--warning-bg)', borderRadius: 'var(--radius-sm)' }}>
                  📝 {order.specialInstructions}
                </div>
              )}

              <div className="order-total">
                <span>Toplam</span>
                <span style={{ color: 'var(--success)' }}>₺{parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>

              <div className="order-actions">
                {order.status === 'PLACED' && (
                  <>
                    <button className="btn btn-sm btn-warning" onClick={() => updateStatus(order.id, 'PREPARING')}>👨‍🍳 Hazırla</button>
                    <button className="btn btn-sm btn-danger" onClick={() => cancelOrder(order.id)}>❌ İptal</button>
                  </>
                )}
                {order.status === 'PREPARING' && (
                  <button className="btn btn-sm btn-success" onClick={() => updateStatus(order.id, 'COMPLETED')}>✅ Tamamla</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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
