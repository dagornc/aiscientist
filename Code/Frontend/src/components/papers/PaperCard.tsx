import { FileText, Clock } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { cn } from '../../lib/utils';
import type { Paper } from '../../types';

interface PaperCardProps {
  paper: Paper;
  onClick: () => void;
}

const PaperCard = ({ paper, onClick }: PaperCardProps) => {
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
        <div>
          <h3 className="font-semibold text-[var(--text)] truncate max-w-[75%]">
            {paper.title || `Paper #${paper.id.substring(0, 8)}`}
          </h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Idea: {paper.ideaId}
          </p>
        </div>
        <StatusBadge status={paper.status} />
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-[var(--text-dim)]">
        {paper.abstract}
      </p>

      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center text-xs text-[var(--text-dim)]">
          <FileText className="mr-1 h-3 w-3" />
          <span>ID: {paper.id.substring(0, 8)}</span>
        </div>
        <div className="flex items-center text-xs text-[var(--text-dim)]">
          <Clock className="mr-1 h-3 w-3" />
          <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </button>
  );
};

export { PaperCard };
