export interface UserChoices {
  question1: string | null;
  question2: string | null;
  question4: string | null;
}

export interface AdditionalTask {
  id: string;
  text: string;
  completed: boolean;
  showImage: boolean;
  category?: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity';
  color?: string;
}
