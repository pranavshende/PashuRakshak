import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

const BREEDS = ['All', 'Gir', 'Sahiwal', 'HF Cross', 'Jersey', 'Murrah Buffalo', 'Other'];

export default function Herd() {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [breedFilter, setBreedFilter] = useState('All');
  
  const [form, setForm] = useState({ tagId: '', name: '', breed: '', weight: '', dob: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    fetchAnimals(); 
  }, []);

  const fetchAnimals = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getAnimals();
      if (data.animals) setAnimals(data.animals);
    } catch (e) { 
      console.error(e);
      setError(true);
    } finally { 
      setLoading(false); 
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault(); 
    setSaving(true);
    try {
      await api.createAnimal(form);
      await fetchAnimals(); 
      setShowModal(false); 
      setForm({ tagId: '', name: '', breed: '', weight: '', dob: '' });
    } catch (err) { 
      alert(err.message || 'Failed to add animal.'); 
    } finally { 
      setSaving(false); 
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const diff = new Date() - new Date(dob);
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    if (years === 0) return '< 1 yr';
    return `${years} yrs`;
  };

  const filtered = animals.filter(a => {
    const matchSearch = !search || 
      a.name?.toLowerCase().includes(search.toLowerCase()) || 
      a.tagId?.toLowerCase().includes(search.toLowerCase());
    const matchBreed = breedFilter === 'All' || a.breed === breedFilter;
    return matchSearch && matchBreed;
  });

  return (
    <div className="page-content-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>Livestock Directory</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0 }}>Manage your herd profiles, health history, and tag assignments.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary">
            <Download size={16} /> Export
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Register Animal
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 12px', minWidth: '300px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by Tag ID or Name..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', padding: '8px', fontSize: '14px', width: '100%' }} 
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-sub)" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-sub)' }}>Breed:</span>
          <select 
            value={breedFilter} 
            onChange={e => setBreedFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-base)', fontSize: '14px', outline: 'none' }}
          >
            {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : error ? (
        <ErrorState onRetry={fetchAnimals} />
      ) : filtered.length === 0 ? (
        <EmptyState 
          title="No livestock found" 
          description={animals.length === 0 ? "You haven't registered any animals yet." : "No animals match your search filters."}
          actionLabel={animals.length === 0 ? "Register Animal" : "Clear Filters"}
          onAction={() => animals.length === 0 ? setShowModal(true) : (setSearch(''), setBreedFilter('All'))}
        />
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
                  <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: 700 }}>Tag ID</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: 700 }}>Name</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: 700 }}>Breed</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: 700 }}>Age / Weight</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: 700 }}>Health Status</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(animal => {
                  let statusStr = 'Healthy';
                  let statusColor = 'var(--risk-low)';
                  let statusBg = 'var(--risk-low-bg)';
                  
                  if (animal.predictions && animal.predictions.length > 0) {
                    const r = animal.predictions[0].riskLevel;
                    if (r === 'CRITICAL' || r === 'High') {
                      statusStr = 'Critical';
                      statusColor = 'var(--risk-critical)';
                      statusBg = 'var(--risk-critical-bg)';
                    } else if (r === 'MEDIUM' || r === 'Medium') {
                      statusStr = 'Attention';
                      statusColor = 'var(--risk-high)';
                      statusBg = 'var(--risk-high-bg)';
                    }
                  }

                  return (
                    <tr key={animal.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {animal.tagId || animal.id.substring(0, 8)}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--text-main)', fontWeight: 500 }}>
                        {animal.name || '--'}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--text-sub)' }}>
                        {animal.breed || 'Unknown'}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--text-sub)' }}>
                        {calculateAge(animal.dateOfBirth)} {animal.weight ? `• ${animal.weight}kg` : ''}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, color: statusColor, backgroundColor: statusBg }}>
                          {statusStr}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button 
                          onClick={() => navigate(`/animal/${animal.id}`)}
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-base)', fontSize: '13px', color: 'var(--text-sub)' }}>
            Showing {filtered.length} of {animals.length} total animals.
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: '500px', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>Register Livestock</h3>
            </div>
            
            <form onSubmit={handleAdd} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '8px' }}>Tag ID *</label>
                <input required value={form.tagId} onChange={e => setForm({...form, tagId: e.target.value})} placeholder="e.g. IND-2024-001" className="input" />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '8px' }}>Name (Optional)</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Ganga" className="input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '8px' }}>Breed</label>
                  <select value={form.breed} onChange={e => setForm({...form, breed: e.target.value})} className="input">
                    <option value="">Select breed</option>
                    {BREEDS.filter(b => b !== 'All').map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '8px' }}>Weight (kg)</label>
                  <input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} placeholder="e.g. 350" className="input" />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '8px' }}>Date of Birth</label>
                <input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="input" />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Registering...' : 'Register Animal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
