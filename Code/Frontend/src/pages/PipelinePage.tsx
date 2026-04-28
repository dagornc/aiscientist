import { useState, useCallback } from "react";
import { Play, Activity, WifiOff, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PipelineStep } from "../components/pipeline/PipelineStep";
import { useRunPipeline } from "../hooks/usePipeline";
import { useWebSocket } from "../hooks/useWebSocket";
import { useLocale } from "../hooks/useLocale";
import toast from "react-hot-toast";

const nodeTypes = { PipelineStep };

const initialNodes: Node[] = [
  { id: "1", type: "PipelineStep", position: { x: 0, y: 100 }, data: { labelKey: "pipeline.idea_generation", status: "pending", description: "Generate novel research directions" } },
  { id: "2", type: "PipelineStep", position: { x: 280, y: 100 }, data: { labelKey: "pipeline.experiment", status: "pending", description: "Run experiments in sandbox" } },
  { id: "3", type: "PipelineStep", position: { x: 560, y: 100 }, data: { labelKey: "pipeline.paper_writing", status: "pending", description: "Write structured paper" } },
  { id: "4", type: "PipelineStep", position: { x: 840, y: 100 }, data: { labelKey: "pipeline.peer_review", status: "pending", description: "ICLR-style automated review" } },
  { id: "5", type: "PipelineStep", position: { x: 1120, y: 30 }, data: { labelKey: "pipeline.accept", status: "pending", description: "Paper accepted" } },
  { id: "6", type: "PipelineStep", position: { x: 1120, y: 170 }, data: { labelKey: "pipeline.reject_revise", status: "pending", description: "Revision required" } },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: false },
  { id: "e2-3", source: "2", target: "3", animated: false },
  { id: "e3-4", source: "3", target: "4", animated: false },
  { id: "e4-5", source: "4", target: "5", label: "Accept" },
  { id: "e4-6", source: "4", target: "6", label: "Reject" },
  { id: "e6-3", source: "6", target: "3", label: "Revise", style: { strokeDasharray: "5 5" } },
];

const stepOrder = ["1", "2", "3", "4"];

const PipelinePage = () => {
  const { t } = useLocale();
  const { mutateAsync: runPipeline, isPending: isRunning, data: runResult } = useRunPipeline();
  const [domain, setDomain] = useState("machine learning");
  const [iterations, setIterations] = useState("3");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  // WebSocket for live pipeline updates
  const { isConnected, lastMessage } = useWebSocket({
    runId: (runResult as any)?.run_id,
    autoConnect: !!runResult,
  });

  // Update pipeline visualization when WS messages arrive
  if (lastMessage?.type === "progress") {
    const data = lastMessage.data as any;
    const stepIndex = data?.step ? parseInt(data.step.replace(/\D/g, "")) - 1 : -1;
    if (stepIndex >= 0 && stepIndex < stepOrder.length) {
      const completedSteps = stepOrder.slice(0, stepIndex);
      const currentStep = stepOrder[stepIndex];
      const remainingSteps = stepOrder.slice(stepIndex + 1);

      setNodes((nds) =>
        nds.map((n) => {
          if (completedSteps.includes(n.id))
            return { ...n, data: { ...n.data, status: "completed" } };
          if (n.id === currentStep)
            return { ...n, data: { ...n.data, status: "in_progress" } };
          if (remainingSteps.includes(n.id))
            return { ...n, data: { ...n.data, status: "pending" } };
          return n;
        }),
      );

      setEdges((eds) =>
        eds.map((e) => {
          // Animate edges that have been traversed
          if (completedSteps.includes(e.source) && completedSteps.includes(e.target))
            return { ...e, animated: true };
          return e;
        }),
      );
    }
  }

  const handleRun = useCallback(async () => {
    try {
      const result = await runPipeline({ domain, maxIterations: parseInt(iterations) || 3 });
      toast.success("Pipeline launched — monitoring in real time");
    } catch {
      toast.error("Failed to launch pipeline");
    }
  }, [domain, iterations, runPipeline]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">{t("pipeline.title")}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t("pipeline.description")}</p>
        </div>
        {runResult && (
          <div className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-1.5 text-xs">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 text-[var(--success)]" />
                <span className="text-[var(--text-muted)]">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-[var(--text-dim)]" />
                <span className="text-[var(--text-dim)]">Disconnected</span>
              </>
            )}
          </div>
        )}
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