/**
 * Utility to determine the category of a task based on its content
 */

type TaskCategory = 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity';

// Keywords that indicate which category a task belongs to
const categoryKeywords = {
  fitness: [
    'workout', 'gym', 'run', 'running', 'exercise', 'stretching', 'flexibility', 
    'outdoor cardio', 'cycling', 'hiking', 'swimming', 'walking', 'jogging', 'fitness'
  ],
  learning: [
    'reading', 'book', 'podcast', 'documentary', 'educational', 'tutorial', 
    'skill development', 'language', 'coding', 'math', 'article', 'learning'
  ],
  mindfulness: [
    'meditation', 'journaling', 'self-reflection', 'mindful', 'yoga', 
    'sleep', 'quality sleeping', 'mindfulness'
  ],
  social: [
    'friend', 'talk', 'social', 'community', 'group', 'discover hobby group'
  ],
  creativity: [
    'creative', 'painting', 'writing', 'musical', 'instruments', 'cooking', 'creativity'
  ]
};

/**
 * Determines the category of a task based on its content
 * @param taskText The text content of the task
 * @returns The determined category or undefined if no match
 */
export const determineTaskCategory = (taskText: string): TaskCategory | undefined => {
  const lowercaseText = taskText.toLowerCase();
  
  // Check each category's keywords
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowercaseText.includes(keyword.toLowerCase())) {
        return category as TaskCategory;
      }
    }
  }
  
  // If no category matches, return undefined
  return undefined;
};

/**
 * Maps the key prefix from Quest.json to a category
 * 1-* = mindfulness/mental
 * 2-* = fitness 
 * 3-* = balanced (need to determine based on content)
 */
export const categoryFromQuestKey = (key: string): TaskCategory | undefined => {
  const pathPrefix = key.split('-')[0];
  
  switch (pathPrefix) {
    case '1':
      return 'mindfulness';
    case '2':
      return 'fitness';
    case '3':
      // For balanced path, we need to examine the content
      return undefined;
    default:
      return undefined;
  }
};

/**
 * Category mapper for weekly trial and daily tasks
 * @param text The text content of the task
 * @param key Optional key from quests data (if available)
 */
export const getTaskCategory = (text: string, key?: string): TaskCategory | undefined => {
  // First try with the key if available
  if (key) {
    const keyCategory = categoryFromQuestKey(key);
    if (keyCategory) return keyCategory;
  }
  
  // Otherwise determine from the text content
  return determineTaskCategory(text);
}; 