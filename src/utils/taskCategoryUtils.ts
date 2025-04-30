/**
 * Utility functions for working with task categories and TaskLibrary.json
 * Provides tools for categorizing tasks and interacting with the TaskLibrary data
 */

import TaskLibrary from '../../assets/TaskLibrary.json';

export type TaskCategory = 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity';

/**
 * Type definitions for TaskLibrary structure
 */
type TaskDetails = {
  task: string;
  category: string;
  intensities: { [key: string]: { duration: string } };
};

type TaskLibraryType = {
  task_category: { [key: string]: string[] };
  [key: string]: TaskDetails | { [key: string]: string[] };
};

// Cast the imported JSON to our type
const TypedTaskLibrary = TaskLibrary as TaskLibraryType;

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
  "physical": "fitness", // Map "physical" to "fitness" for compatibility
  
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
  
  // Map "physical" to "fitness" for compatibility
  if (taskName === "physical") return "fitness";
  
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
 * Gets all available categories from TaskLibrary.json
 * @returns Array of available category names
 */
export const getAvailableCategories = (): string[] => {
  try {
    const categories = Object.keys(TypedTaskLibrary.task_category || {});
    return categories;
  } catch (error) {
    console.error('Error fetching available categories:', error);
    return [];
  }
};

/**
 * Gets all tasks available for a specific category from TaskLibrary.json
 * @param category The category to get tasks for
 * @returns Array of task objects with key and name
 */
export const getTasksByCategory = (category: string): { key: string; name: string }[] => {
  try {
    if (!category) return [];
    
    const taskKeys = TypedTaskLibrary.task_category?.[category] || [];
    
    return taskKeys
      .map(key => {
        const taskDetail = TypedTaskLibrary[key] as TaskDetails | undefined;
        return taskDetail ? { key, name: taskDetail.task } : null;
      })
      .filter((task): task is { key: string; name: string } => task !== null);
  } catch (error) {
    console.error(`Error fetching tasks for category ${category}:`, error);
    return [];
  }
};

/**
 * Gets all intensity options available for a specific task from TaskLibrary.json
 * @param taskKey The task key to get intensities for
 * @returns Array of intensity objects with key and duration
 */
export const getIntensitiesByTask = (taskKey: string): { key: string; duration: string }[] => {
  try {
    if (!taskKey) return [];
    
    const taskDetail = TypedTaskLibrary[taskKey] as TaskDetails | undefined;
    
    if (!taskDetail?.intensities) return [];
    
    return Object.entries(taskDetail.intensities)
      .map(([key, value]) => ({ key, duration: value.duration }));
  } catch (error) {
    console.error(`Error fetching intensities for task ${taskKey}:`, error);
    return [];
  }
};

/**
 * Gets a full task detail object from the TaskLibrary by its key
 * @param taskKey The key of the task to get details for
 * @returns The task details object or undefined if not found
 */
export const getTaskDetail = (taskKey: string): TaskDetails | undefined => {
  try {
    if (!taskKey) return undefined;
    return TypedTaskLibrary[taskKey] as TaskDetails | undefined;
  } catch (error) {
    console.error(`Error fetching task detail for ${taskKey}:`, error);
    return undefined;
  }
};

/**
 * Gets a specific intensity detail from a task
 * @param taskKey The key of the task
 * @param intensityKey The key of the intensity
 * @returns The intensity duration or undefined if not found
 */
export const getIntensityDuration = (taskKey: string, intensityKey: string): string | undefined => {
  try {
    if (!taskKey || !intensityKey) return undefined;
    
    const taskDetail = TypedTaskLibrary[taskKey] as TaskDetails | undefined;
    return taskDetail?.intensities?.[intensityKey]?.duration;
  } catch (error) {
    console.error(`Error fetching intensity ${intensityKey} for task ${taskKey}:`, error);
    return undefined;
  }
};

/**
 * Formats a task name with its intensity for display
 * @param taskKey The key of the task in TaskLibrary
 * @param intensityKey The key of the intensity in TaskLibrary
 * @returns A formatted display string or null if details not found
 */
export const formatTaskWithIntensity = (taskKey: string, intensityKey: string): string | null => {
  try {
    if (!taskKey || !intensityKey) return null;
    
    const taskDetail = getTaskDetail(taskKey);
    const intensityDuration = getIntensityDuration(taskKey, intensityKey);
    
    if (!taskDetail || !intensityDuration) return null;
    
    return `${taskDetail.task} (${intensityDuration})`;
  } catch (error) {
    console.error('Error formatting task with intensity:', error);
    return null;
  }
};

/**
 * Determines if a task is valid and has complete information
 * @param taskKey The task key to validate
 * @param intensityKey The intensity key to validate
 * @returns Boolean indicating if the task has valid details
 */
export const isValidTaskSelection = (taskKey: string | null, intensityKey: string | null): boolean => {
  if (!taskKey || !intensityKey) return false;
  
  const taskDetail = getTaskDetail(taskKey);
  const intensityDuration = getIntensityDuration(taskKey, intensityKey);
  
  return !!taskDetail && !!intensityDuration;
};

/**
 * For backwards compatibility
 */
export const determineTaskCategory = getTaskCategory;
export const categoryFromQuestKey = (_key: string): TaskCategory | undefined => undefined;
export const extractCategoryFromTask = getTaskCategory; 