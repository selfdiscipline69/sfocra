import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTaskCategory } from './taskCategoryUtils';
import { themes } from '../context/ThemeContext';
import { AdditionalTask } from '../types/UserTypes';

// Function to get category color
const getCategoryColor = (category: string): string => {
  switch(category.toLowerCase()) {
    case 'fitness': 
    case 'physical': 
      return themes.light.categoryColors.fitness;
    case 'learning':
    case 'knowledge':
      return themes.light.categoryColors.learning;
    case 'mindfulness': 
      return themes.light.categoryColors.mindfulness;
    case 'social': 
      return themes.light.categoryColors.social;
    case 'creativity': 
      return themes.light.categoryColors.creativity;
    default: 
      return '#607D8B';  // Blue Grey (General)
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
  additionalTasks: AdditionalTask[];
  setAdditionalTasks: (tasks: AdditionalTask[]) => void;
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
      taskText += ` (${customTaskDuration} minutes)`;
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
    
    switch(lowerCaseCategory) {
      case 'fitness':
      case 'physical':
        category = 'fitness';
        break;
      case 'knowledge':
      case 'learning':
        category = 'learning';
        break;
      case 'mindfulness':
        category = 'mindfulness';
        break;
      case 'social':
        category = 'social';
        break;
      case 'creativity':
        category = 'creativity';
        break;
      default:
        // If no known category, try to determine from task text
        category = getTaskCategory(taskText);
    }
    
    // Create new task object as AdditionalTask with a unique ID
    const newTask: AdditionalTask = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: taskText,
      image: null,
      completed: false,
      showImage: false,
      category,
      color: getCategoryColor(category || 'general')
    };
    
    // Create updated tasks array
    const updatedTasks = [...additionalTasks, newTask];
    
    // Update state
    setAdditionalTasks(updatedTasks);
    
    // Save to AsyncStorage if we have a user token
    if (userToken) {
      await AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks));
    }
    
    // Close the modal
    setModalVisible(false);
    
    Alert.alert('Success', 'Task added successfully!', [{ text: 'OK' }]);
  } catch (error) {
    console.error('Error adding custom task:', error);
    Alert.alert('Error', 'Failed to add task. Please try again.');
  }
};