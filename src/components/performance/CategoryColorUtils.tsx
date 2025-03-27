/**
 * Utility functions for handling category colors consistently across the app
 */

/**
 * Get standard color for a task category
 * @param category The category name (case-insensitive)
 * @returns Hex color code for the category
 */
export const getCategoryColor = (category: string): string => {
  switch(category.toLowerCase()) {
    case 'fitness': return '#FF5252';
    case 'learning': return '#4CAF50';
    case 'knowledge': return '#4CAF50'; // Map to same as learning
    case 'mindfulness': return '#2196F3';
    case 'social': return '#FFC107';
    case 'creativity': return '#9C27B0';
    default: return '#607D8B'; // Default gray
  }
};

/**
 * Get color based on completion percentage
 * @param completed Number of completed items
 * @param total Total number of items
 * @returns Hex color code representing completion level
 */
export const getCompletionColor = (completed: number, total: number): string => {
  if (total === 0) return '#607D8B'; // Default gray if no tasks
  
  const percentage = (completed / total) * 100;
  
  switch(true) {
    case percentage >= 80: return '#4CAF50'; // Green for 80%+
    case percentage >= 50: return '#FFC107'; // Yellow for 50-80%
    case percentage < 50: return '#FF5252'; // Red for under 50%
    default: return '#607D8B'; // Default gray
  }
};

/**
 * List of all available categories
 */
export const CATEGORIES = [
  'Fitness',
  'Learning',
  'Mindfulness',
  'Social',
  'Creativity',
  'General'
]; 