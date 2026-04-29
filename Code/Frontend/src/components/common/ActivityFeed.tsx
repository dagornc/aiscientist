import { motion } from "framer-motion";
import {
  Lightbulb,
  FlaskConical,
  FileText,
  ScrollText,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";

type ActivityType =
  | "idea_generated"
  | "experiment_started"
  | "experiment_completed"
  | "experiment_failed"
  | "paper_completed"
  | "review_received"
  | "pipeline_started"
  | "pipeline_completed";

interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
}

const activityConfig: Record<
  ActivityType,
  { icon: React.ReactNode; color: string }
> = {
  idea_generated: {
    icon: <Lightbulb className="h-3.5 w-3.5" />,
    color: "text-[var(--accent)]",
  },
  experiment_started: {
    icon: <FlaskConical className="h-3.5 w-3.5" />,
    color: "text-[var(--warning)]",
  },
  experiment_completed: {
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    color: "text-[var(--success)]",
  },
  experiment_failed: {
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    color: "text-[var(--error)]",
  },
  paper_completed: {
    icon: <FileText className="h-3.5 w-3.5" />,
    color: "text-[var(--success)]",
  },
  review_received: {
    icon: <ScrollText className="h-3.5 w-3.5" />,
    color: "text-[var(--info)]",
  },
  pipeline_started: {
    icon: <Activity className="h-3.5 w-3.5" />,
    color: "text-[var(--warning)]",
  },
  pipeline_completed: {
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    color: "text-[var(--success)]",
  },
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = Math.floor((now - time) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Generate sample activity data
function generateSampleActivity(): ActivityEvent[] {
  const now = Date.now();
  return [
    {
      id: "1",
      type: "pipeline_started",
      title: "Pipeline launched",
      description: "Domain: Machine Learning",
      timestamp: new Date(now - 300_000).toISOString(),
    },
    {
      id: "2",
      type: "idea_generated",
      title: "3 ideas generated",
      description: "Novelty scores: 7.2, 8.1, 6.9",
      timestamp: new Date(now - 1_200_000).toISOString(),
    },
    {
      id: "3",
      type: "experiment_completed",
      title: "Experiment completed",
      description: "Accuracy: 94.2%",
      timestamp: new Date(now - 3_600_000).toISOString(),
    },
    {
      id: "4",
      type: "paper_completed",
      title: "Paper drafted",
      description: "Auto-generated LaTeX document",
      timestamp: new Date(now - 7_200_000).toISOString(),
    },
    {
      id: "5",
      type: "review_received",
      title: "Review received",
      description: "Score: 7/10 — Borderline",
      timestamp: new Date(now - 14_400_000).toISOString(),
    },
    {
      id: "6",
      type: "experiment_failed",
      title: "Experiment failed",
      description: "OOM error on GPU",
      timestamp: new Date(now - 86_400_000).toISOString(),
    },
  ];
}

interface ActivityFeedProps {
  className?: string;
  maxItems?: number;
}

const ActivityFeed = ({ className, maxItems = 6 }: ActivityFeedProps) => {
  const events = generateSampleActivity().slice(0, maxItems);

  return (
    <div className={cn("space-y-0.5", className)}>
      {events.map((event, index) => {
        const config = activityConfig[event.type];
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            className="group flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--surface-raised)]"
          >
            {/* Timeline dot */}
            <div className="relative mt-1 flex flex-col items-center">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md",
                  `bg-[var(--surface-raised)]`,
                  config.color,
                )}
              >
                {config.icon}
              </div>
              {index < events.length - 1 && (
                <div className="mt-1 h-4 w-px bg-[var(--border)]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text)]">
                {event.title}
              </p>
              {event.description && (
                <p className="text-[11px] text-[var(--text-dim)] truncate">
                  {event.description}
                </p>
              )}
            </div>

            {/* Timestamp */}
            <span className="flex-shrink-0 text-[10px] text-[var(--text-dim)] tabular-nums">
              {formatRelativeTime(event.timestamp)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export { ActivityFeed };
export type { ActivityEvent, ActivityType };
