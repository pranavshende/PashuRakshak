import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Camera } from 'lucide-react';

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
    return () => {
      stopCamera();
    };
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
    
    // Draw current video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to Blob (jpeg)
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsAnalyzing(false);
        return;
      }

      try {
        const token = localStorage.getItem('userToken');
        const formData = new FormData();
        formData.append('file', blob, 'cattle.jpg');

        const response = await fetch('http://127.0.0.1:5000/predict/analyze', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          setResult(data.prediction);
          stopCamera(); // Stop camera when showing result
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

  if (permissionError) {
    return (
      <div className="capture-container centered">
        <p className="permission-text">Camera permission denied or camera not found.</p>
        <button className="primary-button" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="capture-container result-container">
        <CheckCircle size={80} color="#10B981" className="result-icon" />
        <h2 className="result-title">Analysis Complete</h2>
        
        <div className="result-card">
          <div className="result-row">
            <span className="result-label">Detected Condition:</span>
            <span className="result-value">{result.label}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Confidence:</span>
            <span className="result-value">{(result.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>

        <button className="primary-button" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="capture-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-view"
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="camera-overlay">
        <div className="viewfinder-corners"><span></span></div>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#fff" />
        </button>
        
        <div className="bottom-controls">
          {isAnalyzing ? (
            <div className="analyzing-container">
              <div className="spinner"></div>
              <span className="analyzing-text">Analyzing...</span>
            </div>
          ) : (
            <button className="capture-btn" onClick={takePicture}>
              <div className="capture-inner-btn"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
