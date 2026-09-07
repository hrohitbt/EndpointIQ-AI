// Semi-circular score dial, e.g. "70/100" in Nexthink's Digital Experience
// overview. Pure SVG, no chart library needed.
export default function GaugeScore({ value = 0, max = 100, size = 168 }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const radius = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 180;
  const endAngle = 0;
  const angle = startAngle - pct * 180;

  const toXY = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + radius * Math.cos(rad), cy - radius * Math.sin(rad)];
  };

  const [x1, y1] = toXY(startAngle);
  const [x2, y2] = toXY(endAngle);
  const [xv, yv] = toXY(angle);

  const tone = pct >= 0.8 ? "#10b981" : pct >= 0.5 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ width: size, height: size / 1.65 }} className="relative">
      <svg width={size} height={size / 1.65} viewBox={`0 0 ${size} ${size / 1.65}`}>
        <path
          d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${xv} ${yv}`}
          fill="none"
          stroke={tone}
          strokeWidth="14"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 text-center">
        <span className="text-3xl font-bold text-slate-900">{Math.round(value)}</span>
        <span className="text-xs text-slate-400">/ {max}</span>
      </div>
    </div>
  );
}
