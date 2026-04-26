import { useState } from "react";
import { PlusCircle, Lightbulb } from "lucide-react";
import { Button } from "../components/ui/button";
import { EmptyState } from "../components/common/EmptyState";
import { Skeleton } from "../components/common/LoadingSpinner";
import { useIdeas, useGenerateIdeas } from "../hooks/useIdeas";
import { useLocale } from "../hooks/useLocale";
import { IdeaCard } from "../components/ideas/IdeaCard";
import type { Idea } from "../types";

const IdeasPage = () => {
  const { t } = useLocale();
  const { data: ideas, isLoading, isError } = useIdeas();
  const { mutateAsync: generateIdeas, isPending: isGenerating } = useGenerateIdeas();
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  const handleGenerate = async () => {
    try {
      await generateIdeas({ domain: "machine learning", count: 5 });
    } catch {
      // Error handled by react-query
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <EmptyState icon={Lightbulb} title={t("common.error")} description="Could not load ideas" />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--text)]">{t("ideas.title")}</h1>
        <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          {isGenerating ? t("common.loading") : t("ideas.generate")}
        </Button>
      </div>

      {!ideas || ideas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={t("ideas.title")}
          description="Generate research ideas to get started"
          primaryAction={{ label: t("ideas.generate"), onClick: handleGenerate, icon: PlusCircle }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
          ))}
        </div>
      )}

      {selectedIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedIdea(null)}>
          <div
            className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={selectedIdea.title}
          >
            <h2 className="text-lg font-semibold text-[var(--text)]">{selectedIdea.title}</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{selectedIdea.description}</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[var(--text-dim)]">{t("ideas.novelty")}</p>
                <p className="text-sm font-medium text-[var(--text)]">{selectedIdea.noveltyScore.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-dim)]">{t("ideas.feasibility")}</p>
                <p className="text-sm font-medium text-[var(--text)]">{selectedIdea.feasibilityScore.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-dim)]">{t("ideas.impact")}</p>
                <p className="text-sm font-medium text-[var(--text)]">{selectedIdea.impactScore.toFixed(1)}</p>
              </div>
            </div>
            <Button className="mt-6" onClick={() => setSelectedIdea(null)}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeasPage;
