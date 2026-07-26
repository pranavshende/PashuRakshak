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
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ padding: '0 8px' }}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <h1 style={{ marginBottom: '8px' }}>💊 Veterinary Medicine Reference</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Recommended first-aid treatments and quarantine protocols.</p>

      {/* Search Input */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', marginBottom: '32px' }}>
        <Search size={24} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search disease (e.g., FMD, Lumpy Skin)..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px', background: 'transparent', color: 'var(--text-main)' }}
        />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* List of Diseases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredDiseases.map(disease => (
            <button
              key={disease}
              onClick={() => setSelectedDisease(disease)}
              style={{
                padding: '16px 20px', 
                borderRadius: 'var(--radius-md)', 
                border: 'none', 
                cursor: 'pointer', 
                textAlign: 'left', 
                fontWeight: '600',
                fontSize: '15px',
                transition: 'all 0.2s',
                backgroundColor: selectedDisease === disease ? 'var(--primary)' : 'var(--bg-base)',
                color: selectedDisease === disease ? '#fff' : 'var(--text-main)',
                boxShadow: selectedDisease === disease ? 'var(--shadow-md)' : 'none',
                border: selectedDisease !== disease ? '1px solid var(--border-light)' : '1px solid transparent'
              }}
            >
              {disease}
            </button>
          ))}
        </div>

        {/* Details View */}
        {diseaseInfo && (
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '16px' }}>{selectedDisease}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px', fontSize: '15px' }}>{diseaseInfo.description}</p>

            <div style={{ display: 'flex', gap: '16px', background: '#FEF2F2', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid #FCA5A5', marginBottom: '32px' }}>
              <ShieldAlert size={28} color="var(--error)" />
              <div>
                <strong style={{ color: '#991B1B', display: 'block', marginBottom: '4px', fontSize: '16px' }}>Quarantine Protocol:</strong>
                <p style={{ color: '#7F1D1D', margin: 0, fontSize: '15px', lineHeight: '1.5' }}>{diseaseInfo.quarantine}</p>
              </div>
            </div>

            <h3 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>Treatment Guidelines</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {diseaseInfo.treatments.map((t, idx) => (
                <div key={idx} style={{ background: 'var(--bg-base)', padding: '20px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                  <strong style={{ color: 'var(--primary-dark)', fontSize: '16px', display: 'block', marginBottom: '8px' }}>{t.name}</strong>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-main)' }}><span style={{ color: 'var(--text-muted)' }}>Dosage:</span> {t.dosage}</p>
                  <small style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Note: {t.notes}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
