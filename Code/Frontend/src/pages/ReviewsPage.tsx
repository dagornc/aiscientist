import { useState } from "react";
import { ScrollText } from "lucide-react";
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
import { useReviews } from "../hooks/useReviews";
import { useLocale } from "../hooks/useLocale";
import { StatusBadge } from "../components/common/StatusBadge";
import type { Review } from "../types";
import { ScoreRadar } from "../components/reviews/ScoreRadar";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const ReviewsPage = () => {
  const { t } = useLocale();
  const { data: reviews, isLoading, isError } = useReviews();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

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
        icon={ScrollText}
        title={t("common.error")}
        description="Could not load reviews"
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
        <h1 className="text-2xl font-semibold text-[var(--text)]">{t("reviews.title")}</h1>
      </motion.div>

      {!reviews || reviews.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title={t("reviews.empty_title")}
          description={t("reviews.empty_description")}
          primaryAction={{ label: "Request Review", onClick: () => alert("Feature coming soon"), icon: ScrollText }}
        />
      ) : (
        <motion.div
          className="space-y-2"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {reviews.map((review) => (
            <motion.div key={review.id} variants={listItemVariants}>
              <Card
                className="cursor-pointer transition-all duration-150 hover:bg-[var(--surface-raised)]"
                onClick={() => setSelectedReview(review)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium text-[var(--text)]">
                        Review for Paper #{review.paperId.substring(0, 8)}
                      </h3>
                      <p className="text-xs text-[var(--text-dim)]">
                        {t("reviews.overall_score")}: {review.overallScore}/10
                      </p>
                    </div>
                    <StatusBadge status={review.decision} size="sm" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Review Detail Dialog */}
      <Dialog
        open={!!selectedReview}
        onOpenChange={(open) => !open && setSelectedReview(null)}
      >
        {selectedReview && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedReview.decision.toUpperCase()} ({selectedReview.overallScore}/10)
              </DialogTitle>
            </DialogHeader>

            <div className="mt-2">
              <ScoreRadar
                scores={{
                  soundness: selectedReview.scores.soundness,
                  presentation: selectedReview.scores.presentation,
                  contribution: selectedReview.scores.contribution,
                  rating: selectedReview.scores.rating,
                  confidence: selectedReview.scores.confidence,
                }}
              />
            </div>

            {selectedReview.strengths.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--success)]">
                  {t("reviews.strengths")}
                </h3>
                <ul className="mt-1 list-disc pl-4 text-sm text-[var(--text-muted)]">
                  {selectedReview.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedReview.weaknesses.length > 0 && (
              <div className="mt-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--error)]">
                  {t("reviews.weaknesses")}
                </h3>
                <ul className="mt-1 list-disc pl-4 text-sm text-[var(--text-muted)]">
                  {selectedReview.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedReview(null)}>
                {t("common.cancel")}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default ReviewsPage;
