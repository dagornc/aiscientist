import { useState } from "react";
import { PlusCircle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [domain, setDomain] = useState("");
  const [count, setCount] = useState("5");

  const handleGenerate = async () => {
    try {
      await generateIdeas({ domain: domain || "machine learning", count: parseInt(count) || 5 });
      setShowGenerate(false);
      setDomain("");
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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">{t("ideas.title")}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {ideas?.length ?? 0} idea{ideas?.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={() => setShowGenerate(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          {isGenerating ? t("common.loading") : t("ideas.generate")}
        </Button>
      </motion.div>

      {!ideas || ideas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={t("ideas.title")}
          description="Generate research ideas to get started"
          primaryAction={{ label: t("ideas.generate"), onClick: () => setShowGenerate(true), icon: PlusCircle }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea, idx) => (
            <IdeaCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} index={idx} />
          ))}
        </div>
      )}

      {/* Idea Detail Dialog */}
      <Dialog open={!!selectedIdea} onOpenChange={(open) => !open && setSelectedIdea(null)}>
        {selectedIdea && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedIdea.title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-[var(--text-muted)]">{selectedIdea.description}</p>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedIdea(null)}>
                {t("common.cancel")}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Generate Ideas Dialog */}
      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ideas.generate_modal.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gen-domain">{t("ideas.generate_modal.field.domain")}</Label>
              <Input
                id="gen-domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder={t("ideas.generate_modal.field.domain_placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gen-count">{t("ideas.generate_modal.field.count")}</Label>
              <Input
                id="gen-count"
                type="number"
                min={1}
                max={10}
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerate(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? t("common.loading") : t("ideas.generate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IdeasPage;