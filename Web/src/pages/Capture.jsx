import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, RotateCcw, Zap } from 'lucide-react';
import TopHeaderBanner from '../components/TopHeaderBanner';
import RiskBadge from '../components/RiskBadge';
import ConfidenceBar from '../components/ConfidenceBar';
import { API_BASE_URL } from '../config/api';

const MODELS = [
  { id: 'gemini', label: 'Gemini 2.0 Flash', badge: 'Cloud', badgeCls: 'badge-cloud', icon: '⚡' },
  { id: 'localml', label: 'Local ML Model', badge: 'Local', badgeCls: 'badge-local', icon: '🖥️' },
  { id: 'nano', label: 'Gemini Nano', badge: 'On-Device', badgeCls: 'badge-ondevice', icon: '📱' },
  { id: 'edge', label: 'Edge Rulebook', badge: 'Offline', badgeCls: 'badge-offline', icon: '📖' },
];

export default function Capture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [permissionError, setPermissionError] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s);
      setCameraActive(true);
      setResult(null);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setPermissionError(true);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraActive(false);
  };

  const analyzeBlob = async (blob) => {
    setIsAnalyzing(true);
    setPreviewUrl(URL.createObjectURL(blob));
    try {
      const token = localStorage.getItem('userToken');
      const formData = new FormData();
      formData.append('file', blob, 'cattle.jpg');
      const res = await fetch(`${API_BASE_URL}/predict/analyze?model=${selectedModel}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.prediction) {
        setResult(data.prediction);
        stopCamera();
      } else {
        alert(data.error || 'Prediction failed. Please try again.');
      }
    } catch {
      alert('Network error. Ensure backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const takePicture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    c.toBlob(b => b && analyzeBlob(b), 'image/jpeg', 0.85);
  };

  const handleFileChange = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    analyzeBlob(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  }, [selectedModel]);

  const reset = () => { setResult(null); setPreviewUrl(null); setCameraActive(false); stopCamera(); };

  return (
    <div>
      <TopHeaderBanner title="AI Disease Scanner" subtitle="Scan cattle for instant AI-powered diagnosis" />

      {/* Model Selector */}
      <div className="card mb-4">
        <div className="section-title">Select AI Model</div>
        <div className="model-selector">
          {MODELS.map(m => (
            <button
              key={m.id}
              className={`model-option${selectedModel === m.id ? ' active' : ''}`}
              onClick={() => setSelectedModel(m.id)}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
              <span className={`badge ${m.badgeCls}`}>{m.badge}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Left: Camera / Upload */}
        <div>
          {!result && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Camera View */}
              <div className="camera-wrapper" style={{ borderRadius: 0 }}>
                {cameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div className="scanner-overlay">
                      <div className="scanner-frame">
                        <div className="scan-line" />
                        <div className="scanner-corner tl" />
                        <div className="scanner-corner tr" />
                        <div className="scanner-corner bl" />
                        <div className="scanner-corner br" />
                      </div>
                    </div>
                  </>
                ) : previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div
                    className={`drop-zone${dragOver ? ' drag-over' : ''}`}
                    style={{ border: 'none', borderRadius: 0, height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                  >
                    <div className="drop-zone-icon">📷</div>
                    <div className="drop-zone-text">Drop cattle image here</div>
                    <div className="drop-zone-sub">or click to browse files</div>
                  </div>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange(e.target.files[0])} />
              </div>

              {/* Camera Controls */}
              <div style={{ padding: 16, display: 'flex', gap: 10 }}>
                {!cameraActive ? (
                  <>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={startCamera}>
                      📷 Open Camera
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => fileRef.current?.click()}>
                      <Upload size={16} /> Upload File
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={takePicture} disabled={isAnalyzing}>
                      {isAnalyzing ? '⏳ Analyzing...' : <><Zap size={16} /> Capture & Analyze</>}
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={stopCamera}>✕</button>
                  </>
                )}
              </div>
            </div>
          )}

          {result && previewUrl && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <img src={previewUrl} alt="Scanned" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: 14 }}>
                <button className="btn btn-secondary w-full" onClick={reset}>
                  <RotateCcw size={16} /> Scan Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Result */}
        <div>
          {isAnalyzing && (
            <div className="card flex-center" style={{ minHeight: 300, flexDirection: 'column', gap: 16 }}>
              <div className="spinner" />
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Analyzing with {MODELS.find(m => m.id === selectedModel)?.label}...
              </div>
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="diagnosis-card animate-fade-in">
              {/* Header */}
              <div className="diagnosis-header" style={{
                background: result.riskLevel === 'CRITICAL' ? 'var(--risk-critical-bg)' :
                            result.riskLevel === 'HIGH' ? 'var(--risk-high-bg)' :
                            result.riskLevel === 'MODERATE' ? 'var(--risk-moderate-bg)' : 'var(--risk-low-bg)'
              }}>
                <div>
                  <div className="diagnosis-disease">{result.label}</div>
                  <div className="diagnosis-confidence">Diagnosis Result</div>
                </div>
                <RiskBadge level={result.riskLevel} />
              </div>

              {/* Confidence */}
              <div className="diagnosis-section">
                <ConfidenceBar value={result.confidence} />
              </div>

              {/* Recommendation */}
              {result.recommendation && (
                <div className="diagnosis-section">
                  <div className="diagnosis-section-title">📋 Recommendation</div>
                  <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>{result.recommendation}</div>
                </div>
              )}

              {/* Symptoms */}
              {result.symptoms?.length > 0 && (
                <div className="diagnosis-section">
                  <div className="diagnosis-section-title">🔍 Observed Symptoms</div>
                  {result.symptoms.map((s, i) => (
                    <div key={i} className="symptom-item">
                      <div className="symptom-dot" />
                      {s}
                    </div>
                  ))}
                </div>
              )}

              {/* Treatment */}
              {result.treatment && (
                <div className="diagnosis-section">
                  <div className="diagnosis-section-title">💊 Treatment Plan</div>
                  {result.treatment.medicines?.map((m, i) => (
                    <div key={i} className="medicine-item">
                      <span>💊</span> {m}
                    </div>
                  ))}
                  {result.treatment.firstAid && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>🩹 First Aid</div>
                      <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>{result.treatment.firstAid}</div>
                    </div>
                  )}
                  {result.treatment.prevention && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>🛡️ Prevention</div>
                      <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>{result.treatment.prevention}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Source Badge */}
              {result.source && (
                <div className="diagnosis-section" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="source-badge">🤖 {result.source}</span>
                </div>
              )}
            </div>
          )}

          {!result && !isAnalyzing && (
            <div className="card flex-center" style={{ minHeight: 300, flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 48, opacity: 0.3 }}>🔬</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
                Capture or upload a cattle photo to get AI diagnosis
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
