const RISK_MAP = {
  CRITICAL: 'badge badge-critical',
  HIGH:     'badge badge-high',
  MODERATE: 'badge badge-moderate',
  LOW:      'badge badge-low',
};

export default function RiskBadge({ level }) {
  const cls = RISK_MAP[level?.toUpperCase()] || 'badge badge-low';
  return <span className={cls}>{level || 'LOW'}</span>;
}
