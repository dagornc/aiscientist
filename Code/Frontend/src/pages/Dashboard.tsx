import { Lightbulb, FlaskConical, FileText, ScrollText, ArrowRight, Activity, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { StatsApi } from "../api/client";
import type { StatsData } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Skeleton } from "../components/common/LoadingSpinner";
import { useLocale } from "../hooks/useLocale";
import { PipelineTimeline } from "../components/pipeline/PipelineTimeline";
import { Link } from "react-router-dom";
import { Sparkline } from "../components/common/Sparkline";
import { ActivityFeed } from "../components/common/ActivityFeed";
import { OnboardingCard } from "../components/common/OnboardingCard";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

// Simulated trend data
const trendData: Record<string, number[]> = {
  ideas: [2, 3, 5, 4, 7, 6, 8],
  experiments: [1, 2, 1, 3, 4, 3, 5],
  papers: [0, 1, 1, 2, 2, 3, 4],
  reviews: [0, 0, 1, 2, 1, 3, 4],
};

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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold text-[var(--text)]">{t("dashboard.welcome")}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t("dashboard.overview")}</p>
      </motion.div>

      {/* Onboarding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <OnboardingCard />
      </motion.div>

      {/* Stats */}
      <motion.div
        className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatItem icon={<Lightbulb className="h-4 w-4" />} label={t("dashboard.ideas_generated")} value={displayStats.ideasCount} loading={statsLoading} accentHue={290} trend={trendData.ideas} />
        <StatItem icon={<FlaskConical className="h-4 w-4" />} label={t("dashboard.experiments_run")} value={displayStats.experimentsCount} loading={statsLoading} accentHue={240} trend={trendData.experiments} />
        <StatItem icon={<FileText className="h-4 w-4" />} label={t("dashboard.papers_written")} value={displayStats.papersCount} loading={statsLoading} accentHue={155} trend={trendData.papers} />
        <StatItem icon={<ScrollText className="h-4 w-4" />} label={t("dashboard.reviews_completed")} value={displayStats.reviewsCount} loading={statsLoading} accentHue={75} trend={trendData.reviews} />
      </motion.div>

      {/* Pipeline + Activity Feed + Quick Actions */}
      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {/* Active Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--accent)]" />
              {t("pipeline.title")}
            </CardTitle>
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

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--warning)]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed maxItems={5} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.quick_start")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[var(--text-dim)]">
              Launch a new research pipeline or browse existing work.
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/pipeline">
                <Button variant="default" className="w-full gap-2 justify-start">
                  <Activity className="h-4 w-4" />
                  {t("pipeline.launch_pipeline")}
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
              <Link to="/ideas">
                <Button variant="outline" className="w-full gap-2 justify-start">
                  <Lightbulb className="h-4 w-4" />
                  {t("ideas.title")}
                </Button>
              </Link>
            </div>
            {/* ⌘K hint */}
            <p className="text-[10px] text-[var(--text-dim)] mt-2">
              Press <kbd className="rounded bg-[var(--surface-raised)] px-1 py-0.5 font-mono">⌘K</kbd> for quick navigation
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  loading?: boolean;
  accentHue?: number;
  trend?: number[];
}

const StatItem = ({ icon, label, value, loading, accentHue = 290, trend }: StatItemProps) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -2, boxShadow: `0 0 20px -4px oklch(0.65 0.18 ${accentHue} / 0.15)` }}
    className="rounded-xl p-4 ghost-border transition-colors duration-200"
    style={{ background: `linear-gradient(135deg, oklch(0.18 0.015 270) 0%, oklch(0.65 0.18 ${accentHue} / 0.04) 100%)` }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[var(--text-dim)]">
        <div className="rounded-md p-1" style={{ background: `oklch(0.65 0.18 ${accentHue} / 0.1)` }}>{icon}</div>
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      {trend && <Sparkline data={trend} color={`oklch(0.72 0.15 ${accentHue})`} width={64} height={24} />}
    </div>
    {loading ? (
      <Skeleton className="mt-3 h-8 w-16" />
    ) : (
      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-3 text-3xl font-bold tabular-nums"
        style={{ color: `oklch(0.72 0.15 ${accentHue})` }}
      >
        {value}
      </motion.p>
    )}
  </motion.div>
);

export default DashboardPage;