import { Button } from "../ui/button";
import { Download } from "lucide-react";
import type { Paper } from "../../types";

interface PaperViewerProps {
  paper: Paper;
  onDownload?: () => void;
}

const PaperViewer = ({ paper, onDownload }: PaperViewerProps) => {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="mb-6 flex items-start justify-between">
        <h2 className="text-lg font-semibold text-[var(--text)]">{paper.title}</h2>
        {onDownload && (
          <Button variant="outline" onClick={onDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        )}
      </div>

      {paper.abstract && (
        <div className="mb-6 border-b border-[var(--border)] pb-4">
          <h3 className="mb-2 text-sm font-semibold text-[var(--text-muted)]">Abstract</h3>
          <p className="whitespace-pre-line text-sm text-[var(--text-muted)]">{paper.abstract}</p>
        </div>
      )}

      {paper.sections && Object.entries(paper.sections).map(([key, content]) => (
        <div key={key} className="mb-4">
          <h3 className="mb-1 text-sm font-semibold capitalize text-[var(--text)]">{key.replace(/_/g, " ")}</h3>
          <p className="whitespace-pre-wrap text-sm text-[var(--text-muted)]">{content}</p>
        </div>
      ))}
    </div>
  );
};

export { PaperViewer };
