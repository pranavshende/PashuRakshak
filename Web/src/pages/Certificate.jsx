import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Certificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnimal();
  }, [id]);

  const fetchAnimal = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE_URL}/animals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.animal) setAnimal(data.animal);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Generating Certificate...</div>;
  if (!animal) return <div style={{ padding: '40px', textAlign: 'center' }}>Animal profile not found.</div>;

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(`/animal/${animal.id}`)} className="btn btn-ghost" style={{ padding: '0 8px' }}>
          <ArrowLeft size={20} /> Back to Animal
        </button>
        <button onClick={() => window.print()} className="btn btn-primary">
          <Printer size={18} /> Print / Save PDF
        </button>
      </div>

      <div className="card" style={{ padding: '48px', border: '2px solid var(--primary-light)' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid var(--primary-light)', paddingBottom: '32px', marginBottom: '32px' }}>
          <ShieldCheck size={56} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ margin: 0, letterSpacing: '1px', fontSize: '28px', color: 'var(--text-main)' }}>LIVESTOCK HEALTH CERTIFICATE</h1>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0', fontWeight: '500' }}>Official PashuRakshak Digital Health Ledger</p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px', background: 'var(--bg-base)', padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '40px' }}>
          <div><span style={{ color: 'var(--text-muted)' }}>Tag ID:</span> <strong style={{ color: 'var(--text-main)' }}>{animal.tagId}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> <strong style={{ color: 'var(--text-main)' }}>{animal.name || 'N/A'}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Breed:</span> <strong style={{ color: 'var(--text-main)' }}>{animal.breed || 'N/A'}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Weight:</span> <strong style={{ color: 'var(--text-main)' }}>{animal.weight ? `${animal.weight} kg` : 'N/A'}</strong></div>
        </div>

        <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--text-main)' }}>Vaccination Ledger</h3>
        {animal.vaccinations?.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {animal.vaccinations.map(v => (
              <li key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: 'var(--primary-dark)' }}>{v.vaccineName}</strong>
                <span style={{ color: 'var(--text-muted)' }}>{new Date(v.dateAdministered).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '40px' }}>No active vaccinations on file.</p>
        )}

        <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--text-main)' }}>Diagnostic History</h3>
        {animal.predictions?.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {animal.predictions.map(p => (
              <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                <strong style={{ color: 'var(--error)' }}>{p.disease}</strong>
                <span style={{ color: 'var(--text-main)' }}>{p.recoveryStatus || 'Logged'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Clean health ledger. No disease history recorded.</p>
        )}

        <div style={{ marginTop: '64px', paddingTop: '24px', borderTop: '1px dashed var(--border-medium)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'justify', lineHeight: '1.6' }}>
          This document is generated dynamically from the PashuRakshak AI platform. For banking, insurance, and veterinary validation, verify digital records directly via the animal's unique tag identifier.
        </div>
      </div>
    </div>
  );
}
