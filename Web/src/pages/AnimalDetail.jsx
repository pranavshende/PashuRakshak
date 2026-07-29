import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Syringe, Activity, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function AnimalDetail() {
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

  const handleRecovery = async (predictionId, status) => {
    try {
      const token = localStorage.getItem('userToken');
      await fetch(`${API_BASE_URL}/predict/${predictionId}/recovery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchAnimal();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;
  if (!animal) return <div style={{ padding: '40px', textAlign: 'center' }}>Animal not found.</div>;

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate('/herd')} className="btn btn-ghost" style={{ padding: '0 8px' }}>
          <ArrowLeft size={20} /> Back to Herd
        </button>
        <button onClick={() => navigate(`/certificate/${animal.id}`)} className="btn btn-secondary">
          <FileText size={18} /> View Health Certificate
        </button>
      </div>

      <div className="card" style={{ marginBottom: '40px' }}>
        <h1 style={{ margin: 0, color: 'var(--primary-dark)' }}>{animal.name || 'Unnamed Animal'}</h1>
        <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)' }}>Tag ID: <strong style={{ color: 'var(--text-main)' }}>{animal.tagId}</strong> | Breed: {animal.breed || 'N/A'}</p>
      </div>

      {/* Medical History */}
      <h2 style={{ marginBottom: '24px' }}>🩺 Diagnosis & Recovery History</h2>
      {animal.predictions?.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>No disease records logged.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
          {animal.predictions.map(pred => (
            <div key={pred.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>{new Date(pred.createdAt).toLocaleDateString()}</span>
                {pred.recoveryStatus ? (
                  <span style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '6px 12px', borderRadius: '24px', fontSize: '13px', fontWeight: '600' }}>
                    {pred.recoveryStatus}
                  </span>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleRecovery(pred.id, 'Recovering')} className="btn" style={{ height: '36px', background: 'var(--warning)', color: '#fff' }}>Recovering</button>
                    <button onClick={() => handleRecovery(pred.id, 'Healed')} className="btn btn-primary" style={{ height: '36px' }}>Healed</button>
                  </div>
                )}
              </div>
              <h3 style={{ margin: '0 0 8px 0' }}>{pred.disease}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Risk Level: <strong style={{ color: 'var(--error)' }}>{pred.riskLevel}</strong></p>
            </div>
          ))}
        </div>
      )}

      {/* Vaccinations */}
      <h2 style={{ marginBottom: '24px' }}>💉 Vaccinations</h2>
      {animal.vaccinations?.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No vaccinations logged.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {animal.vaccinations.map(vax => (
            <div key={vax.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
              <div style={{ background: 'var(--secondary-light)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <Syringe size={20} color="var(--secondary)" />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: 'var(--text-main)', fontSize: '16px', display: 'block', marginBottom: '4px' }}>{vax.vaccineName}</strong>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  {new Date(vax.dateAdministered).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
