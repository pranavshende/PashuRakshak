import React, { useState, useEffect } from 'react';
import { Plus, ShieldAlert, X, Trash2, Save, CheckCircle, AlertCircle, Syringe, Activity, Calculator } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';

export default function Medicine() {
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState('');
  const [diseaseDetails, setDiseaseDetails] = useState(null);
  const [costDetails, setCostDetails] = useState(null);
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [newDiseaseName, setNewDiseaseName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newQuarantine, setNewQuarantine] = useState('');
  const [newTreatments, setNewTreatments] = useState([{ name: '', dosage: '', notes: '' }]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadDiseases(true);
  }, []);

  const loadDiseases = async (selectDefault = false, defaultToSelect = '') => {
    setLoadingList(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/medicine`);
      const result = await response.json();
      if (result.success && result.data) {
        setDiseases(result.data);
        if (selectDefault) {
          const toSelect = defaultToSelect || result.data[0] || '';
          if (toSelect) {
            fetchDiseaseDetails(toSelect);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load disease list:', e);
      const fallbacks = ['Lumpy Skin Disease', 'FMD', 'Mastitis'];
      setDiseases(fallbacks);
      if (selectDefault) {
        fetchDiseaseDetails(fallbacks[0]);
      }
    } finally {
      setLoadingList(false);
    }
  };

  const fetchDiseaseDetails = async (diseaseName) => {
    setSelectedDisease(diseaseName);
    setLoadingDetails(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/medicine/${encodeURIComponent(diseaseName)}`);
      const result = await response.json();
      if (result.data) {
        setDiseaseDetails(result.data);
      }

      // Fetch cost details
      const costRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cost-calculator/${encodeURIComponent(diseaseName)}`);
      const costResult = await costRes.json();
      if (costResult.success && costResult.data) {
        setCostDetails(costResult.data);
      } else {
        setCostDetails(null);
      }
    } catch (e) {
      console.error('Failed to load disease details:', e);
      setCostDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAddTreatmentRow = () => {
    setNewTreatments([...newTreatments, { name: '', dosage: '', notes: '' }]);
  };

  const handleRemoveTreatmentRow = (index) => {
    const updated = newTreatments.filter((_, i) => i !== index);
    setNewTreatments(updated.length > 0 ? updated : [{ name: '', dosage: '', notes: '' }]);
  };

  const handleTreatmentChange = (index, key, value) => {
    const updated = [...newTreatments];
    updated[index][key] = value;
    setNewTreatments(updated);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!newDiseaseName.trim()) {
      setErrorMsg('Disease name is required.');
      return;
    }

    const filteredTreatments = newTreatments.filter(t => t.name.trim() !== '');
    if (filteredTreatments.length === 0) {
      setErrorMsg('Please specify at least one treatment medicine.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/medicine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease: newDiseaseName.trim(),
          description: newDescription.trim(),
          quarantine: newQuarantine.trim(),
          treatments: filteredTreatments
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg('Treatment plan saved to database successfully!');
        setTimeout(() => {
          setNewDiseaseName('');
          setNewDescription('');
          setNewQuarantine('');
          setNewTreatments([{ name: '', dosage: '', notes: '' }]);
          setShowModal(false);
          setSuccessMsg('');
          loadDiseases(true, newDiseaseName.trim());
        }, 1500);
      } else {
        setErrorMsg(result.error || 'Failed to persist custom treatment plan.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while transmitting plan payload.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>Medicine & Treatment Database</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0 }}>Approved Veterinary Treatment & Dosage Guidelines</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Custom Plan
        </button>
      </div>

      {loadingList ? (
        <div style={{ padding: '24px 0' }}><LoadingSkeleton type="card" count={4} /></div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px' }}>
          {diseases.map((d) => (
            <button 
              key={d} 
              onClick={() => fetchDiseaseDetails(d)}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                background: selectedDisease === d ? 'var(--primary)' : 'var(--bg-surface)',
                color: selectedDisease === d ? '#fff' : 'var(--text-sub)',
                border: selectedDisease === d ? '1px solid var(--primary)' : '1px solid var(--border)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                whiteSpace: 'nowrap',
                transition: 'var(--transition)'
              }}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {loadingDetails ? (
        <LoadingSkeleton type="profile" />
      ) : diseaseDetails ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            
            {/* Disease Profile */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <Activity size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Disease Profile</h3>
              </div>
              
              <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '24px' }}>
                {diseaseDetails.description || 'No medical overview registered for this disease.'}
              </p>

              <div style={{ background: 'var(--risk-critical-bg)', border: '1px solid var(--risk-critical)', borderRadius: '4px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--risk-critical)', fontWeight: 700, fontSize: '13px' }}>
                  <ShieldAlert size={16} /> Quarantine & Biosafety Directives
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--risk-critical)', lineHeight: 1.5 }}>
                  {diseaseDetails.quarantine || 'Consult a veterinary medical officer immediately.'}
                </p>
              </div>
            </div>

            {/* Treatment Protocol */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <Syringe size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Treatment Protocol</h3>
              </div>

              {diseaseDetails.treatments && diseaseDetails.treatments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {diseaseDetails.treatments.map((treatment, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '4px', padding: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>{treatment.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-sub)', display: 'flex', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ color: 'var(--text-main)' }}>Dosage:</strong> {treatment.dosage || 'Consult Veterinary Officer'}
                      </div>
                      {treatment.notes && treatment.notes !== 'None' && (
                        <div style={{ fontSize: '13px', color: 'var(--text-sub)', display: 'flex', gap: '8px', fontStyle: 'italic' }}>
                          <strong style={{ color: 'var(--text-main)', fontStyle: 'normal' }}>Notes:</strong> {treatment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No treatments mapped" description="No specific medical treatments have been mapped for this disease yet." />
              )}
            </div>
          </div>

          {/* Cost Calculator Section */}
          {costDetails && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calculator size={20} color="var(--primary)" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Economic Impact Analysis</h3>
                </div>
                <div style={{ background: 'var(--risk-low-bg)', color: 'var(--risk-low)', padding: '6px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: 700, border: '1px solid var(--risk-low)' }}>
                  Net Loss Avoided: ₹{costDetails.lossAvoided.toLocaleString()} / Animal
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                
                <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '4px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--risk-low)', textTransform: 'uppercase' }}>Early Intervention Cost</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--risk-low)' }}>₹{costDetails.earlyStageCost.toLocaleString()}</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                    {costDetails.earlyTreatments.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '4px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--risk-critical)', textTransform: 'uppercase' }}>Late Stage Penalty</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--risk-critical)' }}>₹{costDetails.lateStageCost.toLocaleString()}</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                    {costDetails.lateTreatments.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState title="No details available" description="Select a disease from the list to view treatment protocols." />
      )}

      {/* Add Custom Treatment Plan Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '4px', boxShadow: 'var(--shadow-lg)' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-base)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>Add Custom Disease Treatment</h3>
              <button onClick={() => { setShowModal(false); setErrorMsg(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <div style={{ padding: '24px' }}>
              {errorMsg && (
                <div style={{ color: 'var(--risk-critical)', fontSize: '13px', background: 'var(--risk-critical-bg)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(217,45,32,0.2)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}

              {successMsg && (
                <div style={{ color: 'var(--risk-low)', fontSize: '13px', background: 'var(--risk-low-bg)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(2,122,72,0.2)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <CheckCircle size={16} /> {successMsg}
                </div>
              )}

              <form onSubmit={handleSavePlan} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: '8px' }}>Disease Name *</label>
                  <input className="input" placeholder="e.g. Babesiosis" required value={newDiseaseName} onChange={e => setNewDiseaseName(e.target.value)} />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: '8px' }}>Overview Description</label>
                  <textarea className="input" style={{ minHeight: '80px' }} placeholder="Briefly describe the disease, transmission, and common symptoms..." value={newDescription} onChange={e => setNewDescription(e.target.value)} />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: '8px' }}>Quarantine & Biosafety Protocols</label>
                  <textarea className="input" style={{ minHeight: '80px' }} placeholder="e.g. Isolate animal immediately..." value={newQuarantine} onChange={e => setNewQuarantine(e.target.value)} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)' }}>Treatments / Medicines *</label>
                    <button type="button" onClick={handleAddTreatmentRow} style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                      + Add Compound
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {newTreatments.map((t, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input className="input" style={{ flex: 1 }} placeholder="Compound Name" required value={t.name} onChange={e => handleTreatmentChange(idx, 'name', e.target.value)} />
                        <input className="input" style={{ flex: 1 }} placeholder="Dosage" value={t.dosage} onChange={e => handleTreatmentChange(idx, 'dosage', e.target.value)} />
                        <input className="input" style={{ flex: 1 }} placeholder="Notes" value={t.notes} onChange={e => handleTreatmentChange(idx, 'notes', e.target.value)} />
                        <button type="button" onClick={() => handleRemoveTreatmentRow(idx)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--risk-critical)' }} disabled={newTreatments.length === 1}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setErrorMsg(''); }} disabled={saving}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
