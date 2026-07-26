import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Camera, UploadCloud, AlertCircle, Loader } from 'lucide-react';

export default function Capture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [permissionError, setPermissionError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setPermissionError(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePicture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsAnalyzing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsAnalyzing(false);
        return;
      }
      try {
        const token = localStorage.getItem('userToken');
        const formData = new FormData();
        formData.append('file', blob, 'cattle.jpg');

        const response = await fetch('http://localhost:5000/predict/analyze', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          setResult(data.prediction);
          stopCamera();
        } else {
          alert(data.error || 'Prediction failed');
        }
      } catch (err) {
        console.error(err);
        alert('Error analyzing image. Ensure backend is running.');
      } finally {
        setIsAnalyzing(false);
      }
    }, 'image/jpeg', 0.8);
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: '8px' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0 }}>AI Disease Detection</h1>
          <p style={{ margin: 0, fontSize: '14px' }}>Scan your livestock for instant health analysis</p>
        </div>
      </div>

      {!result ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
          
          <div style={{ width: '100%', maxWidth: '500px', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)', background: '#000', aspectRatio: '4/3', marginBottom: '32px' }}>
            {!permissionError ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg-base)' }}>
                <AlertCircle size={48} color="var(--error)" style={{ marginBottom: '16px' }} />
                <p style={{ color: 'var(--text-main)', fontWeight: '500' }}>Camera access denied.</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>Please allow camera permissions.</p>
              </div>
            )}
            
            {/* Viewfinder Corners overlay */}
            <div style={{ position: 'absolute', top: '15%', left: '15%', right: '15%', bottom: '15%', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '16px' }}></div>
          </div>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '500px' }}>
            {isAnalyzing ? (
              <button disabled className="btn btn-primary" style={{ flex: 1, opacity: 0.8, cursor: 'not-allowed', height: '56px' }}>
                <Loader className="spinner" size={20} style={{ border: 'none' }} />
                Analyzing with AI...
              </button>
            ) : (
              <button onClick={takePicture} className="btn btn-primary" style={{ flex: 1, height: '56px', fontSize: '16px' }}>
                <Camera size={20} />
                Capture & Analyze
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <CheckCircle size={64} color="var(--primary)" style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '32px' }}>Analysis Complete</h2>
          
          <div style={{ background: 'var(--bg-base)', padding: '24px', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Detected Condition</span>
              <span style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '18px' }}>{result.label}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>AI Confidence</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '120px', height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(result.confidence * 100).toFixed(0)}%`, height: '100%', background: 'var(--primary)' }}></div>
                </div>
                <span style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>{(result.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => { setResult(null); startCamera(); }}>
              Scan Another
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/medicine')}>
              View Treatments
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
