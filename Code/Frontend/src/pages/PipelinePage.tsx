import { useState, useCallback } from "react";
import { Play, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PipelineStep } from "../components/pipeline/PipelineStep";
import { useCreatePipeline, useRunPipeline } from "../hooks/usePipeline";
import { useLocale } from "../hooks/useLocale";

const nodeTypes = { PipelineStep };

const PipelinePage = () => {
  const { t } = useLocale();
  const { mutateAsync: runPipeline, isPending: isRunning } = useRunPipeline();
  const [domain, setDomain] = useState("machine learning");
  const [iterations, setIterations] = useState("3");

  const [nodes, , onNodesChange] = useNodesState<Node>([
    { id: "1", type: "PipelineStep", position: { x: 0, y: 100 }, data: { label: t("pipeline.idea_generation"), status: "completed", description: "Generate novel research directions" } },
    { id: "2", type: "PipelineStep", position: { x: 280, y: 100 }, data: { label: t("pipeline.experiment"), status: "in_progress", description: "Run experiments in sandbox" } },
    { id: "3", type: "PipelineStep", position: { x: 560, y: 100 }, data: { label: t("pipeline.paper_writing"), status: "pending", description: "Write structured paper" } },
    { id: "4", type: "PipelineStep", position: { x: 840, y: 100 }, data: { label: t("pipeline.peer_review"), status: "pending", description: "ICLR-style automated review" } },
    { id: "5", type: "PipelineStep", position: { x: 1120, y: 30 }, data: { label: t("pipeline.accept"), status: "pending", description: "Paper accepted" } },
    { id: "6", type: "PipelineStep", position: { x: 1120, y: 170 }, data: { label: t("pipeline.reject_revise"), status: "pending", description: "Revision required" } },
  ]);

  const [edges, , onEdgesChange] = useEdgesState<Edge>([
    { id: "e1-2", source: "1", target: "2", animated: true },
    { id: "e2-3", source: "2", target: "3", animated: true },
    { id: "e3-4", source: "3", target: "4", animated: true },
    { id: "e4-5", source: "4", target: "5", label: t("pipeline.accept") },
    { id: "e4-6", source: "4", target: "6", label: t("pipeline.reject_revise") },
    { id: "e6-3", source: "6", target: "3", label: "Revise", style: { strokeDasharray: "5 5" } },
  ]);

  const handleRun = useCallback(async () => {
    try {
      await runPipeline({ domain, maxIterations: parseInt(iterations) || 3 });
    } catch {
      // Error handled by react-query
    }
  }, [domain, iterations, runPipeline]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text)]">{t("pipeline.title")}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t("pipeline.description")}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {t("pipeline.launch_pipeline")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="domain">{t("pipeline.domain")}</Label>
              <Input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g., computer vision" />
            </div>
            <div className="w-32 space-y-1">
              <Label htmlFor="iterations">{t("pipeline.iterations")}</Label>
              <Input id="iterations" type="number" min={1} max={10} value={iterations} onChange={(e) => setIterations(e.target.value)} />
            </div>
            <Button onClick={handleRun} disabled={isRunning} className="gap-2">
              <Play className="h-4 w-4" />
              {isRunning ? t("common.loading") : t("pipeline.launch_pipeline")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="h-[400px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="var(--border)" gap={20} size={1} />
          <Controls className="!bg-[var(--surface)] !border-[var(--border)] !text-[var(--text)]" />
          <MiniMap
            nodeColor={() => "var(--accent)"}
            maskColor="var(--bg)"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default PipelinePage;
