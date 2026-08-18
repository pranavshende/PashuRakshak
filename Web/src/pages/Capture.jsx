import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, RotateCcw, Zap, Video, VideoOff, Image, RefreshCw, Cpu, HardDrive } from 'lucide-react';
import { api } from '../services/api';
import { API_BASE_URL } from '../config/api';

const MODELS = [
  { id: 'gemini', label: 'Gemini 2.0 Flash', type: 'Cloud AI', icon: Cpu },
  { id: 'localml', label: 'Local ML Model', type: 'On-Device', icon: HardDrive },
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
    if (blob) setPreviewUrl(URL.createObjectURL(blob));
    try {
      const token = localStorage.getItem('userToken');
      const formData = new FormData();
      formData.append('file', blob || await fetch(previewUrl).then(r => r.blob()), 'cattle.jpg');
      
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
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  }, []);

  const reset = () => { setResult(null); setPreviewUrl(null); setCameraActive(false); stopCamera(); };

  return (
    <div className="page-content-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>AI Health Scan</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0 }}>Capture or upload images of your livestock for an instant medical assessment.</p>
      </div>

      {/* Model Selection */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {MODELS.map(m => (
          <div 
            key={m.id} 
            onClick={() => setSelectedModel(m.id)}
            style={{ flex: 1, minWidth: '250px', background: selectedModel === m.id ? 'var(--primary-light)' : 'var(--bg-card)', border: selectedModel === m.id ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '4px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'var(--transition)' }}
          >
            <div style={{ background: selectedModel === m.id ? 'var(--primary)' : 'var(--bg-base)', color: selectedModel === m.id ? '#fff' : 'var(--text-sub)', width: '40px', height: '40px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <m.icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: selectedModel === m.id ? 'var(--primary-dark)' : 'var(--text-main)' }}>{m.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{m.type} processing</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Left: Input (Camera/Upload) */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Image Source</h3>
          </div>

          <div style={{ padding: '24px' }}>
            {cameraActive ? (
              <div style={{ position: 'relative', width: '100%', height: '350px', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                  <div className="scanner-corner" style={{ position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTop: '4px solid #fff', borderLeft: '4px solid #fff' }} />
                  <div className="scanner-corner" style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTop: '4px solid #fff', borderRight: '4px solid #fff' }} />
                  <div className="scanner-corner" style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottom: '4px solid #fff', borderLeft: '4px solid #fff' }} />
                  <div className="scanner-corner" style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottom: '4px solid #fff', borderRight: '4px solid #fff' }} />
                </div>
              </div>
            ) : previewUrl ? (
              <div style={{ width: '100%', height: '350px', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div 
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{ width: '100%', height: '350px', background: dragOver ? 'var(--primary-light)' : 'var(--bg-base)', border: dragOver ? '2px dashed var(--primary)' : '2px dashed var(--border)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
              >
                <Upload size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Click or drag image to upload</div>
                <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '8px' }}>Supports JPG, PNG (Max 5MB)</div>
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange(e.target.files[0])} />

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              {cameraActive ? (
                <button onClick={takePicture} className="btn btn-primary" style={{ flex: 1 }}>
                  <Zap size={16} /> Capture & Analyze
                </button>
              ) : previewUrl && !result ? (
                <button onClick={() => analyzeBlob(null)} className="btn btn-primary" style={{ flex: 1 }} disabled={isAnalyzing}>
                  {isAnalyzing ? 'Analyzing...' : <><Zap size={16} /> Analyze Image</>}
                </button>
              ) : (
                <button onClick={startCamera} className="btn btn-primary" style={{ flex: 1 }}>
                  <Video size={16} /> Start Camera
                </button>
              )}

              {(previewUrl || cameraActive) && (
                <button onClick={reset} className="btn btn-secondary">
                  <RefreshCw size={16} /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Analysis Results */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Diagnostic Assessment</h3>
          </div>

          <div style={{ flex: 1, padding: '24px' }}>
            {isAnalyzing ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>AI is analyzing the image...</div>
                <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '8px', textAlign: 'center' }}>Scanning for lesions, skin anomalies, and visible symptoms.</div>
              </div>
            ) : result ? (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '4px' }}>Diagnosis Result</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: result.riskLevel === 'Healthy' ? 'var(--risk-low)' : 'var(--risk-critical)' }}>
                      {result.label}
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, backgroundColor: result.riskLevel === 'Healthy' ? 'var(--risk-low-bg)' : 'var(--risk-critical-bg)', color: result.riskLevel === 'Healthy' ? 'var(--risk-low)' : 'var(--risk-critical)' }}>
                    {result.riskLevel}
                  </span>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>AI Confidence</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>{Math.round(result.confidence * 100)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-base)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--primary)', width: `${result.confidence * 100}%` }} />
                  </div>
                </div>

                {result.symptoms && result.symptoms.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '8px' }}>Detected Symptoms</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {result.symptoms.map((s, i) => (
                        <span key={i} style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', color: 'var(--text-main)' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {result.treatment && (
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '12px' }}>Treatment Plan</h4>
                    
                    {result.treatment.medicines && result.treatment.medicines.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Medicines</div>
                        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                          {result.treatment.medicines.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {result.treatment.firstAid && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>First Aid</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.6 }}>{result.treatment.firstAid}</div>
                      </div>
                    )}

                    {result.treatment.prevention && (
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Prevention</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.6 }}>{result.treatment.prevention}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.5 }}>
                <Cpu size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500 }}>No Analysis Data</div>
                <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '8px' }}>Capture or upload an image to view diagnostic results here.</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
