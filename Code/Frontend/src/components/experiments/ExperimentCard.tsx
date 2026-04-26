import { Clock } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { cn } from '../../lib/utils';
import type { Experiment } from '../../types';

interface ExperimentCardProps {
  experiment: Experiment;
  onClick: () => void;
}

const ExperimentCard = ({ experiment, onClick }: ExperimentCardProps) => {
  return (
    <button
      type="button"
      className={cn(
        'w-full text-left rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4',
        'transition-shadow hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]',
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-[var(--text)] truncate">
          Experiment #{experiment.id.substring(0, 8)}
        </h3>
        <StatusBadge status={experiment.status} />
      </div>

      <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-1">
        Idea: {experiment.ideaId}
      </p>

      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center text-xs text-[var(--text-dim)]">
          <Clock className="mr-1 h-3 w-3" />
          <span>{new Date(experiment.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </button>
  );
};

export { ExperimentCard };
