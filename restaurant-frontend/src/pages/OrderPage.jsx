import { useState, useEffect } from 'react';
import { menuApi, orderApi } from '../api';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';

const CATEGORY_META = {
  'Ana Yemek':   { emoji: '🍽️', gradient: 'linear-gradient(135deg, #e17055 0%, #d63031 100%)' },
  'İçecek':      { emoji: '🥤', gradient: 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)' },
  'Tatlı':       { emoji: '🍰', gradient: 'linear-gradient(135deg, #a29bfe 0%, #fd79a8 100%)' },
  'Başlangıç':   { emoji: '🥗', gradient: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)' },
  'Çorba':       { emoji: '🍲', gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)' },
  'Salata':      { emoji: '🥙', gradient: 'linear-gradient(135deg, #00cec9 0%, #55efc4 100%)' },
  'Pizza':       { emoji: '🍕', gradient: 'linear-gradient(135deg, #ff7675 0%, #fdcb6e 100%)' },
  'Burger':      { emoji: '🍔', gradient: 'linear-gradient(135deg, #b2803f 0%, #fdcb6e 100%)' },
  'Makarna':     { emoji: '🍝', gradient: 'linear-gradient(135deg, #f9ca24 0%, #e17055 100%)' },
};

function getCategoryMeta(cat) {
  return CATEGORY_META[cat] || {
    emoji: '🍴',
    gradient: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
  };
}

