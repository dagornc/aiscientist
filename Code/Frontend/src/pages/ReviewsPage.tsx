import { useState } from "react";
import { ScrollText } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { EmptyState } from "../components/common/EmptyState";
import { Skeleton } from "../components/common/LoadingSpinner";
import { useReviews } from "../hooks/useReviews";
import { useLocale } from "../hooks/useLocale";
import { StatusBadge } from "../components/common/StatusBadge";
import type { Review } from "../types";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

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
    return <EmptyState icon={ScrollText} title={t("common.error")} description="Could not load reviews" />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text)]">{t("reviews.title")}</h1>
      </div>

      {!reviews || reviews.length === 0 ? (
        <EmptyState icon={ScrollText} title={t("reviews.empty_title")} description={t("reviews.empty_description")} />
      ) : (
        <div className="space-y-2">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="cursor-pointer transition-[background] duration-150 hover:bg-[var(--surface-raised)]"
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
          ))}
        </div>
      )}

      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Review details"
          >
            <h2 className="text-lg font-semibold text-[var(--text)]">
              {selectedReview.decision.toUpperCase()} ({selectedReview.overallScore}/10)
            </h2>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={[
                    { subject: "Soundness", value: selectedReview.scores.soundness },
                    { subject: "Presentation", value: selectedReview.scores.presentation },
                    { subject: "Contribution", value: selectedReview.scores.contribution },
                    { subject: "Rating", value: selectedReview.scores.rating },
                    { subject: "Confidence", value: selectedReview.scores.confidence },
                  ]}
                >
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
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

            <button
              className="mt-6 text-sm text-[var(--accent)] hover:underline"
              onClick={() => setSelectedReview(null)}
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
