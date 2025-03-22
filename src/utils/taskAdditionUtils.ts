import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the task interface
interface TaskItem {
  text: string;
  image: string | null;
  completed: boolean;
  showImage: boolean;
}

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
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
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
    
    const newTask = {
      text: taskText,
      image: null,
      completed: false,
      showImage: false
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