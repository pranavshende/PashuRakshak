import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Tag, Calendar, Weight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Herd() {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ tagId: '', name: '', breed: '', weight: '' });

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/animals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.animals) setAnimals(data.animals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/animals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.animal) {
        setAnimals([data.animal, ...animals]);
        setShowModal(false);
        setForm({ tagId: '', name: '', breed: '', weight: '' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ padding: '0 8px' }}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Register Animal
        </button>
      </div>

      <h1 style={{ marginBottom: '8px' }}>My Herd (Digital Twins)</h1>
      <p style={{ marginBottom: '32px' }}>Manage animal profiles, medical history, and health records.</p>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading herd data...</p>
        </div>
      ) : animals.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '18px' }}>No animals registered in your herd yet.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} /> Register First Animal
          </button>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {animals.map(animal => (
            <div 
              key={animal.id} 
              onClick={() => navigate(`/animal/${animal.id}`)}
              className="card"
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ background: 'var(--primary-light)', padding: '6px', borderRadius: '4px' }}>
                  <Tag size={18} color="var(--primary-dark)" />
                </div>
                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{animal.tagId}</span>
              </div>
              <h2 style={{ fontSize: '20px', color: 'var(--primary-dark)', marginBottom: '8px' }}>
                {animal.name || 'Unnamed'}
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Breed: {animal.breed || 'N/A'}</p>
              {animal.weight && <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Weight: {animal.weight} kg</p>}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17, 24, 39, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
            <h2 style={{ marginBottom: '24px' }}>Register Cattle</h2>
            <form onSubmit={handleAdd}>
              <div className="input-group">
                <label className="input-label">Tag ID (Required)</label>
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="e.g. TAG-1029" 
                  required
                  value={form.tagId}
                  onChange={e => setForm({ ...form, tagId: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Animal Name</label>
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="e.g. Gauri" 
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Breed</label>
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="e.g. Gir, HF" 
                  value={form.breed}
                  onChange={e => setForm({ ...form, breed: e.target.value })}
                />
              </div>
              <div className="input-group" style={{ marginBottom: '32px' }}>
                <label className="input-label">Weight (kg)</label>
                <input 
                  type="number" 
                  className="input-field"
                  placeholder="e.g. 450" 
                  value={form.weight}
                  onChange={e => setForm({ ...form, weight: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Animal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
