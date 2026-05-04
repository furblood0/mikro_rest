import { useState, useEffect } from 'react';
import { menuApi } from '../api';
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

function AvailabilityToggle({ available, onToggle }) {
  return (
    <div className="toggle-wrap" onClick={onToggle} title={available ? 'Mevcut — tıkla kapatmak için' : 'Tükendi — tıkla açmak için'}>
      <div className={`toggle-track ${available ? 'on' : 'off'}`}>
        <div className="toggle-knob" />
      </div>
    </div>
  );
}

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const toast = useToast();

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      setItems(await menuApi.getAll());
    } catch { toast('Menü yüklenemedi', 'error'); }
    setLoading(false);
  }

  async function handleToggle(id) {
    try {
      await menuApi.toggleAvailability(id);
      toast('Durum güncellendi', 'success');
      loadItems();
    } catch { toast('Hata oluştu', 'error'); }
  }

  async function handleDelete(id) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      await menuApi.delete(id);
      toast('Ürün silindi', 'success');
      loadItems();
    } catch { toast('Silme hatası', 'error'); }
  }

  async function handleSave(item) {
    try {
      if (editItem) {
        await menuApi.update(editItem.id, item);
        toast('Ürün güncellendi ✅', 'success');
      } else {
        await menuApi.create(item);
        toast('Ürün eklendi ✅', 'success');
      }
      setShowModal(false);
      setEditItem(null);
      loadItems();
    } catch { toast('Kayıt hatası', 'error'); }
  }

  const uniqueCategories = [...new Set(items.map(i => i.category))];
  const categoryOptions = ['ALL', ...uniqueCategories];

  const filtered = items
    .filter(i => category === 'ALL' || i.category === category)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  const availableCount = items.filter(i => i.available).length;
  const unavailableCount = items.length - availableCount;

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner" />
      <span>Menü yükleniyor...</span>
    </div>
  );

  return (
    <div>
      {/* Sayfa başlığı */}
      <div className="page-header">
        <div>
          <h2>Menü Yönetimi</h2>
          <p>Ürünleri ekleyin, düzenleyin ve müsaitlik durumunu yönetin</p>
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
          <button
            className="btn btn-primary"
            onClick={() => { setEditItem(null); setShowModal(true); }}
          >
            <span style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1 }}>+</span> Yeni Ürün
          </button>
        </div>
      </div>

      {/* İstatistik bandı */}
      <div className="menu-stats-bar">
        <div className="menu-stat-item">
          <span>📋</span>
          <strong>{items.length}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Toplam Ürün</span>
        </div>
        <div className="menu-stat-sep" />
        <div className="menu-stat-item">
          <span>✅</span>
          <strong style={{ color: 'var(--success)' }}>{availableCount}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Mevcut</span>
        </div>
        <div className="menu-stat-sep" />
        <div className="menu-stat-item">
          <span>❌</span>
          <strong style={{ color: 'var(--danger)' }}>{unavailableCount}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Tükendi</span>
        </div>
        <div className="menu-stat-sep" />
        <div className="menu-stat-item">
          <span>🗂️</span>
          <strong style={{ color: 'var(--accent-light)' }}>{uniqueCategories.length}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Kategori</span>
        </div>
        {search && (
          <>
            <div className="menu-stat-sep" />
            <div className="menu-stat-item">
              <span>🔍</span>
              <strong style={{ color: 'var(--warning)' }}>{filtered.length}</strong>
              <span style={{ color: 'var(--text-muted)' }}>Sonuç</span>
            </div>
          </>
        )}
      </div>

      {/* Kategori pill'leri */}
      <div className="category-pills">
        {categoryOptions.map(cat => {
          const meta = getCategoryMeta(cat);
          const count = cat === 'ALL' ? items.length : items.filter(i => i.category === cat).length;
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
              <span className="category-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Ürün grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>{search ? 'Arama sonucu bulunamadı' : 'Bu kategoride ürün yok'}</h3>
          <p>{search ? `"${search}" için sonuç yok` : 'Yeni ürün eklemek için ➕ Yeni Ürün butonunu kullanın'}</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filtered.map(item => {
            const meta = getCategoryMeta(item.category);
            return (
              <div key={item.id} className="menu-card">
                {/* Hero alanı */}
                <div className="menu-card-hero" style={{ background: meta.gradient }}>
                  <span className="menu-card-hero-emoji">{meta.emoji}</span>
                  {!item.available && (
                    <div className="menu-card-unavailable-overlay">
                      <span className="menu-card-unavailable-label">Tükendi</span>
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

                  {item.ingredients && (
                    <p className="menu-card-ingredients">🧾 {item.ingredients}</p>
                  )}

                  <div className="menu-card-footer">
                    <span className="menu-card-price">₺{parseFloat(item.price).toFixed(2)}</span>
                    <div className="menu-card-actions">
                      <AvailabilityToggle
                        available={item.available}
                        onToggle={() => handleToggle(item.id)}
                      />
                      <button
                        className="btn btn-sm btn-secondary btn-icon"
                        onClick={() => { setEditItem(item); setShowModal(true); }}
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-danger btn-icon"
                        onClick={() => handleDelete(item.id)}
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <MenuModal
          item={editItem}
          existingCategories={uniqueCategories}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditItem(null); }}
        />
      )}
    </div>
  );
}

function MenuModal({ item, existingCategories, onSave, onClose }) {
  const [form, setForm] = useState({
    name:         item?.name || '',
    description:  item?.description || '',
    category:     item?.category || '',
    price:        item?.price || '',
    ingredients:  item?.ingredients || '',
    available:    item?.available ?? true,
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, price: parseFloat(form.price) });
  }

  const presetCategories = [
    'Ana Yemek', 'İçecek', 'Tatlı', 'Başlangıç',
    'Çorba', 'Salata', 'Pizza', 'Burger', 'Makarna',
    ...existingCategories.filter(c => !['Ana Yemek','İçecek','Tatlı','Başlangıç','Çorba','Salata','Pizza','Burger','Makarna'].includes(c)),
  ];

  const previewMeta = getCategoryMeta(form.category);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: previewMeta.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', flexShrink: 0,
            }}>
              {previewMeta.emoji}
            </div>
            <h3>{item ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Ürün adı + Kategori */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Ürün Adı *</label>
                <input
                  className="form-input"
                  required
                  placeholder="ör: Adana Kebap"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori *</label>
                <select
                  className="form-select"
                  required
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                >
                  <option value="">Seçin...</option>
                  {presetCategories.map(c => (
                    <option key={c} value={c}>{getCategoryMeta(c).emoji} {c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fiyat + Müsaitlik */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Fiyat (₺) *</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Müsaitlik</label>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                  onClick={() => set('available', !form.available)}
                >
                  <div className={`toggle-track ${form.available ? 'on' : 'off'}`}>
                    <div className="toggle-knob" />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: form.available ? 'var(--success)' : 'var(--danger)' }}>
                    {form.available ? '✅ Mevcut' : '❌ Tükendi'}
                  </span>
                </div>
              </div>
            </div>

            {/* Açıklama */}
            <div className="form-group">
              <label className="form-label">Açıklama</label>
              <textarea
                className="form-textarea"
                placeholder="Ürün hakkında kısa bir açıklama..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            {/* Malzemeler */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Malzemeler</label>
              <input
                className="form-input"
                placeholder="ör: Dana kıyma, biber, soğan"
                value={form.ingredients}
                onChange={e => set('ingredients', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn-primary">
              {item ? '💾 Güncelle' : <><span style={{ fontSize: '1.1rem', fontWeight: 700 }}>+</span> Ekle</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
