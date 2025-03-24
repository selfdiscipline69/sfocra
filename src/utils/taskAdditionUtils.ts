import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTaskCategory } from './taskCategoryUtils';
import { themes } from '../context/ThemeContext';

// Define the task interface
interface TaskItem {
  text: string;
  image: string | null;
  completed: boolean;
  showImage: boolean;
  category?: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity';
  color?: string;
}

/**
 * Get color for a category
 */
const getCategoryColor = (category?: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity'): string => {
  // Use the same colors as defined in ThemeContext
  // We'll use light theme colors for consistency
  switch(category) {
    case 'fitness': return themes.light.categoryColors.fitness;
    case 'learning': return themes.light.categoryColors.learning;
    case 'mindfulness': return themes.light.categoryColors.mindfulness;
    case 'social': return themes.light.categoryColors.social;
    case 'creativity': return themes.light.categoryColors.creativity;
    default: return '#607D8B';  // Blue Grey (General)
  }
};

/**
 * Add a custom task to the additional tasks list
 */
export const addCustomTask = async ({
  customTask,
  customTaskTime,
  customTaskDuration,
  customTaskCategory,
  additionalTasks,
  setAdditionalTasks,
  userToken,
  setModalVisible
}: {
  customTask: string;
  customTaskTime: string;
  customTaskDuration: string;
  customTaskCategory: string;
  additionalTasks: TaskItem[];
  setAdditionalTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  userToken: string;
  setModalVisible: (visible: boolean) => void;
}) => {
  try {
    if (!customTask.trim()) {
      // Handle empty task case
      return;
    }
    
    // Format task with duration and category
    let taskText = customTask;
    
    if (customTaskDuration) {
      taskText += ` (${customTaskDuration})`;
    }
    
    // Add category to the task text
    taskText += ` - ${customTaskCategory}`;
    
    // Add time information if provided
    if (customTaskTime) {
      taskText += ` at ${customTaskTime}`;
    }
    
    // Determine the category for styling
    let category: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity' | undefined;
    
    // Map user-provided category to our system categories
    const lowerCaseCategory = customTaskCategory.toLowerCase();
    if (lowerCaseCategory.includes('fitness') || lowerCaseCategory.includes('exercise') || 
        lowerCaseCategory.includes('workout') || lowerCaseCategory.includes('physical')) {
      category = 'fitness';
    } else if (lowerCaseCategory.includes('learn') || lowerCaseCategory.includes('study') || 
               lowerCaseCategory.includes('education') || lowerCaseCategory.includes('reading')) {
      category = 'learning';
    } else if (lowerCaseCategory.includes('mind') || lowerCaseCategory.includes('mental') || 
               lowerCaseCategory.includes('meditation') || lowerCaseCategory.includes('relaxation')) {
      category = 'mindfulness';
    } else if (lowerCaseCategory.includes('social') || lowerCaseCategory.includes('friend') || 
               lowerCaseCategory.includes('community') || lowerCaseCategory.includes('talk')) {
      category = 'social';
    } else if (lowerCaseCategory.includes('creat') || lowerCaseCategory.includes('art') || 
               lowerCaseCategory.includes('music') || lowerCaseCategory.includes('writing')) {
      category = 'creativity';
    } else {
      // If no match, try to determine from task text
      category = getTaskCategory(taskText);
    }
    
    // Get color for the task based on category
    const color = getCategoryColor(category);
    
    const newTask = {
      text: taskText,
      image: null,
      completed: false,
      showImage: false,
      category,
      color
    };
    
    const updatedTasks = [...additionalTasks, newTask];
    setAdditionalTasks(updatedTasks);
    
    // Save to AsyncStorage if we have a userToken
    if (userToken) {
      await AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks));
    }
    
    setModalVisible(false);
  } catch (error) {
    console.error('Error adding custom task:', error);
  }
};