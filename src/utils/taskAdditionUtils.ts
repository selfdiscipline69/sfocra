import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../context/ThemeContext';
import { AdditionalTask } from '../types/UserTypes';
import TaskLibrary from '../../assets/TaskLibrary.json'; // Import task library
import { normalizeCategory } from './StorageUtils'; // Use normalizeCategory from StorageUtils

// Define types for TaskLibrary structure (consistent with other files)
type TaskDetails = {
  task: string;
  category: string;
  intensities: { [key: string]: { duration: string } };
};

type TaskLibraryType = {
  task_category: { [key: string]: string[] };
  [key: string]: TaskDetails | { [key: string]: string[] }; // Index signature for tasks
};

const TypedTaskLibrary = TaskLibrary as TaskLibraryType;

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

// --- Define the new props interface ---
interface AddCustomTaskProps {
  selectedCategory: string; // Now passed directly
  selectedTaskKey: string; // Key for TaskLibrary
  selectedIntensityKey: string; // Key for TaskLibrary intensities
  additionalTasks: AdditionalTask[];
  setAdditionalTasks: (tasks: AdditionalTask[]) => void;
  userToken: string;
  setModalVisible: (visible: boolean) => void;
}

/**
 * Add a custom task (selected from TaskLibrary) to the additional tasks list
 */
export const addCustomTask = async ({
  selectedCategory, // Use new props
  selectedTaskKey,
  selectedIntensityKey,
  additionalTasks,
  setAdditionalTasks,
  userToken,
  setModalVisible
}: AddCustomTaskProps) => { // Use the interface for props
  try {
    // Validate required inputs (keys should not be null/empty here based on UI logic)
    if (!selectedCategory || !selectedTaskKey || !selectedIntensityKey) {
      console.error('Missing required task selection details.');
      Alert.alert('Error', 'Incomplete task selection.');
      return;
    }

    // Fetch details from TaskLibrary using the keys
    const taskDetail = TypedTaskLibrary[selectedTaskKey] as TaskDetails | undefined;
    const intensityDetail = taskDetail?.intensities?.[selectedIntensityKey];

    if (!taskDetail || !intensityDetail) {
      console.error(`Task details not found for key: ${selectedTaskKey}, intensity: ${selectedIntensityKey}`);
      Alert.alert('Error', 'Could not find task details. Please try again.');
      return;
    }

    // Format task text from library data
    const taskName = taskDetail.task;
    const intensityText = intensityDetail.duration;
    const taskText = `${taskName} (${intensityText})`; // e.g., "Meditation (10 minutes)"

    // Determine the category for styling (using the selected category, normalized)
    // Ensure the category type matches AdditionalTask definition
    const normalizedCat = normalizeCategory(selectedCategory);
    const categoryForTask: AdditionalTask['category'] =
        ['fitness', 'learning', 'mindfulness', 'social', 'creativity'].includes(normalizedCat)
        ? normalizedCat as AdditionalTask['category'] // Cast to the specific literal types
        : undefined; // Assign undefined if it's 'general' or other


    // Create new task object as AdditionalTask with a unique ID
    // Add taskKey and intensityKey (assuming they will be added to AdditionalTask type)
    const newTask: AdditionalTask = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: taskText,
      image: null, // Default value for image
      completed: false,
      showImage: false,
      category: categoryForTask,
      color: getCategoryColor(normalizedCat || 'general'),
      // --- Add new fields (assuming UserTypes.ts will be updated) ---
      // taskKey: selectedTaskKey,
      // intensityKey: selectedIntensityKey,
      // -------------------------------------------------------------
    };

    // Create updated tasks array
    const updatedTasks = [...additionalTasks, newTask];

    // Update state
    setAdditionalTasks(updatedTasks);

    // Save the *entire updated list* to AsyncStorage
    if (userToken) {
      try {
          // Using the existing key for the list of additional tasks
          await AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks));
          console.log('Additional tasks saved successfully.');
      } catch (saveError) {
          console.error('Error saving additional tasks to AsyncStorage:', saveError);
          // Decide if you want to alert the user here
      }
    }

    // Close the modal
    setModalVisible(false);

  } catch (error) {
    console.error('Error adding custom task:', error);
    Alert.alert('Error', 'Failed to add task. Please try again.');
  }
};