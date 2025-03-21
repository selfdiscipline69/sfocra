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
    if (customTask.trim() === '') {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }
    
    const duration = parseInt(customTaskDuration) || 30;
    // Include time in the formatted task if provided
    const timeInfo = customTaskTime.trim() ? ` at ${customTaskTime}` : '';
    const formattedQuest = `${customTask}${timeInfo} (${duration} min) - ${customTaskCategory}`;
    const newTask: TaskItem = {
      text: formattedQuest,
      image: null,
      completed: false,
      showImage: false
    };
    
    const updatedTasks = [...additionalTasks, newTask];
    setAdditionalTasks(updatedTasks);
    
    // Save with await to ensure completion
    if (userToken) {
      await AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks));
      console.log('Tasks saved after adding custom task:', JSON.stringify(updatedTasks));
    }
    
    setModalVisible(false);
  } catch (error) {
    console.error('Error adding custom task:', error);
  }
};