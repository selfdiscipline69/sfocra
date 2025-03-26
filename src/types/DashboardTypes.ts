/**
 * Types related to dashboard data visualization
 */

export interface CategoryData {
  x: string;
  y: number;
  color: string | undefined;
  label?: string;
  
  // For chart display
  category?: string;
  minutes?: number;
}

export interface CompletionStats {
  total: number;
  completed: number;
  percentage: number;
}

export interface CategoryStats {
  [category: string]: CompletionStats;
}

export interface StreakData {
  current: number;
  longest: number;
  lastCompleted: string | null;
}

export interface PerformanceData {
  tasksByCategory: CategoryData[];
  completionRate: number;
  streak: StreakData;
  xpPoints: number;
  level: number;
}
