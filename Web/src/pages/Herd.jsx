import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import TopHeaderBanner from '../components/TopHeaderBanner';
import { API_BASE_URL } from '../config/api';

const BREEDS = ['All', 'Gir', 'Sahiwal', 'HF Cross', 'Jersey', 'Murrah Buffalo', 'Other'];

export default function Herd() {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [breed, setBreed] = useState('All');
  const [form, setForm] = useState({ tagId: '', name: '', breed: '', weight: '', dob: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAnimals(); }, []);

  const fetchAnimals = async () => {
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/animals`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.animals) setAnimals(data.animals);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/animals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { await fetchAnimals(); setShowModal(false); setForm({ tagId: '', name: '', breed: '', weight: '', dob: '' }); }
      else { alert('Failed to add animal.'); }
    } catch { alert('Network error.'); }
    finally { setSaving(false); }
  };

  const filtered = animals.filter(a => {
    const matchSearch = !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.tagId?.toLowerCase().includes(search.toLowerCase());
    const matchBreed = breed === 'All' || a.breed === breed;
    return matchSearch && matchBreed;
  });

  const EMOJIS = { cow: '🐄', buffalo: '🐃', calf: '🐮', default: '🐄' };
  const getEmoji = (b = '') => b.toLowerCase().includes('buffalo') ? '🐃' : b.toLowerCase().includes('calf') ? '🐮' : '🐄';

  return (
    <div>
      <TopHeaderBanner title="My Herd" subtitle={`${animals.length} animals registered`}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Add Animal
        </button>
      </TopHeaderBanner>

      <div className="page-content-container">
        {/* Filters */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} className="search-icon" />
          <input className="input" placeholder="Search by name or tag ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tab-pills" style={{ margin: 0 }}>
          {BREEDS.map(b => (
            <button key={b} className={`tab-pill${breed === b ? ' active' : ''}`} onClick={() => setBreed(b)}>{b}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid-auto">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 180 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐄</div>
          <div className="empty-title">No animals found</div>
          <div className="empty-desc">Add your first animal to get started.</div>
          <button className="btn btn-primary mt-4" onClick={() => setShowModal(true)}><Plus size={16} /> Add Animal</button>
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map(animal => (
            <div key={animal.id} className="animal-card" onClick={() => navigate(`/animal/${animal.id}`)}>
              <div className="animal-card-photo">{getEmoji(animal.breed)}</div>
              <div className="animal-card-body">
                <div className="flex-between mb-2">
                  <div className="animal-name">{animal.name || 'Unnamed'}</div>
                  <span className="badge badge-low">Healthy</span>
                </div>
                <div className="animal-tag">🏷️ {animal.tagId || 'No Tag'}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {animal.breed && <span className="badge badge-primary">{animal.breed}</span>}
                  {animal.weight && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⚖️ {animal.weight}kg</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Add Animal Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-title">🐄 Add New Animal</div>
            <form onSubmit={handleAdd}>
              <div className="input-group">
                <label className="input-label">Tag ID *</label>
                <input className="input" required value={form.tagId} onChange={e => setForm({...form, tagId: e.target.value})} placeholder="e.g. IND-2024-001" />
              </div>
              <div className="input-group">
                <label className="input-label">Name</label>
                <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Ganga" />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Breed</label>
                  <select className="input" value={form.breed} onChange={e => setForm({...form, breed: e.target.value})}>
                    <option value="">Select breed</option>
                    {BREEDS.filter(b => b !== 'All').map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Weight (kg)</label>
                  <input className="input" type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} placeholder="e.g. 350" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Date of Birth</label>
                <input className="input" type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
              </div>
              <div className="flex gap-3" style={{ marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving...' : '✓ Add Animal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
