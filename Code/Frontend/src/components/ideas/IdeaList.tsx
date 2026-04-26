import type { Idea } from '../../types';
import { IdeaCard } from './IdeaCard';
import { EmptyState } from '../common/EmptyState';
import { PlusCircle } from 'lucide-react';

interface IdeaListProps {
  ideas: Idea[];
  onIdeaClick: (idea: Idea) => void;
  onGenerateClick: () => void;
  isLoading?: boolean;
}

const IdeaList = ({ ideas, onIdeaClick, onGenerateClick, isLoading }: IdeaListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  if (!ideas || ideas.length === 0) {
    return (
      <EmptyState
        icon={PlusCircle}
        title="No research ideas yet"
        description="Start generating ideas for your research project"
        primaryAction={{
          label: 'Generate Ideas',
          onClick: onGenerateClick,
          icon: PlusCircle,
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {ideas.map((idea) => (
        <IdeaCard key={idea.id} idea={idea} onClick={() => onIdeaClick(idea)} />
      ))}
    </div>
  );
};

export { IdeaList };