export default function OrderPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { items: cartItems, addItem, updateQuantity, clearCart, total, count } = useCart();
  const toast = useToast();

  useEffect(() => {
    menuApi.getAvailable()
      .then(setMenuItems)
      .catch(() => toast('Menü yüklenemedi', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const uniqueCategories = [...new Set(menuItems.map(i => i.category))];
  const categoryOptions = ['ALL', ...uniqueCategories];

  const filtered = menuItems
    .filter(i => category === 'ALL' || i.category === category)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  async function submitOrder(customerName, tableNumber, specialInstructions) {
    try {
      await orderApi.create({
        customerName,
        tableNumber,
        specialInstructions,
        items: cartItems.map(i => ({
          menuItemId: i.menuItemId,
          itemName: i.itemName,
          quantity: i.quantity,
          price: i.price,
        })),
      });
      toast('Sipariş oluşturuldu!', 'success');
      clearCart();
      setShowCheckout(false);
      setCartOpen(false);
    } catch {
      toast('Sipariş gönderilemedi', 'error');
    }
  }

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner" />
      <span>Menü yükleniyor...</span>
    </div>
  );

  return (
    <div>
      {/* Başlık */}
      <div className="page-header">
        <div>
          <h2>Sipariş Ver</h2>
          <p>{menuItems.length} ürün mevcut — beğendiklerinizi sepete ekleyin</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Ürün ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Sepet butonu */}
          <button
            className="btn btn-primary"
            onClick={() => setCartOpen(true)}
            style={{ position: 'relative', minWidth: 110 }}
          >
            🛒 Sepet
            {count > 0 && (
              <span style={{
                position: 'absolute', top: -8, right: -8,
                background: 'var(--danger)', color: 'white',
                borderRadius: '50%', width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.68rem', fontWeight: 800,
                boxShadow: '0 2px 6px rgba(255,107,107,0.5)',
              }}>
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Kategori pill'leri */}
      <div className="category-pills">
        {categoryOptions.map(cat => {
          const meta = getCategoryMeta(cat);
          const catCount = cat === 'ALL'
            ? menuItems.length
            : menuItems.filter(i => i.category === cat).length;
          return (
            <button
              key={cat}
              className={`category-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              <span className="category-pill-emoji">
                {cat === 'ALL' ? '🍴' : meta.emoji}
              </span>
              <span className="category-pill-name">
                {cat === 'ALL' ? 'Tümü' : cat}
              </span>
              <span className="category-pill-count">{catCount}</span>
            </button>
          );
        })}
      </div>

      {/* Ürün grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>{search ? 'Arama sonucu bulunamadı' : 'Bu kategoride ürün yok'}</h3>
        </div>
      ) : (
        <div className="menu-grid">
          {filtered.map(item => {
            const meta = getCategoryMeta(item.category);
            const inCart = cartItems.find(c => c.menuItemId === item.id);
            return (
              <div
                key={item.id}
                className="menu-card"
                style={inCart ? { borderColor: 'rgba(108,92,231,0.4)', boxShadow: '0 0 0 1px rgba(108,92,231,0.15)' } : {}}
              >
                {/* Hero */}
                <div className="menu-card-hero" style={{ background: meta.gradient }}>
                  <span className="menu-card-hero-emoji">{meta.emoji}</span>
                  {inCart && (
                    <div style={{
                      position: 'absolute', top: 10, right: 10, zIndex: 2,
                      background: 'var(--accent)', color: 'white',
                      borderRadius: 20, padding: '3px 10px',
                      fontSize: '0.7rem', fontWeight: 800,
                      boxShadow: '0 2px 8px rgba(108,92,231,0.5)',
                    }}>
                      {inCart.quantity} sepette
                    </div>
                  )}
                </div>

                {/* İçerik */}
                <div className="menu-card-body">
                  <div className="menu-card-meta">
                    <span className="menu-card-title">{item.name}</span>
                    <span className="menu-card-category">{item.category}</span>
                  </div>
                  {item.description
                    ? <p className="menu-card-desc">{item.description}</p>
                    : <p className="menu-card-desc" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Açıklama eklenmemiş</p>
                  }

                  <div className="menu-card-footer">
                    <span className="menu-card-price">₺{parseFloat(item.price).toFixed(2)}</span>

                    {inCart ? (
                      <div className="cart-qty">
                        <button onClick={() => updateQuantity(item.id, inCart.quantity - 1)}>−</button>
                        <span>{inCart.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, inCart.quantity + 1)}>+</button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          addItem(item);
                          toast(`${item.name} sepete eklendi`, 'success');
                        }}
                      >
                        <span style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>+</span> Ekle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sepet overlay */}
      {cartOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199, backdropFilter: 'blur(4px)' }}
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Sepet sidebar */}
      <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div>
            <h3>Sepetiniz</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {count} ürün · ₺{total.toFixed(2)}
            </div>
          </div>
          <button className="modal-close" onClick={() => setCartOpen(false)}>×</button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>Sepet boş</h3>
              <p>Menüden ürün ekleyin</p>
            </div>
          ) : (
            cartItems.map(item => {
              const fullItem = menuItems.find(m => m.id === item.menuItemId);
              const meta = getCategoryMeta(fullItem?.category);
              return (
                <div key={item.menuItemId} className="cart-item">
                  {/* Emoji küçük ikonu */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: meta.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem',
                  }}>
                    {meta.emoji}
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.itemName}</div>
                    <div className="cart-item-price">
                      ₺{item.price.toFixed(2)} × {item.quantity}
                      <span style={{ color: 'var(--success)', marginLeft: 6, fontWeight: 700 }}>
                        = ₺{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="cart-qty">
                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}>+</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            {/* Özet */}
            <div style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
              padding: '12px 16px', marginBottom: 14,
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>{count} ürün</span>
                <span>Ara toplam</span>
              </div>
              <div className="cart-total">
                <span>Toplam</span>
                <span style={{ color: 'var(--success)' }}>₺{total.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={clearCart}>
                Temizle
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={() => { setShowCheckout(true); setCartOpen(false); }}
              >
                Siparişi Onayla
              </button>
            </div>
          </div>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal
          total={total}
          count={count}
          cartItems={cartItems}
          menuItems={menuItems}
          onSubmit={submitOrder}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}

function CheckoutModal({ total, count, cartItems, menuItems, onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [table, setTable] = useState('');
  const [instructions, setInstructions] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(name, table, instructions);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
            }}>
              🍽️
            </div>
            <div>
              <h3>Siparişi Onayla</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {count} ürün · ₺{total.toFixed(2)}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Sipariş özeti */}
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
              padding: '12px 16px', marginBottom: 20, border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sipariş Özeti
              </div>
              {cartItems.map(item => {
                const fullItem = menuItems.find(m => m.id === item.menuItemId);
                const meta = getCategoryMeta(fullItem?.category);
                return (
                  <div key={item.menuItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '0.84rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{meta.emoji}</span>
                      <span>{item.itemName}</span>
                      <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                      ₺{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontWeight: 800, fontSize: '1.05rem' }}>
                <span>Toplam</span>
                <span style={{ color: 'var(--success)' }}>₺{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Müşteri bilgileri */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Müşteri Adı *</label>
                <input
                  className="form-input"
                  required
                  placeholder="Adınızı girin"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Masa Numarası</label>
                <input
                  className="form-input"
                  placeholder="ör: A1, B3 (boş = paket)"
                  value={table}
                  onChange={e => setTable(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Özel Talimatlar</label>
              <textarea
                className="form-textarea"
                placeholder="Alerji, özel istek, pişirme tercihi..."
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn-primary">
              Sipariş Ver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
