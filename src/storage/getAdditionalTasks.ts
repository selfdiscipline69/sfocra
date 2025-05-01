import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdditionalTask } from '../types/UserTypes';
// Note: saveAdditionalTasks is commented out in the original migration helper,
// so it's not imported here. If you uncomment that logic, you'll need to import it.
// import { saveAdditionalTasks } from './saveAdditionalTasks'; // Or wherever it ends up

// --- Helper function for migrating old task formats to the new AdditionalTask format ---
// This function takes a raw object loaded from storage and converts/validates it.
const migrateToAdditionalTask = (task: any): AdditionalTask | null => {
    if (!task || typeof task !== 'object' || !task.id || typeof task.text !== 'string') {
      // Basic validation failed, discard this task
      console.warn("Discarding invalid task during migration:", task);
      return null;
    }
  
    // Start building the new task object, providing defaults for new fields
    const newTask: AdditionalTask = {
      // --- Fields from old AdditionalTask ---
      id: task.id,
      text: task.text, // Keep legacy text field for now
      image: task.image || null,
      completed: typeof task.completed === 'boolean' ? task.completed : false, // Legacy status
      showImage: typeof task.showImage === 'boolean' ? task.showImage : false,
      is_daily: false, // Explicitly false for additional tasks
      color: task.color, // Keep color if it exists
  
      // --- Map/Default fields from TaskData ---
      // Attempt basic parsing of text to taskName and intensity (can be improved)
      taskName: task.taskName || task.text.split('(')[0].trim() || 'Untitled Task', // Default taskName
      intensity: task.intensity || (task.text.includes('(') ? task.text.substring(task.text.indexOf('(')) : 'Default Intensity'), // Default intensity
      
      // Use existing category or default to 'general', ensure type safety
      category: ['fitness', 'learning', 'mindfulness', 'social', 'creativity'].includes(task.category?.toLowerCase()) 
                ? task.category 
                : (task.category || 'general'), // Provide default category
  
      XP: typeof task.XP === 'number' ? task.XP : 250, // Default XP for additional tasks
      is_Recurrent: typeof task.is_Recurrent === 'boolean' ? task.is_Recurrent : false, // Default recurrence
      // Default recurrence frequency (all days off)
      Recurrent_frequency: Array.isArray(task.Recurrent_frequency) && task.Recurrent_frequency.length === 7 
                           ? task.Recurrent_frequency 
                           : [0, 0, 0, 0, 0, 0, 0], 
      start_time: typeof task.start_time === 'string' ? task.start_time : '00:00', // Default start time
      note: typeof task.note === 'string' ? task.note : '', // Default note
      // Map legacy 'completed' to new 'status' field
      status: task.status || (task.completed ? 'completed' : 'default'), 
      
      // Keep optional fields if they exist
      completed_at: task.completed_at,
      day: task.day,
      taskKey: task.taskKey,
      intensityKey: task.intensityKey,
    };
  
    return newTask;
  };

// Tasks related storage
export const getAdditionalTasks = async (userToken: string): Promise<AdditionalTask[]> => {
  try {
    if (!userToken) return [];

    const savedTasksJSON = await AsyncStorage.getItem(`additionalTasks_${userToken}`);
    if (!savedTasksJSON) return [];

    const parsedTasks = JSON.parse(savedTasksJSON);
    if (!Array.isArray(parsedTasks)) return [];

    // Migrate each loaded task to the new format and filter out invalid ones
    const migratedTasks = parsedTasks
      .map(migrateToAdditionalTask) // Use the migration helper
      .filter((task): task is AdditionalTask => task !== null); // Filter out nulls (invalid tasks)

    // Optional: If migration happened, save the migrated data back immediately
    // This avoids repeated migration on every load
    // Consider the performance impact of saving on every load vs. migrating only once
    // if (migratedTasks.length !== parsedTasks.length || /* add condition to check if migration actually changed anything */) {
    //   await saveAdditionalTasks(userToken, migratedTasks);
    // }

    return migratedTasks;

  } catch (error) {
    console.error('Error getting/migrating additional tasks:', error);
    return [];
  }
}; 