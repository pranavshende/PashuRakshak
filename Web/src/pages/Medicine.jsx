import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Pill, ShieldAlert, BookOpen } from 'lucide-react';

const MEDICINE_DATA = {
  'Lumpy Skin Disease': {
    description: 'A viral disease of cattle and buffalo transmitted by blood-feeding insects.',
    treatments: [
      { name: 'Antibiotics', dosage: 'Consult vet for secondary infections.', notes: 'Do not use without vet prescription.' },
      { name: 'Anti-inflammatory drugs', dosage: 'As prescribed', notes: 'To reduce fever and pain.' },
      { name: 'Wound Care Spray', dosage: 'Apply topically 2x daily', notes: 'Keep lesions clean.' }
    ],
    quarantine: 'Immediate isolation required for 28 days.'
  },
  'FMD': {
    description: 'Foot-and-mouth disease is a severe, highly contagious viral disease of livestock.',
    treatments: [
      { name: 'FMD Vaccine', dosage: 'Annual booster', notes: 'Preventative only. Will not cure active infection.' },
      { name: 'Mild disinfectants', dosage: 'Wash hooves 2x daily', notes: 'E.g. Potassium Permanganate solution.' },
      { name: 'Painkillers (Meloxicam)', dosage: 'Consult Vet', notes: 'For severe pain and lameness.' }
    ],
    quarantine: 'Strict quarantine of 21 days for infected animals.'
  },
  'Mastitis': {
    description: 'Inflammation of the mammary gland and udder tissue, usually caused by bacterial infection.',
    treatments: [
      { name: 'Intramammary Antibiotics', dosage: 'Administer per teat as directed', notes: 'Complete full course.' },
      { name: 'Frequent Milking', dosage: 'Every 2 hours', notes: 'Helps flush out bacteria and toxins.' }
    ],
    quarantine: 'Isolate milk from infected quarters. Do not mix in main supply.'
  }
};

export default function Medicine() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedDisease, setSelectedDisease] = useState(Object.keys(MEDICINE_DATA)[0]);

  const filteredDiseases = Object.keys(MEDICINE_DATA).filter(d => 
    d.toLowerCase().includes(search.toLowerCase())
  );

  const diseaseInfo = MEDICINE_DATA[selectedDisease];

  return (
    <div className="page-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/')} className="back-btn" style={styles.backBtn}>
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <h1 style={{ color: '#111827', marginTop: '15px' }}>💊 Veterinary Medicine Reference</h1>
      <p style={{ color: '#6B7280', marginBottom: '20px' }}>Recommended first-aid treatments and quarantine protocols.</p>

      {/* Search Input */}
      <div style={styles.searchBox}>
        <Search size={20} color="#9CA3AF" />
        <input 
          type="text" 
          placeholder="Search disease (e.g., FMD, Lumpy Skin)..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
        {/* List of Diseases */}
        <div style={styles.diseaseList}>
          {filteredDiseases.map(disease => (
            <button
              key={disease}
              onClick={() => setSelectedDisease(disease)}
              style={{
                ...styles.diseaseBtn,
                backgroundColor: selectedDisease === disease ? '#10B981' : '#F3F4F6',
                color: selectedDisease === disease ? '#fff' : '#374151'
              }}
            >
              {disease}
            </button>
          ))}
        </div>

        {/* Details View */}
        {diseaseInfo && (
          <div style={styles.detailsCard}>
            <h2 style={{ color: '#111827', marginBottom: '10px' }}>{selectedDisease}</h2>
            <p style={{ color: '#4B5563', lineHeight: '1.5', marginBottom: '20px' }}>{diseaseInfo.description}</p>

            <div style={styles.quarantineBox}>
              <ShieldAlert size={24} color="#EF4444" />
              <div>
                <strong style={{ color: '#991B1B' }}>Quarantine Protocol:</strong>
                <p style={{ color: '#7F1D1D', margin: 0 }}>{diseaseInfo.quarantine}</p>
              </div>
            </div>

            <h3 style={{ marginTop: '20px', color: '#1F2937' }}>Treatment Guidelines</h3>
            <div style={{ marginTop: '10px' }}>
              {diseaseInfo.treatments.map((t, idx) => (
                <div key={idx} style={styles.treatmentItem}>
                  <strong style={{ color: '#10B981' }}>{t.name}</strong>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#374151' }}>Dosage: {t.dosage}</p>
                  <small style={{ color: '#6B7280' }}>Notes: {t.notes}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#4B5563', fontWeight: 'bold' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1px solid #D1D5DB', borderRadius: '10px', padding: '10px 15px' },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '16px' },
  diseaseList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  diseaseBtn: { padding: '12px 15px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' },
  detailsCard: { background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' },
  quarantineBox: { display: 'flex', gap: '12px', background: '#FEF2F2', padding: '12px', borderRadius: '8px', border: '1px solid #FCA5A5' },
  treatmentItem: { background: '#F9FAFB', padding: '12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #10B981' }
};
