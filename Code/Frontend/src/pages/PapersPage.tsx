import { FileText, Download } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { EmptyState } from "../components/common/EmptyState";
import { Skeleton } from "../components/common/LoadingSpinner";
import { usePapers } from "../hooks/usePapers";
import { useLocale } from "../hooks/useLocale";
import { StatusBadge } from "../components/common/StatusBadge";
import type { Paper } from "../types";
import { useState } from "react";

const PapersPage = () => {
  const { t } = useLocale();
  const { data: papers, isLoading, isError } = usePapers();
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <EmptyState icon={FileText} title={t("common.error")} description="Could not load papers" />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text)]">{t("papers.title")}</h1>
      </div>

      {!papers || papers.length === 0 ? (
        <EmptyState icon={FileText} title={t("papers.title")} description="Papers will appear after the pipeline writes them" />
      ) : (
        <div className="space-y-3">
          {papers.map((paper) => (
            <Card key={paper.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedPaper(paper)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-[var(--text)]">{paper.title || `Paper #${paper.id.substring(0, 8)}`}</h3>
                    <p className="mt-1 text-sm text-[var(--text-muted)] line-clamp-2">{paper.abstract}</p>
                  </div>
                  <StatusBadge status={paper.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-dim)]">
                    {new Date(paper.createdAt).toLocaleDateString()}
                  </span>
                  <Button size="sm" variant="ghost" className="gap-1 text-xs">
                    <Download className="h-3 w-3" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paper detail */}
      {selectedPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedPaper(null)}>
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[var(--text)]">{selectedPaper.title}</h2>
            {selectedPaper.abstract && (
              <p className="mt-3 text-sm text-[var(--text-muted)]">{selectedPaper.abstract}</p>
            )}
            {selectedPaper.sections && Object.entries(selectedPaper.sections).map(([key, content]) => (
              <div key={key} className="mt-4">
                <h3 className="text-sm font-semibold text-[var(--text)] capitalize">{key.replace(/_/g, " ")}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)] whitespace-pre-wrap">{content}</p>
              </div>
            ))}
            <div className="mt-6 flex gap-2">
              <Button size="sm" className="gap-1">
                <Download className="h-3 w-3" />
                Download PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedPaper(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PapersPage;
