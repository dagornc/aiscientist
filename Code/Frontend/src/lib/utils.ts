import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

// Format a progress percentage from 0-1 to 0-100
export function formatProgress(progress: number | undefined): number {
  if (progress === undefined) return 0;
  return Math.round(progress * 100);
}

// Generate a human-readable status string from status codes
export function getStatusDisplay(status: string): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'running': 
    case 'in_progress': 
      return 'Running';
    case 'completed': return 'Completed';
    case 'failed': return 'Failed';
    case 'cancelled': return 'Cancelled';
    case 'new': return 'New';
    case 'planned': return 'Planned';
    case 'idle': return 'Idle';
    case 'initializing': return 'Initializing';
    case 'generating': return 'Generating Ideas';
    case 'experimenting': return 'Running Experiments';
    case 'validating': return 'Validating Results';
    default: return capitalize(status);
  }
}

// Get appropriate status color class
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
    case 'idle':
      return 'text-green-500 bg-green-500/10';
    case 'running':
    case 'in_progress':
    case 'generating':
    case 'experimenting':
    case 'validating':
      return 'text-blue-500 bg-blue-500/10';
    case 'failed':
      return 'text-red-500 bg-red-500/10';
    case 'pending':
    case 'new':
      return 'text-yellow-500 bg-yellow-500/10';
    case 'cancelled':
      return 'text-gray-500 bg-gray-500/10';
    case 'planned':
      return 'text-purple-500 bg-purple-500/10';
    default:
      return 'text-gray-400 bg-gray-400/10';
  }
}