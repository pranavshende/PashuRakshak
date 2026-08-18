import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Syringe, Activity, CheckCircle, Clock, AlertTriangle, ChevronRight, Stethoscope } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { API_BASE_URL } from '../config/api';

export default function AnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnimal();
  }, [id]);

  const fetchAnimal = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getAnimalDetail(id);
      if (data.animal) {
        // Ensure predictions and vaccinations arrays exist
        setAnimal({
          ...data.animal,
          predictions: data.animal.predictions || [],
          vaccinations: data.animal.vaccinations || []
        });
      } else {
        setError(true);
      }
    } catch (e) {
      console.error(e);
      setError(true);
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

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown Age';
    const diff = new Date() - new Date(dob);
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    if (years === 0) return 'Under 1 yr';
    return `${years} yrs`;
  };

  if (loading) {
    return (
      <div className="page-content-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <LoadingSkeleton type="profile" />
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="page-content-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <ErrorState title="Animal Not Found" message="Could not load the profile for this livestock record." onRetry={() => navigate('/herd')} />
      </div>
    );
  }

  const latestPrediction = animal.predictions.length > 0 ? animal.predictions[0] : null;
  const isCritical = latestPrediction && (latestPrediction.riskLevel === 'CRITICAL' || latestPrediction.riskLevel === 'High');

  return (
    <div className="page-content-container" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/herd')} style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: 0 }}>
          <ArrowLeft size={16} /> Back to Directory
        </button>
      </div>

      {/* Profile Header */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
            🐄
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {animal.name || animal.tagId}
              </h1>
              {isCritical ? (
                <span style={{ background: 'var(--risk-critical-bg)', color: 'var(--risk-critical)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>Critical Health</span>
              ) : (
                <span style={{ background: 'var(--risk-low-bg)', color: 'var(--risk-low)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>Healthy</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-sub)', fontSize: '14px', flexWrap: 'wrap' }}>
              <span><strong>Tag ID:</strong> {animal.tagId}</span>
              <span><strong>Breed:</strong> {animal.breed || 'Unknown'}</span>
              <span><strong>Age:</strong> {calculateAge(animal.dateOfBirth)}</span>
              {animal.weight && <span><strong>Weight:</strong> {animal.weight} kg</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate(`/certificate/${animal.id}`)} className="btn btn-secondary">
            <FileText size={16} /> Health Certificate
          </button>
          <button onClick={() => navigate('/capture')} className="btn btn-primary">
            <Stethoscope size={16} /> New Health Scan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-sub)', fontWeight: activeTab === 'overview' ? 600 : 500, fontSize: '14px', cursor: 'pointer', transition: 'var(--transition)' }}
        >
          Diagnosis History
        </button>
        <button 
          onClick={() => setActiveTab('vaccinations')}
          style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'vaccinations' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'vaccinations' ? 'var(--primary)' : 'var(--text-sub)', fontWeight: activeTab === 'vaccinations' ? 600 : 500, fontSize: '14px', cursor: 'pointer', transition: 'var(--transition)' }}
        >
          Vaccinations & Medicine
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {animal.predictions.length === 0 ? (
            <EmptyState title="No Health Scans" description="This animal hasn't had any AI health scans yet." actionLabel="Run Scan Now" onAction={() => navigate('/capture')} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {animal.predictions.map(pred => (
                <div key={pred.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-base)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Clock size={16} color="var(--text-muted)" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{new Date(pred.createdAt).toLocaleDateString()}</span>
                    </div>
                    {pred.recoveryStatus ? (
                      <span style={{ background: pred.recoveryStatus === 'Healed' ? 'var(--risk-low-bg)' : 'var(--risk-moderate-bg)', color: pred.recoveryStatus === 'Healed' ? 'var(--risk-low)' : 'var(--risk-moderate)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                        {pred.recoveryStatus}
                      </span>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleRecovery(pred.id, 'Recovering')} style={{ background: 'var(--bg-surface)', border: '1px solid var(--risk-moderate)', color: 'var(--risk-moderate)', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Mark Recovering</button>
                        <button onClick={() => handleRecovery(pred.id, 'Healed')} style={{ background: 'var(--risk-low)', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Mark Healed</button>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Diagnosis</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>{pred.disease}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Risk Level</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: pred.riskLevel === 'CRITICAL' || pred.riskLevel === 'High' ? 'var(--risk-critical)' : pred.riskLevel === 'MEDIUM' || pred.riskLevel === 'Medium' ? 'var(--risk-high)' : 'var(--risk-low)' }}>
                          {pred.riskLevel}
                        </div>
                      </div>
                    </div>
                    
                    {pred.symptoms && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Detected Symptoms:</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-sub)' }}>{pred.symptoms.join(', ')}</div>
                      </div>
                    )}
                    
                    {pred.recommendation && (
                      <div style={{ background: 'var(--primary-light)', borderLeft: '3px solid var(--primary)', padding: '12px 16px', borderRadius: '0 4px 4px 0' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '4px' }}>AI Treatment Recommendation</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.5 }}>{pred.recommendation}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'vaccinations' && (
        <div>
          {animal.vaccinations.length === 0 ? (
            <EmptyState title="No Medical Records" description="No vaccinations or medicines have been logged for this animal." actionLabel="Add Record" onAction={() => navigate('/medicine')} />
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
                    <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: 700 }}>Vaccine / Medicine</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: 700 }}>Administered By</th>
                  </tr>
                </thead>
                <tbody>
                  {animal.vaccinations.map(vax => (
                    <tr key={vax.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--text-main)' }}>
                        {new Date(vax.dateAdministered).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Syringe size={16} color="var(--primary)" />
                        {vax.vaccineName}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--text-sub)' }}>
                        {vax.administeredBy || 'Farm Staff'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
