import { getStatusColor, getStatusDisplay, cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge = ({ status, className, size = 'md' }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        getStatusColor(status),
        size === 'sm' ? 'text-xs' : 'text-sm',
        className
      )}
    >
      {getStatusDisplay(status)}
    </span>
  );
};