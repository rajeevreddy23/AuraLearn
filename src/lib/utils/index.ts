import { cn } from './cn';
import { type ClassValue } from 'clsx';

export { cn };

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return `${months}mo ago`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateVerificationId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(12);
    crypto.getRandomValues(array);
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(array[i] % chars.length);
    }
    return result;
  }
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 80) return '#22c55e';
  if (percentage >= 60) return '#f59e0b';
  if (percentage >= 40) return '#f97316';
  return '#ef4444';
}

export function getLevelColor(level: string): string {
  switch (level) {
    case 'beginner': return '#22c55e';
    case 'intermediate': return '#f59e0b';
    case 'advanced': return '#ef4444';
    case 'expert': return '#8b5cf6';
    default: return '#6366f1';
  }
}

export function getLevelBadgeColor(level: string): string {
  switch (level) {
    case 'beginner': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'intermediate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'expert': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    default: return 'bg-primary/10 text-primary border-primary/20';
  }
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    programming: 'Code2',
    'artificial-intelligence': 'Brain',
    'data-science': 'BarChart3',
    mathematics: 'Sigma',
    science: 'Flask',
    engineering: 'Settings2',
    business: 'Briefcase',
    finance: 'TrendingUp',
    design: 'Palette',
    languages: 'Languages',
    cybersecurity: 'Shield',
    'cloud-computing': 'Cloud',
  };
  return icons[category] || 'BookOpen';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
