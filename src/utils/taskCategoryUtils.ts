/**
 * Utility to determine the category of a task based on Quest.json categories
 */

export type TaskCategory = 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity' | 'physical';

/**
 * Maps tasks to their categories based on Quest.json data
 * This mapping should match the exact task names in Quest.json
 */
const taskToCategory: Record<string, TaskCategory> = {
  // Mindfulness category tasks
  "meditation": "mindfulness",
  "journaling emotions and thoughts": "mindfulness",
  "self-reflection": "mindfulness",
  
  // Learning category tasks
  "book reading": "learning",
  "listening to a podcast": "learning",
  "listening to chill/ mindful music": "learning",
  "online tutorial": "learning",
  "skill development": "learning",
  "watching educational documentary": "learning",
  "article reading": "learning",
  
  // Creativity category tasks
  "creative training": "creativity",
  "cooking": "creativity",
  
  // Physical category tasks (map to fitness for compatibility)
  "working out in the gym": "fitness",
  "running": "fitness",
  "flexibility and recovery": "fitness",
  "outdoor cadio": "fitness",
  "bodyweight exercises": "fitness",
  "rhythmic movement": "fitness",
  "yoga session": "fitness",
  "walking": "fitness",
  "jogging to the nearest park for a reflection": "fitness",
  "quality sleeping": "fitness",
  
  // Social category tasks
  "talk to a friend about your day": "social",
  "discover a new hobby group": "social"
};

/**
 * Extracts the task name from the formatted task text
 * Example: "Meditation (5 minutes)" -> "meditation"
 */
const extractTaskName = (taskText: string): string => {
  // First remove the duration part (anything in parentheses)
  const withoutDuration = taskText.split('(')[0].trim().toLowerCase();
  return withoutDuration;
};

/**
 * Determines the category of a task based on Quest.json data
 * @param taskText The text content of the task
 * @returns The determined category or undefined if no match
 */
export const getTaskCategory = (taskText: string): TaskCategory | undefined => {
  if (!taskText) return undefined;
  
  const taskName = extractTaskName(taskText);
  
  // Try to find an exact match first
  if (taskToCategory[taskName]) {
    return taskToCategory[taskName];
  }
  
  // If no exact match, try to find a partial match
  // This handles cases where the task text might be slightly different
  // but still refers to the same task
  for (const [key, category] of Object.entries(taskToCategory)) {
    if (taskName.startsWith(key) || key.startsWith(taskName)) {
      return category;
    }
  }
  
  // If we still can't find a match, check if the task mentions
  // any category names directly
  for (const category of Object.values(taskToCategory)) {
    if (taskName.includes(category)) {
      return category as TaskCategory;
    }
  }
  
  // Default fallback - we might want to provide a default
  // category or return undefined
  return undefined;
};

/**
 * For backwards compatibility
 */
export const determineTaskCategory = getTaskCategory;
export const categoryFromQuestKey = (_key: string): TaskCategory | undefined => undefined;
export const extractCategoryFromTask = getTaskCategory; 