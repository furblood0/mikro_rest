import { useState, useEffect } from 'react';
import { menuApi } from '../api';
import { useToast } from '../contexts/ToastContext';

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
      const data = await menuApi.getAll();
      setItems(data);
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
        toast('Ürün güncellendi', 'success');
      } else {
        await menuApi.create(item);
        toast('Ürün eklendi', 'success');
      }
      setShowModal(false);
      setEditItem(null);
      loadItems();
    } catch { toast('Kayıt hatası', 'error'); }
  }

  const categories = ['ALL', ...new Set(items.map(i => i.category))];
  const filtered = items
    .filter(i => category === 'ALL' || i.category === category)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Yükleniyor...</span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Menü Yönetimi</h2>
          <p>{items.length} ürün kayıtlı</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowModal(true); }}>
          ➕ Yeni Ürün
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
          {filtered.map(item => (
            <div key={item.id} className="menu-card">
              <div className="menu-card-header">
                <span className="menu-card-title">{item.name}</span>
                <span className="menu-card-category">{item.category}</span>
              </div>
              {item.description && <p className="menu-card-desc">{item.description}</p>}
              {item.ingredients && <p className="menu-card-ingredients">🧾 {item.ingredients}</p>}
              <div className="menu-card-footer">
                <span className="menu-card-price">₺{parseFloat(item.price).toFixed(2)}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className={`btn btn-sm ${item.available ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => handleToggle(item.id)}
                  >
                    {item.available ? '✅ Mevcut' : '❌ Tükendi'}
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => { setEditItem(item); setShowModal(true); }}>✏️</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <MenuModal
          item={editItem}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditItem(null); }}
        />
      )}
    </div>
  );
}

function MenuModal({ item, onSave, onClose }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || '',
    price: item?.price || '',
    ingredients: item?.ingredients || '',
    available: item?.available ?? true,
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, price: parseFloat(form.price) });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item ? '✏️ Ürün Düzenle' : '➕ Yeni Ürün'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Ürün Adı</label>
              <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <input className="form-input" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="ör: Ana Yemek, İçecek, Tatlı" />
            </div>
            <div className="form-group">
              <label className="form-label">Fiyat (₺)</label>
              <input className="form-input" type="number" step="0.01" min="0" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Açıklama</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Malzemeler</label>
              <input className="form-input" value={form.ingredients} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn-primary">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );
}
