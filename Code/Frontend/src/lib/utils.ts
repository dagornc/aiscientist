import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusDisplay(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    running: "Running",
    in_progress: "Running",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
    new: "New",
    planned: "Planned",
    idle: "Idle",
    initializing: "Initializing",
    generating: "Generating",
    experimenting: "Experimenting",
    validating: "Validating",
    draft: "Draft",
    reviewed_accepted: "Accepted",
    reviewed_rejected: "Rejected",
    revision_required: "Revision Required",
    accept: "Accept",
    reject: "Reject",
    borderline: "Borderline",
  };
  return map[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
    case "idle":
    case "accept":
    case "reviewed_accepted":
      return "text-[var(--success)] bg-[oklch(0.72_0.17_155/0.1)]";
    case "running":
    case "in_progress":
    case "generating":
    case "experimenting":
    case "validating":
      return "text-[var(--info)] bg-[oklch(0.68_0.12_240/0.1)]";
    case "failed":
    case "reject":
    case "reviewed_rejected":
      return "text-[var(--error)] bg-[oklch(0.62_0.20_25/0.1)]";
    case "pending":
    case "new":
      return "text-[var(--warning)] bg-[oklch(0.78_0.15_75/0.1)]";
    case "cancelled":
      return "text-[var(--text-dim)] bg-[var(--surface-raised)]";
    case "planned":
    case "borderline":
    case "revision_required":
    case "draft":
      return "text-[var(--accent)] bg-[oklch(0.65_0.18_290/0.1)]";
    default:
      return "text-[var(--text-dim)] bg-[var(--surface-raised)]";
  }
}
