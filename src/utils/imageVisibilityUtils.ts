import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskItem, WeeklyTrialItem } from '../types/TaskTypes';

/**
 * Toggle image visibility for a specific task in additional tasks array
 */
export const toggleImageVisibility = async (
  userToken: string,
  index: number,
  tasks: TaskItem[],
  setState: (tasks: TaskItem[]) => void
): Promise<void> => {
  try {
    // Create new array with toggled showImage property
    const updatedTasks = [...tasks];
    if (updatedTasks[index] && typeof updatedTasks[index].showImage !== 'undefined') {
      updatedTasks[index] = {
        ...updatedTasks[index],
        showImage: !updatedTasks[index].showImage
      };
      
      // Update state
      setState(updatedTasks);
      
      // Save to AsyncStorage
      if (userToken) {
        await AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks));
      }
    }
  } catch (error) {
    console.error('Error toggling image visibility:', error);
  }
};

/**
 * Toggle weekly trial task image visibility 
 */
export const toggleWeeklyTaskImageVisibility = async (
  userToken: string,
  tasks: WeeklyTrialItem[],
  setState: (tasks: WeeklyTrialItem[]) => void
): Promise<void> => {
  try {
    // There's only one weekly trial task
    if (tasks.length > 0 && typeof tasks[0].showImage !== 'undefined') {
      const updatedTasks = [...tasks];
      updatedTasks[0] = {
        ...updatedTasks[0],
        showImage: !updatedTasks[0].showImage
      };
      
      // Update state
      setState(updatedTasks);
      
      // Save to AsyncStorage
      if (userToken) {
        await AsyncStorage.setItem(`weeklyTrialTasks_${userToken}`, JSON.stringify(updatedTasks));
      }
    }
  } catch (error) {
    console.error('Error toggling weekly task image visibility:', error);
  }
};