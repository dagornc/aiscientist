import { Lightbulb, FlaskConical, FileText, ScrollText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StatsApi } from "../api/client";
import type { StatsData } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Skeleton } from "../components/common/LoadingSpinner";
import { useLocale } from "../hooks/useLocale";
import { PipelineTimeline } from "../components/pipeline/PipelineTimeline";

const DashboardPage = () => {
  const { t } = useLocale();

  const { data: stats, isLoading: statsLoading } = useQuery<StatsData, Error>({
    queryKey: ["stats"],
    queryFn: StatsApi.getStats,
    retry: false,
  });

  const displayStats = stats ?? { ideasCount: 0, experimentsCount: 0, papersCount: 0, reviewsCount: 0 };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text)]">{t("dashboard.welcome")}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t("dashboard.description")}</p>
      </div>

      {/* Stats — varied layout, not identical cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatItem
          icon={<Lightbulb className="h-4 w-4" />}
          label={t("dashboard.ideas_generated")}
          value={displayStats.ideasCount}
          loading={statsLoading}
          accent
        />
        <StatItem
          icon={<FlaskConical className="h-4 w-4" />}
          label={t("dashboard.experiments_run")}
          value={displayStats.experimentsCount}
          loading={statsLoading}
        />
        <StatItem
          icon={<FileText className="h-4 w-4" />}
          label={t("dashboard.papers_written")}
          value={displayStats.papersCount}
          loading={statsLoading}
        />
        <StatItem
          icon={<ScrollText className="h-4 w-4" />}
          label={t("dashboard.reviews_completed")}
          value={displayStats.reviewsCount}
          loading={statsLoading}
        />
      </div>

      {/* Active pipeline + recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("pipeline.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <PipelineTimeline
              steps={[
                { name: t("pipeline.idea_generation"), status: "completed" },
                { name: t("pipeline.experiment"), status: "in_progress" },
                { name: t("pipeline.paper_writing"), status: "pending" },
                { name: t("pipeline.peer_review"), status: "pending" },
              ]}
            />
            <Progress value={25} className="mt-4 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.start_new")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--text-dim)]">
              {t("dashboard.description")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  loading?: boolean;
  accent?: boolean;
}

const StatItem = ({ icon, label, value, loading, accent }: StatItemProps) => (
  <div
    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
    style={accent ? { background: "oklch(0.65 0.18 290 / 0.08)" } : undefined}
  >
    <div className="flex items-center gap-2 text-[var(--text-dim)]">
      {icon}
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
    </div>
    {loading ? (
      <Skeleton className="mt-2 h-8 w-16" />
    ) : (
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${accent ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>
        {value}
      </p>
    )}
  </div>
);

export default DashboardPage;
