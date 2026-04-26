import { cn } from '../../lib/utils';

interface TimelineStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

interface PipelineTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

const PipelineTimeline = ({ steps, className }: PipelineTimelineProps) => {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {steps.map((step, index) => (
        <div key={step.name} className="flex items-center">
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
              step.status === 'completed' && 'bg-[var(--success)]/10 text-[var(--success)]',
              step.status === 'in_progress' && 'bg-[var(--warning)]/10 text-[var(--warning)]',
              step.status === 'failed' && 'bg-[var(--error)]/10 text-[var(--error)]',
              step.status === 'pending' && 'bg-[var(--surface-raised)] text-[var(--text-dim)]',
            )}
          >
            {step.status === 'completed' && '✓'}
            {step.status === 'in_progress' && '●'}
            {step.status === 'failed' && '✗'}
            {step.status === 'pending' && '○'}
            <span>{step.name}</span>
          </div>
          {index < steps.length - 1 && (
            <div className="mx-1 h-px w-4 bg-[var(--border)]" />
          )}
        </div>
      ))}
    </div>
  );
};

export { PipelineTimeline };
