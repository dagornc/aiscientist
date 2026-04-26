import { Clock, TrendingUp } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { cn } from '../../lib/utils';
import type { Idea } from '../../types';

interface IdeaCardProps {
  idea: Idea;
  onClick: () => void;
}

const IdeaCard = ({ idea, onClick }: IdeaCardProps) => {
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
        <h3 className="font-semibold text-[var(--text)] truncate">{idea.title}</h3>
        <StatusBadge status={idea.status} />
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">
        {idea.description}
      </p>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center text-xs text-[var(--text-dim)]">
          <Clock className="mr-1 h-3 w-3" />
          <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
        </div>

        {idea.noveltyScore > 0 && (
          <div className="flex items-center text-xs text-[var(--success)]">
            <TrendingUp className="mr-1 h-3 w-3" />
            <span>Novelty: {idea.noveltyScore.toFixed(1)}</span>
          </div>
        )}
      </div>
    </button>
  );
};

export { IdeaCard };
