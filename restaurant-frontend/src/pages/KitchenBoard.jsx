import { useState, useEffect } from 'react';
import { kitchenApi } from '../api';
import { useToast } from '../contexts/ToastContext';

export default function KitchenBoard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { loadOrders(); const i = setInterval(loadOrders, 8000); return () => clearInterval(i); }, []);

  async function loadOrders() {
    try { setOrders(await kitchenApi.getAll()); } catch { toast('Mutfak siparişleri yüklenemedi', 'error'); }
    setLoading(false);
  }

  async function updateStatus(orderId, status) {
    try {
      await kitchenApi.updateStatus(orderId, status);
      toast(`Sipariş ${status === 'PREPARING' ? 'hazırlanmaya başlandı' : 'tamamlandı'}`, 'success');
      loadOrders();
    } catch { toast('Güncelleme hatası', 'error'); }
  }

  async function addNotes(orderId) {
    const notes = prompt('Mutfak notu ekleyin:');
    if (!notes) return;
    try {
      await kitchenApi.addNotes(orderId, notes);
      toast('Not eklendi', 'success');
      loadOrders();
    } catch { toast('Not eklenemedi', 'error'); }
  }

  const received = orders.filter(o => o.status === 'RECEIVED');
  const preparing = orders.filter(o => o.status === 'PREPARING');
  const completed = orders.filter(o => o.status === 'COMPLETED');

  function formatTime(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Yükleniyor...</span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>👨‍🍳 Mutfak Paneli</h2>
          <p>Sipariş hazırlık durumlarını takip edin</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="badge badge-info">📥 Bekleyen: {received.length}</div>
          <div className="badge badge-warning">🔥 Hazırlanan: {preparing.length}</div>
          <div className="badge badge-success">✅ Tamamlanan: {completed.length}</div>
        </div>
      </div>

      <div className="kitchen-columns">
        {/* RECEIVED */}
        <div className="kitchen-column">
          <div className="kitchen-column-header" style={{ borderBottom: '2px solid var(--info)' }}>
            <h3>📥 Bekleyen</h3>
            <span className="kitchen-count">{received.length}</span>
          </div>
          <div className="kitchen-column-body">
            {received.length === 0 ? (
              <div className="empty-state" style={{ padding: 20 }}><p style={{ fontSize: '0.8rem' }}>Bekleyen sipariş yok</p></div>
            ) : received.map(o => (
              <div key={o.id} className="kitchen-card">
                <div className="kitchen-card-order">Sipariş #{o.orderId}</div>
                <div className="kitchen-card-items">{o.itemsSummary}</div>
                {o.specialInstructions && <div className="kitchen-card-notes">📝 {o.specialInstructions}</div>}
                {o.notes && <div style={{ fontSize: '0.78rem', color: 'var(--accent-light)', marginBottom: 8 }}>💬 {o.notes}</div>}
                <div className="kitchen-card-time">⏰ Alındı: {formatTime(o.receivedAt)}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm btn-warning" style={{ flex: 1 }} onClick={() => updateStatus(o.orderId, 'PREPARING')}>🔥 Hazırla</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => addNotes(o.orderId)}>📝</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PREPARING */}
        <div className="kitchen-column">
          <div className="kitchen-column-header" style={{ borderBottom: '2px solid var(--warning)' }}>
            <h3>🔥 Hazırlanıyor</h3>
            <span className="kitchen-count">{preparing.length}</span>
          </div>
          <div className="kitchen-column-body">
            {preparing.length === 0 ? (
              <div className="empty-state" style={{ padding: 20 }}><p style={{ fontSize: '0.8rem' }}>Hazırlanan sipariş yok</p></div>
            ) : preparing.map(o => (
              <div key={o.id} className="kitchen-card">
                <div className="kitchen-card-order">Sipariş #{o.orderId}</div>
                <div className="kitchen-card-items">{o.itemsSummary}</div>
                {o.specialInstructions && <div className="kitchen-card-notes">📝 {o.specialInstructions}</div>}
                {o.notes && <div style={{ fontSize: '0.78rem', color: 'var(--accent-light)', marginBottom: 8 }}>💬 {o.notes}</div>}
                <div className="kitchen-card-time">⏰ Başladı: {formatTime(o.startedAt)}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm btn-success" style={{ flex: 1 }} onClick={() => updateStatus(o.orderId, 'COMPLETED')}>✅ Tamamla</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => addNotes(o.orderId)}>📝</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMPLETED */}
        <div className="kitchen-column">
          <div className="kitchen-column-header" style={{ borderBottom: '2px solid var(--success)' }}>
            <h3>✅ Tamamlandı</h3>
            <span className="kitchen-count">{completed.length}</span>
          </div>
          <div className="kitchen-column-body">
            {completed.length === 0 ? (
              <div className="empty-state" style={{ padding: 20 }}><p style={{ fontSize: '0.8rem' }}>Tamamlanan sipariş yok</p></div>
            ) : completed.map(o => (
              <div key={o.id} className="kitchen-card" style={{ opacity: 0.7 }}>
                <div className="kitchen-card-order">Sipariş #{o.orderId}</div>
                <div className="kitchen-card-items">{o.itemsSummary}</div>
                <div className="kitchen-card-time">✅ Bitti: {formatTime(o.completedAt)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
