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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
    <div className="page-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/herd')} style={styles.backBtn}>
          <ArrowLeft size={20} /> Back to Herd
        </button>
        <button onClick={() => navigate(`/certificate/${animal.id}`)} style={styles.certBtn}>
          <FileText size={18} /> View Health Certificate
        </button>
      </div>

      <div style={styles.headerCard}>
        <h1 style={{ margin: 0, color: '#10B981' }}>{animal.name || 'Unnamed Animal'}</h1>
        <p style={{ margin: '5px 0 0 0', color: '#6B7280' }}>Tag ID: <strong>{animal.tagId}</strong> | Breed: {animal.breed || 'N/A'}</p>
      </div>

      {/* Medical History */}
      <h2 style={{ marginTop: '30px', color: '#111827' }}>🩺 Diagnosis & Recovery History</h2>
      {animal.predictions?.length === 0 ? (
        <p style={{ color: '#6B7280' }}>No disease records logged.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
          {animal.predictions.map(pred => (
            <div key={pred.id} style={styles.recordCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>{new Date(pred.createdAt).toLocaleDateString()}</span>
                {pred.recoveryStatus ? (
                  <span style={styles.badge}>{pred.recoveryStatus}</span>
                ) : (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => handleRecovery(pred.id, 'Recovering')} style={styles.actionBtn}>Mark Recovering</button>
                    <button onClick={() => handleRecovery(pred.id, 'Healed')} style={{ ...styles.actionBtn, background: '#10B981' }}>Mark Healed</button>
                  </div>
                )}
              </div>
              <h3 style={{ margin: '10px 0 5px 0', color: '#1F2937' }}>{pred.disease}</h3>
              <p style={{ margin: 0, color: '#4B5563', fontSize: '14px' }}>Risk Level: <strong>{pred.riskLevel}</strong></p>
            </div>
          ))}
        </div>
      )}

      {/* Vaccinations */}
      <h2 style={{ marginTop: '30px', color: '#111827' }}>💉 Vaccinations</h2>
      {animal.vaccinations?.length === 0 ? (
        <p style={{ color: '#6B7280' }}>No vaccinations logged.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          {animal.vaccinations.map(vax => (
            <div key={vax.id} style={styles.vaxItem}>
              <Syringe size={18} color="#3B82F6" />
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#1F2937' }}>{vax.vaccineName}</strong>
                <span style={{ fontSize: '12px', color: '#6B7280', marginLeft: '10px' }}>
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

const styles = {
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#4B5563', fontWeight: 'bold' },
  certBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#3B82F6', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  headerCard: { background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB', marginTop: '15px' },
  recordCard: { background: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #E5E7EB' },
  badge: { background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  actionBtn: { border: 'none', background: '#F59E0B', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  vaxItem: { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }
};
