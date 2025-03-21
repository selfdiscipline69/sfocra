import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define task interface
interface TaskItem {
  text: string;
  image: string | null;
  completed: boolean;
  showImage: boolean;
}

/**
 * Handles task deletion with confirmation and AsyncStorage update
 * 
 * @param index Index of the task to delete
 * @param additionalTasks Array of current tasks
 * @param setAdditionalTasks State setter function for tasks
 * @param userToken User's authentication token
 */

export const handleTaskDeletion = (
  index: number,
  additionalTasks: TaskItem[],
  setAdditionalTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
  userToken: string | null
) => {
  // Show confirmation alert before deleting
  Alert.alert(
    "Delete Task",
    "Are you sure you want to delete this task?",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // Remove task at specified index
            const updatedTasks = [...additionalTasks];
            updatedTasks.splice(index, 1);
            setAdditionalTasks(updatedTasks);
            
            // Save to AsyncStorage with await to ensure it completes
            if (userToken) {
              await AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks));
              console.log('Tasks saved after deletion:', JSON.stringify(updatedTasks));
            }
          } catch (error) {
            console.error('Error deleting task:', error);
            Alert.alert('Error', 'Failed to delete task. Please try again.');
          }
        }
      }
    ]
  );
};