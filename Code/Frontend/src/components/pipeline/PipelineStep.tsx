import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '../../lib/utils';
import { CheckCircle, Circle, Loader2, XCircle } from 'lucide-react';

interface PipelineStepData {
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  description: string;
  [key: string]: unknown;
}

function PipelineStep({ data }: NodeProps) {
  const stepData = data as PipelineStepData;
  const status = stepData.status || 'pending';

  const statusIcons: Record<string, React.ReactNode> = {
    completed: <CheckCircle className="h-4 w-4 text-[var(--success)]" />,
    in_progress: <Loader2 className="h-4 w-4 text-[var(--warning)] animate-spin" />,
    failed: <XCircle className="h-4 w-4 text-[var(--error)]" />,
    pending: <Circle className="h-4 w-4 text-[var(--text-dim)]" />,
  };

  const statusColors: Record<string, string> = {
    pending: 'border-[var(--border)]',
    in_progress: 'border-[var(--warning)]',
    completed: 'border-[var(--success)]',
    failed: 'border-[var(--error)]',
  };

  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-[var(--surface)] px-4 py-3 shadow-sm min-w-[180px]',
        statusColors[status] || statusColors.pending,
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-[var(--accent)]" />
      <div className="flex items-center gap-2">
        {statusIcons[status] || statusIcons.pending}
        <span className="text-sm font-medium text-[var(--text)]">{stepData.label}</span>
      </div>
      <p className="mt-1 text-xs text-[var(--text-dim)]">{stepData.description}</p>
      <Handle type="source" position={Position.Right} className="!bg-[var(--accent)]" />
    </div>
  );
}

export { PipelineStep };
export type { PipelineStepData };
