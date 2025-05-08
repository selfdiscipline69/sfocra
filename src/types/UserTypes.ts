export interface UserChoices {
  question1: string | null;
  question2: string | null;
  question4: string | null;
}

/**
 * Represents an additional task in the user's task list
 * Supports both legacy and new format tasks with TaskLibrary integration
 */
export interface AdditionalTask {
  id: string;                 // Unique identifier for the task
  text: string;               // Display text for the task (including name and intensity)
  image: string | null;       // Optional image URL/URI
  completed: boolean;         // Whether the task is completed
  showImage: boolean;         // Whether to show the image
  
  // Category for the task - matches TaskLibrary categories
  // Making it optional ensures backward compatibility
  category?: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity';
  
  color?: string;             // Color for displaying the task
  
  // New fields for TaskLibrary integration
  taskKey?: string;           // Reference to the task in TaskLibrary.json
  intensityKey?: string;      // Reference to the intensity level in TaskLibrary.json
}

// Unified TaskData interface
export interface TaskData {
  id: string;
  category: string; // Should align with 'fitness', 'learning', etc., or 'general'
  taskName: string;
  intensity: string; // Duration for the task, e.g., "30 minutes", "3 sets"
  is_daily: boolean; // true for daily, false for additional
  XP: number; // Default 500 for daily, 250 for additional
  is_Recurrent?: boolean; // Optional
  Recurrent_frequency?: number[]; // Optional, 7-item array [0,0,0,0,0,0,0]
  start_time?: string; // Optional, format: "HH:MM"
  note?: string; // Optional
  status: 'default' | 'completed' | 'canceled'; // For daily tasks, can be extended for additional if needed
  completed_at?: number; // Optional, timestamp
  day?: number; // Optional, account age day when task was relevant or completed
  
  // Fields from AdditionalTask that might be relevant if unifying completely
  image?: string | null;
  showImage?: boolean;
  // Fields from TaskLibrary for easier lookup if this task originated from there
  taskKey?: string;
  intensityKey?: string;
  color?: string; // Color for displaying the task, can be derived from category
}
