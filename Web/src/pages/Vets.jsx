import TopHeaderBanner from '../components/TopHeaderBanner';

const VETS = [
  { name: 'Dr. Rajan Mehta', specialty: 'Large Animal Medicine', distance: '1.2 km', rating: 4.8, available: true, phone: '+91-98765-43210', location: 'Pune, Maharashtra' },
  { name: 'Dr. Sunita Patil', specialty: 'Bovine Reproduction', distance: '2.8 km', rating: 4.9, available: true, phone: '+91-87654-32109', location: 'Pune, Maharashtra' },
  { name: 'Dr. Arvind Kumar', specialty: 'Cattle Surgery & Orthopedics', distance: '4.1 km', rating: 4.6, available: false, phone: '+91-76543-21098', location: 'Pune, Maharashtra' },
  { name: 'Dr. Priya Sharma', specialty: 'Dairy & Production Medicine', distance: '5.3 km', rating: 4.7, available: true, phone: '+91-65432-10987', location: 'Pune, Maharashtra' },
  { name: 'Dr. Mohan Yadav', specialty: 'Livestock Disease Control', distance: '6.0 km', rating: 4.5, available: false, phone: '+91-54321-09876', location: 'Pune, Maharashtra' },
];

export default function Vets() {
  return (
    <div>
      <TopHeaderBanner title="Nearby Veterinarians" subtitle="Find certified vets in your area" />

      <div className="flex-between mb-4">
        <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
          <span className="search-icon">🔍</span>
          <input className="input" style={{ paddingLeft: 40 }} placeholder="Search vets by name or specialty..." />
        </div>
        <button className="btn btn-secondary btn-sm">📍 Use My Location</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {VETS.map((vet, i) => (
          <div key={i} className="card flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 26, background: 'linear-gradient(135deg, #0F766E, #0369A1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                👨‍⚕️
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>{vet.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{vet.specialty}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {vet.distance}</span>
                  <span style={{ fontSize: 11, color: '#EAB308' }}>★ {vet.rating}</span>
                  <span className={`badge ${vet.available ? 'badge-low' : 'badge-moderate'}`}>
                    {vet.available ? '● Available' : '○ Busy'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href={`tel:${vet.phone}`} className="btn btn-primary btn-sm">📞 Call</a>
              <a href={`https://wa.me/${vet.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">💬 WhatsApp</a>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-4" style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.08), rgba(15,118,110,0.08))', border: '1px solid rgba(22,163,74,0.2)', textAlign: 'center' }}>
        <div style={{ fontSize: 24, marginBottom: 10 }}>🏥</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>Government Veterinary Helpline</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Available 24/7 for emergency livestock health issues</div>
        <a href="tel:1962" className="btn btn-primary" style={{ display: 'inline-flex' }}>📞 Call 1962 (Free)</a>
      </div>
    </div>
  );
}
