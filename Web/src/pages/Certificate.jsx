import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, ShieldCheck } from 'lucide-react';

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
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/animals/${id}`, {
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => navigate(`/animal/${animal.id}`)} style={styles.backBtn}>
          <ArrowLeft size={20} /> Back to Animal
        </button>
        <button onClick={() => window.print()} style={styles.printBtn}>
          <Printer size={18} /> Print / Save as PDF
        </button>
      </div>

      <div style={styles.certificate}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #10B981', paddingBottom: '20px', marginBottom: '20px' }}>
          <ShieldCheck size={48} color="#10B981" style={{ margin: '0 auto' }} />
          <h1 style={{ margin: '10px 0 0 0', letterSpacing: '1px' }}>LIVESTOCK HEALTH CERTIFICATE</h1>
          <p style={{ color: '#6B7280', margin: '5px 0 0 0' }}>Official PashuRakshak AI Health Ledger</p>
        </div>

        <div style={styles.grid}>
          <div><strong>Tag ID:</strong> {animal.tagId}</div>
          <div><strong>Name:</strong> {animal.name || 'N/A'}</div>
          <div><strong>Breed:</strong> {animal.breed || 'N/A'}</div>
          <div><strong>Weight:</strong> {animal.weight ? `${animal.weight} kg` : 'N/A'}</div>
        </div>

        <h3 style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '5px', marginTop: '30px' }}>Vaccination Ledger</h3>
        {animal.vaccinations?.length > 0 ? (
          <ul>
            {animal.vaccinations.map(v => (
              <li key={v.id}>
                <strong>{v.vaccineName}</strong> - {new Date(v.dateAdministered).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#6B7280', fontStyle: 'italic' }}>No active vaccinations on file.</p>
        )}

        <h3 style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '5px', marginTop: '30px' }}>Diagnostic History</h3>
        {animal.predictions?.length > 0 ? (
          <ul>
            {animal.predictions.map(p => (
              <li key={p.id}>
                {new Date(p.createdAt).toLocaleDateString()} - <strong>{p.disease}</strong> (Status: {p.recoveryStatus || 'Logged'})
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#6B7280', fontStyle: 'italic' }}>Clean health ledger. No disease history recorded.</p>
        )}

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px dashed #D1D5DB', fontSize: '11px', color: '#9CA3AF', textAlign: 'justify' }}>
          This document is generated dynamically from the PashuRakshak AI platform. For banking and insurance validation, verify digital records directly via tag identifier.
        </div>
      </div>
    </div>
  );
}

const styles = {
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#4B5563', fontWeight: 'bold' },
  printBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#10B981', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  certificate: { background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#F9FAFB', padding: '15px', borderRadius: '8px' }
};
