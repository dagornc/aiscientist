import { Plus, FileText, FlaskConical, BookOpen, ThumbsUp } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string; size?: number }>;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon: IconComponent,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) => {
  // Map specific sections to default icons
  const defaultIconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    ideas: FileText,
    experiments: FlaskConical,
    papers: BookOpen,
    reviews: ThumbsUp,
  };

  const Icon = IconComponent || defaultIconMap[title.toLowerCase()] || FileText;

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-border-subtle p-8 text-center bg-surface',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-surface-raised p-3">
        <Icon size={32} className="text-text-muted" />
      </div>
      <h3 className="mb-1 text-lg font-medium text-text">{title}</h3>
      <p className="mb-6 text-sm text-text-muted">{description}</p>
      {primaryAction && (
        <div className="flex gap-2">
          <Button 
            onClick={primaryAction.onClick}
            className="gap-2"
          >
            {primaryAction.icon && <primaryAction.icon size={16} />}
            {primaryAction.label}
          </Button>
          {secondaryAction && (
            <Button 
              variant="outline" 
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};