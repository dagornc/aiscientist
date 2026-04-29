import { useState } from "react";
import { FileText, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { EmptyState } from "../components/common/EmptyState";
import { Skeleton } from "../components/common/LoadingSpinner";
import { usePapers } from "../hooks/usePapers";
import { useLocale } from "../hooks/useLocale";
import { StatusBadge } from "../components/common/StatusBadge";
import type { Paper } from "../types";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const PapersPage = () => {
  const { t } = useLocale();
  const { data: papers, isLoading, isError } = usePapers();
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={FileText}
        title={t("common.error")}
        description="Could not load papers"
      />
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-semibold text-[var(--text)]">{t("papers.title")}</h1>
      </motion.div>

      {!papers || papers.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t("papers.empty_title")}
          description={t("papers.empty_description")}
          primaryAction={{ label: "Import Papers", onClick: () => alert("Import coming soon"), icon: Download }}
        />
      ) : (
        <motion.div
          className="space-y-2"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {papers.map((paper) => (
            <motion.div key={paper.id} variants={listItemVariants}>
              <Card
                className="cursor-pointer transition-all duration-150 hover:bg-[var(--surface-raised)]"
                onClick={() => setSelectedPaper(paper)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-[var(--text)]">
                        {paper.title || `Paper #${paper.id.substring(0, 8)}`}
                      </h3>
                      {paper.abstract && (
                        <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">
                          {paper.abstract}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={paper.status} size="sm" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text-dim)]">
                      {new Date(paper.createdAt).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="ghost" className="gap-1 text-xs">
                      <Download className="h-3 w-3" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Paper Detail Dialog */}
      <Dialog
        open={!!selectedPaper}
        onOpenChange={(open) => !open && setSelectedPaper(null)}
      >
        {selectedPaper && (
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPaper.title}</DialogTitle>
            </DialogHeader>
            {selectedPaper.abstract && (
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {selectedPaper.abstract}
              </p>
            )}
            {selectedPaper.sections &&
              Object.entries(selectedPaper.sections).map(([key, content]) => (
                <div key={key} className="mt-4">
                  <h3 className="text-sm font-semibold capitalize text-[var(--text)]">
                    {key.replace(/_/g, " ")}
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--text-muted)]">
                    {content}
                  </p>
                </div>
              ))}
            <DialogFooter>
              <Button size="sm" className="gap-1">
                <Download className="h-3 w-3" />
                {t("papers.download_pdf")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedPaper(null)}
              >
                {t("common.cancel")}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default PapersPage;
