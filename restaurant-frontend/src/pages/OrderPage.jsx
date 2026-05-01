import { useState, useEffect } from 'react';
import { menuApi, orderApi } from '../api';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';

export default function OrderPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { items: cartItems, addItem, updateQuantity, removeItem, clearCart, total, count } = useCart();
  const toast = useToast();

  useEffect(() => {
    menuApi.getAvailable().then(setMenuItems).catch(() => toast('Menü yüklenemedi', 'error')).finally(() => setLoading(false));
  }, []);

  const categories = ['ALL', ...new Set(menuItems.map(i => i.category))];
  const filtered = menuItems
    .filter(i => category === 'ALL' || i.category === category)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  async function submitOrder(customerName, tableNumber, specialInstructions) {
    try {
      const order = {
        customerName,
        tableNumber,
        specialInstructions,
        items: cartItems.map(i => ({ menuItemId: i.menuItemId, itemName: i.itemName, quantity: i.quantity, price: i.price })),
      };
      await orderApi.create(order);
      toast('Sipariş oluşturuldu! 🎉', 'success');
      clearCart();
      setShowCheckout(false);
      setCartOpen(false);
    } catch { toast('Sipariş gönderilemedi', 'error'); }
  }

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Yükleniyor...</span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Sipariş Ver</h2>
          <p>Mevcut menüden ürün seçin</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCartOpen(true)} style={{ position: 'relative' }}>
          🛒 Sepet
          {count > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: 'var(--danger)', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{count}</span>}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input placeholder="Ürün ara..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {categories.map(c => (
            <button key={c} className={`filter-tab ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
              {c === 'ALL' ? 'Tümü' : c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🍽️</div><h3>Ürün bulunamadı</h3></div>
      ) : (
        <div className="menu-grid">
          {filtered.map(item => {
            const inCart = cartItems.find(c => c.menuItemId === item.id);
            return (
              <div key={item.id} className="menu-card">
                <div className="menu-card-header">
                  <span className="menu-card-title">{item.name}</span>
                  <span className="menu-card-category">{item.category}</span>
                </div>
                {item.description && <p className="menu-card-desc">{item.description}</p>}
                <div className="menu-card-footer">
                  <span className="menu-card-price">₺{parseFloat(item.price).toFixed(2)}</span>
                  {inCart ? (
                    <div className="cart-qty">
                      <button onClick={() => updateQuantity(item.id, inCart.quantity - 1)}>−</button>
                      <span>{inCart.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, inCart.quantity + 1)}>+</button>
                    </div>
                  ) : (
                    <button className="btn btn-sm btn-primary" onClick={() => { addItem(item); toast(`${item.name} sepete eklendi`, 'success'); }}>
                      ➕ Ekle
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Sidebar */}
      {cartOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 199 }} onClick={() => setCartOpen(false)} />}
      <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>🛒 Sepetiniz ({count})</h3>
          <button className="modal-close" onClick={() => setCartOpen(false)}>×</button>
        </div>
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🛒</div><h3>Sepet boş</h3><p>Menüden ürün ekleyin</p></div>
          ) : (
            cartItems.map(item => (
              <div key={item.menuItemId} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.itemName}</div>
                  <div className="cart-item-price">₺{(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div className="cart-qty">
                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Toplam</span>
              <span style={{ color: 'var(--success)' }}>₺{total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={clearCart}>Temizle</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => { setShowCheckout(true); setCartOpen(false); }}>Siparişi Onayla</button>
            </div>
          </div>
        )}
      </div>

      {showCheckout && <CheckoutModal total={total} onSubmit={submitOrder} onClose={() => setShowCheckout(false)} />}
    </div>
  );
}

function CheckoutModal({ total, onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [table, setTable] = useState('');
  const [instructions, setInstructions] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(name, table, instructions);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✅ Siparişi Onayla</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Müşteri Adı</label>
              <input className="form-input" required value={name} onChange={e => setName(e.target.value)} placeholder="Adınızı girin" />
            </div>
            <div className="form-group">
              <label className="form-label">Masa Numarası</label>
              <input className="form-input" value={table} onChange={e => setTable(e.target.value)} placeholder="ör: A1, B3" />
            </div>
            <div className="form-group">
              <label className="form-label">Özel Talimatlar</label>
              <textarea className="form-textarea" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Ekstra istekleriniz..." />
            </div>
            <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Toplam Tutar</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>₺{total.toFixed(2)}</div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn-primary">🍽️ Sipariş Ver</button>
          </div>
        </form>
      </div>
    </div>
  );
}
