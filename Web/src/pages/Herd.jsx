import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Tag, Calendar, Weight } from 'lucide-react';

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
      const res = await fetch('http://localhost:5000/animals', {
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
      const res = await fetch('http://localhost:5000/animals', {
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
    <div className="page-container" style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <button onClick={() => setShowModal(true)} style={styles.addBtn}>
          <Plus size={18} /> Register New Animal
        </button>
      </div>

      <h1 style={{ color: '#111827', marginTop: '15px' }}>🐄 My Herd (Digital Twins)</h1>
      <p style={{ color: '#6B7280', marginBottom: '30px' }}>Manage animal profiles, medical history, and health records.</p>

      {loading ? (
        <p>Loading herd data...</p>
      ) : animals.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No animals registered in your herd yet.</p>
          <button onClick={() => setShowModal(true)} style={styles.addBtn}>Register Animal</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {animals.map(animal => (
            <div 
              key={animal.id} 
              onClick={() => navigate(`/animal/${animal.id}`)}
              style={styles.card}
            >
              <div style={styles.cardHeader}>
                <Tag size={18} color="#10B981" />
                <span style={{ fontWeight: 'bold', color: '#111827' }}>{animal.tagId}</span>
              </div>
              <h2 style={{ margin: '10px 0 5px 0', fontSize: '20px', color: '#10B981' }}>{animal.name || 'Unnamed'}</h2>
              <p style={{ color: '#4B5563', margin: 0 }}>Breed: {animal.breed || 'N/A'}</p>
              {animal.weight && <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '5px' }}>Weight: {animal.weight} kg</p>}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{ marginTop: 0 }}>Register Cattle</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="text" 
                placeholder="Tag ID (Required)" 
                required
                value={form.tagId}
                onChange={e => setForm({ ...form, tagId: e.target.value })}
                style={styles.input}
              />
              <input 
                type="text" 
                placeholder="Animal Name (e.g. Gauri)" 
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={styles.input}
              />
              <input 
                type="text" 
                placeholder="Breed (e.g. Gir, HF)" 
                value={form.breed}
                onChange={e => setForm({ ...form, breed: e.target.value })}
                style={styles.input}
              />
              <input 
                type="number" 
                placeholder="Weight in kg" 
                value={form.weight}
                onChange={e => setForm({ ...form, weight: e.target.value })}
                style={styles.input}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.saveBtn}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#4B5563', fontWeight: 'bold' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#10B981', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  card: { background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '8px' },
  emptyState: { background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#6B7280' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: '#fff', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '400px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '15px' },
  cancelBtn: { padding: '8px 15px', border: 'none', background: '#F3F4F6', borderRadius: '6px', cursor: 'pointer' },
  saveBtn: { padding: '8px 15px', border: 'none', background: '#10B981', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};
