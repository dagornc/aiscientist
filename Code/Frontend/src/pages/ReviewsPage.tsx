import { ScrollText } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { EmptyState } from "../components/common/EmptyState";
import { Skeleton } from "../components/common/LoadingSpinner";
import { useReviews } from "../hooks/useReviews";
import { useLocale } from "../hooks/useLocale";
import { StatusBadge } from "../components/common/StatusBadge";
import type { Review } from "../types";
import { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const ReviewsPage = () => {
  const { t } = useLocale();
  const { data: reviews, isLoading, isError } = useReviews();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

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
    return <EmptyState icon={ScrollText} title={t("common.error")} description="Could not load reviews" />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text)]">{t("reviews.title")}</h1>
      </div>

      {!reviews || reviews.length === 0 ? (
        <EmptyState icon={ScrollText} title={t("reviews.title")} description="Reviews will appear after papers are reviewed" />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedReview(review)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-[var(--text)]">Review for Paper #{review.paperId.substring(0, 8)}</h3>
                    <p className="text-sm text-[var(--text-muted)]">Overall: {review.overallScore}/10</p>
                  </div>
                  <StatusBadge status={review.decision} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review detail with radar chart */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedReview(null)}>
          <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[var(--text)]">
              Review — {selectedReview.decision.toUpperCase()} ({selectedReview.overallScore}/10)
            </h2>

            {/* Radar chart */}
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[
                  { subject: "Soundness", value: selectedReview.scores.soundness },
                  { subject: "Presentation", value: selectedReview.scores.presentation },
                  { subject: "Contribution", value: selectedReview.scores.contribution },
                  { subject: "Rating", value: selectedReview.scores.rating },
                  { subject: "Confidence", value: selectedReview.scores.confidence },
                ]}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Strengths */}
            {selectedReview.strengths.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-[var(--success)]">Strengths</h3>
                <ul className="mt-1 list-disc list-inside text-sm text-[var(--text-muted)]">
                  {selectedReview.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {selectedReview.weaknesses.length > 0 && (
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-[var(--error)]">Weaknesses</h3>
                <ul className="mt-1 list-disc list-inside text-sm text-[var(--text-muted)]">
                  {selectedReview.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            <button className="mt-6 text-sm text-[var(--accent)] hover:underline" onClick={() => setSelectedReview(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
