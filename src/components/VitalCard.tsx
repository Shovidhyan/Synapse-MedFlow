import { Heart, Activity, Droplets, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface VitalCardProps {
  label: string;
  value: string;
  unit: string;
  icon: string;
  status: 'normal' | 'warning' | 'critical';
  trend?: number[];
  compact?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  Heart, Activity, Droplets, Wind,
};

const statusColors = {
  normal: 'text-success border-success/20 bg-success/5',
  warning: 'text-warning border-warning/20 bg-warning/5',
  critical: 'text-critical border-critical/20 bg-critical/5',
};

const statusDot = {
  normal: 'bg-success',
  warning: 'bg-warning',
  critical: 'bg-critical',
};

const VitalCard = ({ label, value, unit, icon, status, trend, compact }: VitalCardProps) => {
  const Icon = iconMap[icon] || Heart;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-card-hover p-5 relative overflow-hidden',
        compact && 'p-4'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2 rounded-lg', statusColors[status])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn('w-2 h-2 rounded-full vital-pulse', statusDot[status])} />
          <span className="text-xs font-medium text-muted-foreground capitalize">{status}</span>
        </div>
      </div>

      <div className="mt-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className={cn('font-heading font-bold', compact ? 'text-2xl' : 'text-3xl')}>
            {value}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>

      {trend && trend.length > 0 && (
        <div className="mt-3 flex items-end gap-0.5 h-8">
          {trend.map((v, i) => {
            const max = Math.max(...trend);
            const min = Math.min(...trend);
            const range = max - min || 1;
            const height = ((v - min) / range) * 100;
            return (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-sm transition-all',
                  i === trend.length - 1 ? statusDot[status] : 'bg-muted-foreground/20'
                )}
                style={{ height: `${Math.max(height, 10)}%` }}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default VitalCard;
