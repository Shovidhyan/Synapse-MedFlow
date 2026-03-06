import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface HealthScoreRingProps {
  score: number;
  size?: number;
  className?: string;
}

const HealthScoreRing = ({ score, size = 120, className }: HealthScoreRingProps) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-critical';
  };

  const getLabel = () => {
    if (score >= 80) return 'Stable';
    if (score >= 60) return 'Monitor';
    return 'High Risk';
  };

  const getStroke = () => {
    if (score >= 80) return 'hsl(var(--success))';
    if (score >= 60) return 'hsl(var(--warning))';
    return 'hsl(var(--critical))';
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getStroke()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-heading font-bold text-2xl', getColor())}>{score}</span>
        </div>
      </div>
      <span className={cn('text-xs font-semibold uppercase tracking-wider', getColor())}>{getLabel()}</span>
    </div>
  );
};

export default HealthScoreRing;
