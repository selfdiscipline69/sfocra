export interface TaskItem {
  text: string;
  image: string | null;
  completed: boolean;
  showImage: boolean;
  category?: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity';
  color?: string;
}

export interface WeeklyTrialItem {
  text: string;
  image: string | null;
  completed: boolean;
  showImage: boolean;
  category?: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity';
  color?: string;
}