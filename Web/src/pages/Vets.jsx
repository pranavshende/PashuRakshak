import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, MessageSquare, Star, AlertTriangle, UserCircle2 } from 'lucide-react';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import { API_BASE_URL } from '../config/api';

export default function Vets() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vets, setVets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [coordsMsg, setCoordsMsg] = useState('Detecting farm GPS coordinates...');

  useEffect(() => {
    fetchNearbyVets();
  }, []);

  const fetchNearbyVets = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCoordsMsg(`Location Locked: ${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`);
          await loadVetsFromApi(lat, lon);
        },
        async (error) => {
          console.warn('Geolocation access denied, falling back to regional directory.', error);
          setCoordsMsg('GPS access denied. Showing District directory.');
          await loadVetsFromApi(21.1458, 79.0882); // default
        }
      );
    } else {
      setCoordsMsg('Geolocation not supported. Showing District directory.');
      loadVetsFromApi(21.1458, 79.0882);
    }
  };

  const loadVetsFromApi = async (lat, lon) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(
        `${API_BASE_URL}/vets/nearby?lat=${lat}&lon=${lon}&radius=50000`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const data = await response.json();
      
      if (response.ok && Array.isArray(data) && data.length > 0) {
        const enrichedVets = data.map((v) => ({
          id: v.id,
          name: v.name,
          clinic: v.clinic || 'Government Veterinary Hospital',
          phone: v.phone || '+919011111111',
          rating: v.rating || 4.8,
          available: v.available !== undefined ? v.available : true,
          distanceFormat: v.distance ? (v.distance / 1000).toFixed(1) + ' km' : '2.4 km',
          address: v.address || 'District Health Center',
          specialty: v.specialty || 'General Cattle Health'
        }));
        setVets(enrichedVets);
      } else {
        setVets([]);
      }
    } catch (err) {
      console.warn('Failed to fetch from API:', err);
      setVets([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVets = vets.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.clinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.specialty && v.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="page-content-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>Nearby Vets & Clinics</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0 }}>Certified Government Veterinary Officers & Hospitals in your district.</p>
      </div>
        
      {/* 24/7 Helpline Banner */}
      <div style={{ background: 'var(--risk-critical-bg)', border: '1px solid var(--risk-critical)', borderRadius: '4px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'var(--risk-critical)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertTriangle size={20} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--risk-critical)' }}>24/7 Animal Emergency Helpline</div>
          <div style={{ fontSize: '13px', color: 'var(--text-main)', marginTop: '2px' }}>National Veterinary Distress Number: <strong>1962</strong></div>
        </div>
        <a href="tel:1962" className="btn" style={{ background: 'var(--risk-critical)', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', height: '40px', fontWeight: 600, borderRadius: '4px', textDecoration: 'none' }}>
          <Phone size={14} /> Call Helpline
        </a>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        {/* GPS location status HUD */}
        <div style={{ fontSize: '13px', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} /> {coordsMsg}
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 12px', width: '100%', maxWidth: '400px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search vets by name, clinic, or specialty..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', padding: '8px', fontSize: '14px', width: '100%' }} 
            />
          </div>
          <button className="btn btn-secondary" onClick={fetchNearbyVets}>
            Refresh Location
          </button>
        </div>
      </div>

      {/* Vets list */}
      {loading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : filteredVets.length === 0 ? (
        <EmptyState 
          title="No veterinarians found" 
          description="We couldn't find any certified vets matching your search terms." 
          actionLabel="Clear Search" 
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
          {filteredVets.map((vet) => (
            <div key={vet.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                  <UserCircle2 size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{vet.name}</div>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: vet.available ? 'var(--risk-low-bg)' : 'var(--risk-moderate-bg)', color: vet.available ? 'var(--risk-low)' : 'var(--risk-moderate)' }}>
                      {vet.available ? 'Available' : 'Busy'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '2px' }}>{vet.clinic}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {vet.distanceFormat}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={12} fill="var(--risk-moderate)" color="var(--risk-moderate)" /> {vet.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <a 
                  href={`tel:${vet.phone}`} 
                  className="btn btn-primary" 
                  style={{ flex: 1, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}
                >
                  <Phone size={14} /> Call Vet
                </a>
                <a 
                  href={`https://wa.me/${vet.phone.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}
                >
                  <MessageSquare size={14} /> WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
