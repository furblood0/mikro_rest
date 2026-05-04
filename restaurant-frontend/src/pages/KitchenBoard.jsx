import { useState, useEffect, useCallback } from 'react';
import { kitchenApi } from '../api';
import { useToast } from '../contexts/ToastContext';

const COLUMNS = [
  {
    key: 'RECEIVED',
    emoji: '📥',
    label: 'Bekleyen',
    gradient: 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)',
    accent: '#74b9ff',
    emptyEmoji: '✨',
    emptyText: 'Bekleyen sipariş yok',
  },
  {
    key: 'PREPARING',
    emoji: '🔥',
    label: 'Hazırlanıyor',
    gradient: 'linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)',
    accent: '#fdcb6e',
    emptyEmoji: '🍳',
    emptyText: 'Hazırlanan sipariş yok',
  },
  {
    key: 'COMPLETED',
    emoji: '✅',
    label: 'Tamamlandı',
    gradient: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)',
    accent: '#55efc4',
    emptyEmoji: '🎯',
    emptyText: 'Henüz tamamlanan yok',
  },
];

function ElapsedTimer({ startedAt }) {
  const [display, setDisplay] = useState('');
  const [level, setLevel] = useState('normal');

  useEffect(() => {
    if (!startedAt) return;
    function tick() {
      const diff = Date.now() - new Date(startedAt).getTime();
      const totalSec = Math.floor(diff / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      setDisplay(`${m}:${s.toString().padStart(2, '0')}`);
      setLevel(m < 5 ? 'normal' : m < 10 ? 'warn' : 'late');
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (!startedAt || !display) return null;
  return <span className={`timer-badge ${level}`}>⏱ {display}</span>;
}

function formatTime(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export default function KitchenBoard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const toast = useToast();

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await kitchenApi.getAll());
      setLastRefresh(new Date());
    } catch {
      toast('Mutfak siparişleri yüklenemedi', 'error');
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadOrders();
    const i = setInterval(loadOrders, 8000);
    return () => clearInterval(i);
  }, [loadOrders]);

  async function updateStatus(orderId, status) {
    try {
      await kitchenApi.updateStatus(orderId, status);
      toast(status === 'PREPARING' ? 'Hazırlanmaya başlandı' : 'Sipariş tamamlandı', 'success');
      loadOrders();
    } catch {
      toast('Güncelleme hatası', 'error');
    }
  }

  async function addNotes(orderId) {
    const notes = prompt('Mutfak notu ekleyin:');
    if (!notes) return;
    try {
      await kitchenApi.addNotes(orderId, notes);
      toast('Not eklendi', 'success');
      loadOrders();
    } catch {
      toast('Not eklenemedi', 'error');
    }
  }

  const byStatus = (key) => orders.filter(o => o.status === key);
  const received = byStatus('RECEIVED');
  const preparing = byStatus('PREPARING');
  const completed = byStatus('COMPLETED');

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner" />
      <span>Mutfak yükleniyor...</span>
    </div>
  );

  return (
    <div>
      {/* Başlık */}
      <div className="page-header">
        <div>
          <h2>Mutfak Paneli</h2>
          <p>Sipariş hazırlık akışı — 8 saniyede bir güncellenir</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="live-badge"><div className="live-dot" />CANLI</div>
          {lastRefresh && (
            <div className="refresh-info">
              <div className="refresh-spin" />
              {formatTime(lastRefresh)}
            </div>
          )}
        </div>
      </div>

      {/* İstatistik bandı */}
      <div className="menu-stats-bar" style={{ marginBottom: 24 }}>
        <div className="menu-stat-item">
          <span>📊</span>
          <strong>{orders.length}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Toplam</span>
        </div>
        <div className="menu-stat-sep" />
        <div className="menu-stat-item">
          <span>📥</span>
          <strong style={{ color: 'var(--info)' }}>{received.length}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Bekleyen</span>
        </div>
        <div className="menu-stat-sep" />
        <div className="menu-stat-item">
          <span>🔥</span>
          <strong style={{ color: 'var(--warning)' }}>{preparing.length}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Hazırlanıyor</span>
        </div>
        <div className="menu-stat-sep" />
        <div className="menu-stat-item">
          <span>✅</span>
          <strong style={{ color: 'var(--success)' }}>{completed.length}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Tamamlandı</span>
        </div>
        {preparing.length > 0 && (
          <>
            <div className="menu-stat-sep" />
            <div className="menu-stat-item">
              <span style={{ animation: 'pulse-dot 1.5s ease-in-out infinite', display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)' }} />
              <span style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.82rem' }}>
                {preparing.length} sipariş hazırlanıyor
              </span>
            </div>
          </>
        )}
      </div>

      {/* Kanban sütunları */}
      <div className="kitchen-columns">
        {COLUMNS.map(col => {
          const colOrders = byStatus(col.key);
          return (
            <div key={col.key} className="kitchen-column" style={{ borderColor: `${col.accent}30` }}>
              {/* Sütun başlığı — gradient banner */}
              <div className="kitchen-column-header" style={{ background: col.gradient, color: 'white' }}>
                <span className="kitchen-column-header-emoji">{col.emoji}</span>
                <span className="kitchen-column-header-title">{col.label}</span>
                <span className="kitchen-count">{colOrders.length}</span>
              </div>

              {/* Kart listesi */}
              <div className="kitchen-column-body">
                {colOrders.length === 0 ? (
                  <div className="empty-state" style={{ padding: '28px 12px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>{col.emptyEmoji}</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{col.emptyText}</p>
                  </div>
                ) : colOrders.map(o => (
                  <KitchenCard
                    key={o.id}
                    order={o}
                    colKey={col.key}
                    accent={col.accent}
                    onUpdateStatus={updateStatus}
                    onAddNotes={addNotes}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KitchenCard({ order: o, colKey, accent, onUpdateStatus, onAddNotes, formatTime }) {
  return (
    <div className="kitchen-card">
      {/* Renkli üst şerit */}
      <div className="kitchen-card-accent" style={{ background: accent }} />

      <div className="kitchen-card-content">
        {/* Sipariş no + zaman */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div className="kitchen-card-order">Sipariş #{o.orderId}</div>
          {colKey === 'PREPARING'
            ? <ElapsedTimer startedAt={o.startedAt} />
            : <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {colKey === 'RECEIVED'
                  ? `⏰ ${formatTime(o.receivedAt)}`
                  : `✅ ${formatTime(o.completedAt)}`}
              </span>
          }
        </div>

        {/* Ürünler */}
        <div className="kitchen-card-items">{o.itemsSummary}</div>

        {/* Özel talimat */}
        {o.specialInstructions && (
          <div className="kitchen-card-notes">📝 {o.specialInstructions}</div>
        )}

        {/* Şef notu */}
        {o.notes && (
          <div className="kitchen-card-chef-note">💬 {o.notes}</div>
        )}

        {/* Başlangıç saati (PREPARING) */}
        {colKey === 'PREPARING' && o.startedAt && (
          <div className="kitchen-card-time">
            <span>Başladı: {formatTime(o.startedAt)}</span>
          </div>
        )}

        {/* Aksiyon butonları */}
        {colKey === 'RECEIVED' && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button
              className="btn btn-sm btn-warning"
              style={{ flex: 1 }}
              onClick={() => onUpdateStatus(o.orderId, 'PREPARING')}
            >
              🔥 Hazırla
            </button>
            <button
              className="btn btn-sm btn-secondary btn-icon"
              onClick={() => onAddNotes(o.orderId)}
              title="Not ekle"
            >
              📝
            </button>
          </div>
        )}

        {colKey === 'PREPARING' && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button
              className="btn btn-sm btn-success"
              style={{ flex: 1 }}
              onClick={() => onUpdateStatus(o.orderId, 'COMPLETED')}
            >
              ✅ Tamamla
            </button>
            <button
              className="btn btn-sm btn-secondary btn-icon"
              onClick={() => onAddNotes(o.orderId)}
              title="Not ekle"
            >
              📝
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
