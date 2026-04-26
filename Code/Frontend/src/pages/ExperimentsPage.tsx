import { useState } from "react";
import { FlaskConical, Play } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { EmptyState } from "../components/common/EmptyState";
import { Skeleton } from "../components/common/LoadingSpinner";
import { useExperiments, useRunExperiment } from "../hooks/useExperiments";
import { useLocale } from "../hooks/useLocale";
import type { Experiment } from "../types";

const ExperimentsPage = () => {
  const { t } = useLocale();
  const { data: experiments, isLoading, isError } = useExperiments();
  const { mutateAsync: runExperiment, isPending: isRunning } = useRunExperiment();

  const handleRun = async (ideaId: string) => {
    try {
      await runExperiment({ ideaId });
    } catch {
      // Error handled by react-query
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <EmptyState icon={FlaskConical} title={t("common.error")} description="Could not load experiments" />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--text)]">{t("experiments.title")}</h1>
        <Button onClick={() => handleRun("default")} disabled={isRunning} className="gap-2">
          <Play className="h-4 w-4" />
          {isRunning ? t("common.loading") : t("experiments.run_experiment")}
        </Button>
      </div>

      {!experiments || experiments.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title={t("experiments.empty_title")}
          description={t("experiments.empty_description")}
        />
      ) : (
        <div className="space-y-2">
          {experiments.map((exp) => (
            <Card
              key={exp.id}
              className="cursor-pointer transition-[background] duration-150 hover:bg-[var(--surface-raised)]"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text)]">Experiment #{exp.id.substring(0, 8)}</h3>
                    <p className="text-xs text-[var(--text-dim)]">Idea: {exp.ideaId}</p>
                  </div>
                  <span className="text-xs text-[var(--text-dim)]">
                    {new Date(exp.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {exp.progress > 0 && (
                  <div className="mt-3">
                    <div className="h-1 overflow-hidden rounded-full bg-[var(--surface-raised)]">
                      <div
                        className="h-1 rounded-full bg-[var(--accent)] transition-[width] duration-200 ease-out"
                        style={{ width: `${exp.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-[var(--text-dim)]">{exp.progress}%</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperimentsPage;
