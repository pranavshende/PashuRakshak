import { useState, useEffect } from 'react';
import TopHeaderBanner from '../components/TopHeaderBanner';
import { API_BASE_URL } from '../config/api';

const CATEGORIES = ['All', 'Antibiotic', 'Antiparasitic', 'Vaccine', 'Vitamin', 'Topical', 'NSAID'];

const MEDICINES_DB = [
  { name: 'Ivermectin Injection', category: 'Antiparasitic', composition: 'Ivermectin 1%', dosage: '1ml per 50kg body weight', usage: 'Ectoparasites & endoparasites', icon: '💉' },
  { name: 'Oxytetracycline', category: 'Antibiotic', composition: 'Oxytetracycline HCl 20%', dosage: '20mg/kg IM/IV', usage: 'Respiratory & systemic bacterial infections', icon: '💊' },
  { name: 'Meloxicam', category: 'NSAID', composition: 'Meloxicam 5mg/ml', dosage: '0.5mg/kg IM or IV', usage: 'Pain, fever & inflammation management', icon: '💊' },
  { name: 'FMD Polyvalent Vaccine', category: 'Vaccine', composition: 'O, A, Asia1 strains', dosage: '2ml SC every 6 months', usage: 'Foot and Mouth Disease prevention', icon: '🧪' },
  { name: 'LSD Live Vaccine', category: 'Vaccine', composition: 'Live attenuated LSD virus', dosage: '1ml SC annually', usage: 'Lumpy Skin Disease prevention', icon: '🧪' },
  { name: 'Amoxicillin + Cloxacillin', category: 'Antibiotic', composition: 'Amoxicillin 200mg, Cloxacillin 200mg', dosage: 'Intramammary infusion twice daily x3 days', usage: 'Bovine mastitis treatment', icon: '💊' },
  { name: 'Albendazole', category: 'Antiparasitic', composition: 'Albendazole 10%', dosage: '7.5mg/kg orally', usage: 'Gastrointestinal worms, flukes, tapeworms', icon: '💊' },
  { name: 'Vitamin AD3E Injection', category: 'Vitamin', composition: 'Vitamin A, D3, E', dosage: '5ml IM seasonal', usage: 'Vitamin deficiency, post-calving recovery', icon: '💉' },
  { name: 'Betadine Solution', category: 'Topical', composition: 'Povidone Iodine 10%', dosage: 'Dilute 1:10, apply topically', usage: 'Wound cleaning & skin lesion disinfection', icon: '🧴' },
  { name: 'Oxytocin', category: 'Antiparasitic', composition: 'Oxytocin 10 IU/ml', dosage: '10–20 IU IV/IM before milking', usage: 'Milk letdown & mastitis drainage', icon: '💉' },
  { name: 'Flunixin Meglumine', category: 'NSAID', composition: 'Flunixin 50mg/ml', dosage: '2.2mg/kg IV/IM daily', usage: 'Mastitis pain & endotoxemia', icon: '💊' },
  { name: 'Neem Oil Ointment', category: 'Topical', composition: 'Pure neem oil 100%', dosage: 'Apply thin layer 2x daily', usage: 'LSD skin nodules, insect repellent', icon: '🧴' },
];

export default function Medicine() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = MEDICINES_DB.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.usage.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || m.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <TopHeaderBanner title="Medicine Database" subtitle="Veterinary medicines, dosages & usage guidelines" />

      <div className="page-content-container">
        <div className="search-bar mb-4">
          <span className="search-icon">🔍</span>
          <input className="input" style={{ paddingLeft: 40 }} placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="tab-pills">
          {CATEGORIES.map(c => (
            <button key={c} className={`tab-pill${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        <div className="grid-auto">
          {filtered.map((med, i) => (
            <div key={i} className="card card-clickable" onClick={() => setSelected(selected?.name === med.name ? null : med)}>
              <div className="flex gap-3 mb-3">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {med.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{med.name}</div>
                  <span className="badge badge-primary mt-1">{med.category}</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{med.usage}</div>

              {selected?.name === med.name && (
                <div className="animate-fade-in" style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Composition</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 10 }}>{med.composition}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Dosage</div>
                  <div className="medicine-item"><span>💊</span>{med.dosage}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <div className="empty-title">No medicines found</div>
            <div className="empty-desc">Try a different search or category.</div>
          </div>
        )}
      </div>
    </div>
  );
}
