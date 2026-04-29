import { Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { StatusBadge } from "../common/StatusBadge";
import { cn } from "../../lib/utils";
import type { Idea } from "../../types";

interface IdeaCardProps {
  idea: Idea;
  onClick: () => void;
  index?: number;
}

const IdeaCard = ({ idea, onClick, index = 0 }: IdeaCardProps) => {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{
        y: -2,
        boxShadow: "0 0 24px -4px var(--glow-accent)",
      }}
      className={cn(
        "w-full text-left rounded-xl ghost-border bg-[var(--surface)] p-4",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1 focus:ring-offset-[var(--bg)]",
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-semibold text-[var(--text)] truncate text-sm">{idea.title}</h3>
        <StatusBadge status={idea.status} size="sm" />
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">
        {idea.description}
      </p>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center text-xs text-[var(--text-dim)]">
          <Clock className="mr-1 h-3 w-3" />
          <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
        </div>

        {idea.noveltyScore > 0 && (
          <div className="flex items-center text-xs text-[var(--success)]">
            <TrendingUp className="mr-1 h-3 w-3" />
            <span>Novelty: {idea.noveltyScore.toFixed(1)}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
};

export { IdeaCard };
