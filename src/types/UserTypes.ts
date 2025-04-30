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
