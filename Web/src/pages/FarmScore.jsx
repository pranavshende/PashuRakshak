import { useEffect, useState } from 'react';
import TopHeaderBanner from '../components/TopHeaderBanner';

const SCORE_BREAKDOWN = [
  { label: 'Herd Health Index', score: 82, icon: '🐄', color: '#22C55E' },
  { label: 'Vaccination Rate', score: 75, icon: '🧪', color: '#38BDF8' },
  { label: 'Diagnosis Activity', score: 60, icon: '🔬', color: '#8B5CF6' },
  { label: 'Milk Yield Trend', score: 88, icon: '🥛', color: '#F59E0B' },
];

const TIPS = [
  { icon: '💉', text: 'Schedule deworming for all calves this month', priority: 'High' },
  { icon: '📋', text: 'Update vaccination records for 3 animals', priority: 'Medium' },
  { icon: '🔬', text: 'Perform monthly health scan on your herd', priority: 'Medium' },
  { icon: '🥛', text: 'Review milk yield records for production dip', priority: 'Low' },
];

function ScoreRing({ score, color = '#16A34A' }) {
  const r = 70, circ = 2 * Math.PI * r;
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDisplayed(score), 200); return () => clearTimeout(t); }, [score]);
  const offset = circ - (displayed / 100) * circ;
  const ringColor = displayed >= 80 ? '#22C55E' : displayed >= 60 ? '#EAB308' : '#F97316';

  return (
    <div className="score-gauge-wrapper">
      <div className="score-ring">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle className="score-ring-track" cx="80" cy="80" r={r} />
          <circle
            className="score-ring-fill"
            cx="80" cy="80" r={r}
            stroke={ringColor}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        <div className="score-ring-label">
          <div className="score-number" style={{ color: ringColor }}>{displayed}</div>
          <div className="score-unit">/100</div>
        </div>
      </div>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>Overall Farm Score</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          {displayed >= 80 ? '🌟 Excellent — Keep it up!' : displayed >= 60 ? '👍 Good — Room to improve' : '⚠️ Needs attention'}
        </div>
      </div>
    </div>
  );
}

export default function FarmScore() {
  return (
    <div>
      <TopHeaderBanner title="Farm Health Score" subtitle="AI-powered farm performance intelligence" />

      <div className="page-content-container">
        <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
          {/* Score Ring */}
          <div className="card flex-center" style={{ flexDirection: 'column', padding: 32 }}>
            <ScoreRing score={76} />
          </div>

          {/* Breakdown */}
          <div className="card">
            <div className="section-title">Score Breakdown</div>
            {SCORE_BREAKDOWN.map((item, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div className="flex-between mb-2">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{item.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-sub)' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: item.color }}>{item.score}</span>
                </div>
                <div className="confidence-bar-track">
                  <div className="confidence-bar-fill" style={{ width: `${item.score}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}99)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Tips */}
        <div className="card mt-4">
          <div className="section-title">💡 Improvement Recommendations</div>
          {TIPS.map((tip, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 0', borderBottom: i < TIPS.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {tip.icon}
              </div>
              <div style={{ flex: 1, fontSize: 13, color: 'var(--text-sub)' }}>{tip.text}</div>
              <span className={`badge ${tip.priority === 'High' ? 'badge-critical' : tip.priority === 'Medium' ? 'badge-moderate' : 'badge-low'}`}>
                {tip.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
