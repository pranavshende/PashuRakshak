import { useEffect, useState } from 'react';

export default function ConfidenceBar({ value }) {
  const [displayed, setDisplayed] = useState(0);
  const pct = Math.round((value || 0) * 100);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);

  const color = pct >= 80 ? '#22C55E' : pct >= 60 ? '#EAB308' : '#F97316';

  return (
    <div className="confidence-bar-wrapper">
      <div className="confidence-label">
        <span>AI Confidence</span>
        <span style={{ color }}>{displayed}%</span>
      </div>
      <div className="confidence-bar-track">
        <div
          className="confidence-bar-fill"
          style={{ width: `${displayed}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
        />
      </div>
    </div>
  );
}
