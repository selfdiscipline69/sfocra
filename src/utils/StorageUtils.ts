import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserChoices, AdditionalTask } from '../types/UserTypes';

// Add the WeeklyTrialData interface
interface WeeklyTrialData {
  title: string;
  description: string;
  weeklyTrialSummary: string;
}

// Define Task type matching the component (including potential ID)
export type Task = { // Ensure Task is always an object now
  id?: string;
  text: string;
  status: 'default' | 'completed' | 'canceled';
  category?: string;
};


// Interface for the state to be saved
interface DailyTasksState {
    tasks: Task[];
    accountAge: number;
}

// Add this function to normalize category names
export const normalizeCategory = (category: string): string => {
  const lowerCategory = (category || '').toLowerCase();

  // Map variations to standard categories
  if (lowerCategory.includes('knowledge')) return 'learning';
  if (lowerCategory.includes('physical')) return 'fitness';

  // Return standard categories directly
  switch (lowerCategory) {
    case 'fitness':
    case 'learning':
    case 'mindfulness':
    case 'social':
    case 'creativity':
      return lowerCategory;
    default:
      return 'general'; // Default for 'general' or unknown
  }
};


// User data related storage
export const getUserData = async () => {
  try {
    const email = await AsyncStorage.getItem('userEmail');
    const password = await AsyncStorage.getItem('userPassword');
    const userToken = await AsyncStorage.getItem('userToken');
    const fullName = await AsyncStorage.getItem('userFullName');
    const username = await AsyncStorage.getItem('userUsername');
    const profileImage = userToken ? await AsyncStorage.getItem(`profileImage_${userToken}`) : null;

    return {
      email: email || '',
      password: password || '',
      userToken: userToken || '',
      userName: fullName || '',
      userHandle: username || '',
      profileImage
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return {
      email: '',
      password: '',
      userToken: '',
      userName: '',
      userHandle: '',
      profileImage: null
    };
  }
};

// User choices storage
export const getUserChoices = async (userToken: string): Promise<UserChoices> => {
  try {
    // Initialize with null values according to the updated UserChoices type
    const choices: UserChoices = {
      question1: null,
      question2: null,
      question4: null,
    };

    // Define the keys based on the current questions
    const questionKeys: (keyof UserChoices)[] = ['question1', 'question2', 'question4'];
    const questionNumbers = [1, 2, 4]; // Corresponding question numbers

    for (let i = 0; i < questionKeys.length; i++) {
      const questionKey = questionKeys[i];
      const questionNum = questionNumbers[i];

      // Try with token-specific key first
      if (userToken) {
        const choiceWithToken = await AsyncStorage.getItem(`question${questionNum}Choice_${userToken}`);
        if (choiceWithToken !== null) {
          choices[questionKey] = choiceWithToken;
          continue; // Move to next question key
        }
      }

      // Fall back to non-token key
      const choiceWithoutToken = await AsyncStorage.getItem(`question${questionNum}Choice`);
      if (choiceWithoutToken !== null) {
        choices[questionKey] = choiceWithoutToken;
      }
    }

    return choices;
  } catch (error) {
    console.error('Error getting user choices:', error);
    // Return structure matching the updated UserChoices type
    return {
      question1: null,
      question2: null,
      question4: null,
    };
  }
};

// Tasks related storage
export const getAdditionalTasks = async (userToken: string): Promise<AdditionalTask[]> => {
  try {
    if (!userToken) return [];

    const savedTasks = await AsyncStorage.getItem(`additionalTasks_${userToken}`);

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // Add validation to ensure tasks match AdditionalTask structure
      if (Array.isArray(parsedTasks)) {
         return parsedTasks.filter((task): task is AdditionalTask =>
             task && typeof task === 'object' &&
             typeof task.id === 'string' &&
             typeof task.text === 'string' && task.text.trim() !== '' &&
             typeof task.completed === 'boolean' &&
             typeof task.showImage === 'boolean'
             // Add other necessary checks for AdditionalTask fields
         );
      }
    }

    return [];
  } catch (error) {
    console.error('Error getting additional tasks:', error);
    return [];
  }
};

export const saveAdditionalTasks = async (userToken: string, tasks: AdditionalTask[]): Promise<void> => {
  try {
    if (userToken) {
      await AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(tasks));
    }
  } catch (error) {
    console.error('Error saving additional tasks:', error);
  }
};

export const getUserClassKey = async (userToken: string | null): Promise<string | null> => {
  try {
    let newFormatKey: string | null = null;
    let oldFormatKey: string | null = null;

    if (userToken) {
      // Prioritize token-specific keys
      newFormatKey = await AsyncStorage.getItem(`userClassKey_${userToken}`);
      oldFormatKey = await AsyncStorage.getItem(`userClassKeyOld_${userToken}`);
    }

    // Fallback to general keys if token-specific are not found or token is null
    if (!newFormatKey) {
      newFormatKey = await AsyncStorage.getItem('userClassKey');
    }
    if (!oldFormatKey) {
      oldFormatKey = await AsyncStorage.getItem('userClassKeyOld');
    }

    // Return new format key if available, otherwise fall back to old format key
    return newFormatKey || oldFormatKey;

  } catch (error) {
    console.error('Error getting user class key:', error);
    return null;
  }
};

// Removed saveDailyTasks as it's replaced by saving the state object

export const saveWeeklyTrial = async (userToken: string, trial: string): Promise<void> => {
  try {
    if (!userToken) {
      console.warn('Cannot save weekly trial: No user token provided');
      return;
    }

    await AsyncStorage.setItem(`weeklyTrial_${userToken}`, trial);
  } catch (error) {
    console.error('Error saving weekly trial:', error);
  }
};

// Save completed tasks (legacy structure for charts, separate from completion records)
export const saveCompletedTasks = async (userToken: string, tasks: any[]) => {
  try {
    await AsyncStorage.setItem(`@completed_tasks_${userToken}`, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Error saving completed tasks:', error);
    return false;
  }
};

// Get completed tasks (legacy structure for charts)
export const getCompletedTasks = async (userToken: string) => {
  try {
    const records = await getTaskCompletionRecords(userToken);

    // Convert records to the format expected by the chart
    return records.map(record => ({
      category: record.category,
      count: 1, // Each record represents one completed task
      minutes: record.duration, // Map duration to minutes
      timestamp: record.completed_at
    }));
  } catch (error) {
    console.error('Error getting completed tasks:', error);
    return [];
  }
};


// --- New functions for saving/getting daily task state ---
export const saveDailyTasksState = async (userToken: string, state: DailyTasksState): Promise<void> => {
  try {
    // Ensure tasks are always saved as objects with status and required fields
    const tasksToSave = state.tasks.filter(task => // Filter out any invalid entries before saving
        typeof task === 'object' && task !== null && typeof task.text === 'string' && typeof task.status === 'string'
    ).map(task => ({ // Ensure default values if needed, although they should come from loadQuests
         id: task.id,
         text: task.text,
         status: task.status,
         category: task.category || 'general' // Ensure category exists
    }));


    const stateToSave = { ...state, tasks: tasksToSave };
    await AsyncStorage.setItem(`@dailyTasksState_${userToken}`, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving daily tasks state:', error);
  }
};

export const getDailyTasksState = async (userToken: string): Promise<DailyTasksState | null> => {
  try {
    const stateJSON = await AsyncStorage.getItem(`@dailyTasksState_${userToken}`);
    if (stateJSON) {
      const state = JSON.parse(stateJSON) as DailyTasksState;
      // Basic validation
      if (state && typeof state.accountAge === 'number' && Array.isArray(state.tasks)) {
          // Further validation: ensure tasks are objects with required fields
          const validTasks = state.tasks.every(task =>
              typeof task === 'object' && task !== null &&
              typeof task.text === 'string' &&
              typeof task.status === 'string' &&
              (typeof task.id === 'string' || typeof task.id === 'undefined') && // id is optional string
              (typeof task.category === 'string' || typeof task.category === 'undefined') // category is optional string
          );
          if (validTasks) {
             return state;
          } else {
              console.warn("Invalid task structure found in saved DailyTasksState. Discarding.", state.tasks);
              await AsyncStorage.removeItem(`@dailyTasksState_${userToken}`); // Remove invalid state
              return null;
          }
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting daily tasks state:', error);
    return null;
  }
};
// --- End new functions ---


// Define the task completion record interface
export interface TaskCompletionRecord {
  id: number;         // Sequential ID
  day: number;        // Account age / day number
  task_name: string;  // Task name
  category: string;   // Category
  duration: number;   // Duration in minutes
  is_daily: number;   // 1 for daily task, 0 for additional task
  completed_at: number; // Timestamp when completed
}

// Function to save a task completion record
export const saveTaskCompletionRecord = async (
  userToken: string,
  record: Omit<TaskCompletionRecord, 'id'> // Omit ID as we'll generate it
): Promise<TaskCompletionRecord | null> => {
  if (!userToken) {
     console.error("Cannot save completion record: No user token.");
     return null;
  }
  if (record.day <= 0) {
      console.error("Cannot save completion record: Invalid day (accountAge).", record.day);
      return null;
  }

  try {
    // Get existing records
    const existingRecords = await getTaskCompletionRecords(userToken);

    // Generate new ID (increment from the last record or start at 1)
    const newId = existingRecords.length > 0
      ? Math.max(0, ...existingRecords.map(r => r.id || 0)) + 1 // Ensure IDs are numbers, default to 0 if missing
      : 1;

    // Create complete record with ID
    const completeRecord: TaskCompletionRecord = {
      id: newId,
      ...record
    };

    // Add to existing records
    const updatedRecords = [...existingRecords, completeRecord];

    // Save to AsyncStorage
    await AsyncStorage.setItem(
      `@task_completion_records_${userToken}`,
      JSON.stringify(updatedRecords)
    );

    return completeRecord;
  } catch (error) {
    console.error('Error saving task completion record:', error);
    return null;
  }
};

// Function to get all task completion records
export const getTaskCompletionRecords = async (
  userToken: string
): Promise<TaskCompletionRecord[]> => {
  if (!userToken) return []; // Return empty if no token
  try {
    const recordsJSON = await AsyncStorage.getItem(`@task_completion_records_${userToken}`);
    const records = recordsJSON ? JSON.parse(recordsJSON) : [];
    // Validate structure
    if (Array.isArray(records)) {
        return records.filter((r): r is TaskCompletionRecord =>
            r && typeof r === 'object' &&
            typeof r.id === 'number' &&
            typeof r.day === 'number' &&
            typeof r.task_name === 'string' &&
            typeof r.category === 'string' &&
            typeof r.duration === 'number' &&
            typeof r.is_daily === 'number' &&
            typeof r.completed_at === 'number'
        );
    }
    return [];
  } catch (error) {
    console.error('Error getting task completion records:', error);
    return [];
  }
};

// Function to calculate account age in days and save creation date if missing
export const getAccountAge = async (userToken: string): Promise<number> => {
   if (!userToken) return 1; // Default age if no token
  try {
    const creationDateKey = `@account_creation_date_${userToken}`;
    let creationDateStr = await AsyncStorage.getItem(creationDateKey);
    let creationTimestamp: number;

    if (creationDateStr && !isNaN(parseInt(creationDateStr, 10))) {
      creationTimestamp = parseInt(creationDateStr, 10);
    } else {
      // If creation date not found or invalid, set it to the beginning of today and save
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      creationTimestamp = startOfToday.getTime();
      await AsyncStorage.setItem(creationDateKey, creationTimestamp.toString());
      console.log("Account creation date not found/invalid, set to:", startOfToday.toISOString());
      return 1; // First day
    }

    const creationDate = new Date(creationTimestamp);
    const today = new Date();
    const startOfTodayTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const startOfCreationDayTimestamp = new Date(creationDate.getFullYear(), creationDate.getMonth(), creationDate.getDate()).getTime();

    // Check if creation date is in the future (possible due to adjustments/errors)
    if (startOfCreationDayTimestamp > startOfTodayTimestamp) {
        console.warn("Creation date is in the future. Resetting to today.");
        creationTimestamp = startOfTodayTimestamp;
        await AsyncStorage.setItem(creationDateKey, creationTimestamp.toString());
        return 1;
    }

    // Calculate days difference based on the start of each day
    const diffTime = startOfTodayTimestamp - startOfCreationDayTimestamp;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 because day 1 is the first day

    return Math.max(1, diffDays); // Ensure minimum age is 1

  } catch (error) {
    console.error('Error calculating account age:', error);
    // Fallback: Try to set creation date now and return 1
    try {
        const creationDateKey = `@account_creation_date_${userToken}`;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        await AsyncStorage.setItem(creationDateKey, startOfToday.getTime().toString());
        return 1;
    } catch (saveError) {
        console.error('Error saving fallback creation date:', saveError);
        return 1; // Ultimate fallback
    }
  }
};

// Fix the getWeeklyTrial function to use the added interface
export const getWeeklyTrial = async (userToken: string): Promise<WeeklyTrialData | null> => {
  if (!userToken) return null;
  try {
    const trialData = await AsyncStorage.getItem(`weeklyTrial_${userToken}`);
    if (trialData) {
      const parsedData = JSON.parse(trialData);
      if (parsedData && typeof parsedData.title === 'string' && typeof parsedData.description === 'string' && typeof parsedData.weeklyTrialSummary === 'string') {
          return parsedData as WeeklyTrialData;
      } else {
          console.warn("Stored weekly trial data is invalid:", parsedData);
          await AsyncStorage.removeItem(`weeklyTrial_${userToken}`);
          return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting weekly trial:', error);
    return null;
  }
};


const getCreationDateKey = (userToken: string) => `@account_creation_date_${userToken}`;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Function to adjust the creation date earlier (increase age)
export const increaseAccountCreationDay = async (userToken: string): Promise<boolean> => {
  if (!userToken) return false;
  try {
    const key = getCreationDateKey(userToken);
    const creationDateStr = await AsyncStorage.getItem(key);
    if (!creationDateStr) {
      console.warn("Cannot increase age: Creation date not found.");
      // Attempt to set creation date to yesterday to make age 2
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday.getTime() - DAY_IN_MS);
      await AsyncStorage.setItem(key, startOfYesterday.getTime().toString());
      console.log("DEV: Set creation date to yesterday.");
      return true;
    }
    const currentTimestamp = parseInt(creationDateStr, 10);
    if (isNaN(currentTimestamp)) {
        console.error("Cannot increase age: Invalid creation timestamp."); return false;
    }
    const newTimestamp = currentTimestamp - DAY_IN_MS;
    await AsyncStorage.setItem(key, newTimestamp.toString());
    console.log("DEV: Adjusted creation date earlier to:", new Date(newTimestamp).toISOString());
    return true;
  } catch (error) {
    console.error("Error increasing account age:", error);
    return false;
  }
};

// Function to adjust the creation date later (decrease age)
export const decreaseAccountCreationDay = async (userToken: string): Promise<boolean> => {
   if (!userToken) return false;
  try {
    const key = getCreationDateKey(userToken);
    const creationDateStr = await AsyncStorage.getItem(key);
    if (!creationDateStr) {
      console.warn("Cannot decrease age: Creation date not found.");
       // Cannot decrease age if it doesn't exist (or is implicitly 1)
      return false;
    }

    const currentTimestamp = parseInt(creationDateStr, 10);
     if (isNaN(currentTimestamp)) {
        console.error("Cannot decrease age: Invalid creation timestamp."); return false;
    }
    const newTimestamp = currentTimestamp + DAY_IN_MS;

    // Prevent setting creation date to today or in the future
    const now = new Date();
    const startOfTodayTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (newTimestamp >= startOfTodayTimestamp) {
      console.warn("Cannot decrease age below 1.");
      // Set it *to* yesterday to ensure age becomes 1 if it wasn't already
       const startOfYesterdayTimestamp = startOfTodayTimestamp - DAY_IN_MS;
       if (currentTimestamp < startOfYesterdayTimestamp) {
           await AsyncStorage.setItem(key, startOfYesterdayTimestamp.toString());
           console.log("DEV: Adjusted creation date to yesterday (minimum age 1).");
           return true;
       }
      return false;
    }

    await AsyncStorage.setItem(key, newTimestamp.toString());
    console.log("DEV: Adjusted creation date later to:", new Date(newTimestamp).toISOString());
    return true;
  } catch (error) {
    console.error("Error decreasing account age:", error);
    return false;
  }
};

// Function to update a task's duration in completion records
export const updateTaskDuration = async (
  userToken: string,
  taskId: number, // Record ID
  newDuration: number
): Promise<boolean> => {
   if (!userToken || typeof taskId !== 'number' || typeof newDuration !== 'number' || newDuration < 0) return false;
  try {
    const records = await getTaskCompletionRecords(userToken);
    const taskIndex = records.findIndex(record => record.id === taskId);
    if (taskIndex === -1) { console.error(`Completion record ID ${taskId} not found`); return false; }

    records[taskIndex].duration = newDuration;

    await AsyncStorage.setItem(`@task_completion_records_${userToken}`, JSON.stringify(records));
    return true;
  } catch (error) {
    console.error('Error updating task duration:', error);
    return false;
  }
};

// Function to remove a task completion record
export const removeTaskCompletionRecord = async (
  userToken: string,
  taskId: number // Record ID
): Promise<TaskCompletionRecord | null> => {
  if (!userToken || typeof taskId !== 'number') return null;
  try {
    const records = await getTaskCompletionRecords(userToken);
    const taskIndex = records.findIndex(record => record.id === taskId);
    if (taskIndex === -1) { console.error(`Completion record ID ${taskId} not found`); return null; }

    const removedTask = records[taskIndex];
    const updatedRecords = [...records.slice(0, taskIndex), ...records.slice(taskIndex + 1)];

    await AsyncStorage.setItem(`@task_completion_records_${userToken}`, JSON.stringify(updatedRecords));
    return removedTask;
  } catch (error) {
    console.error('Error removing task completion record:', error);
    return null;
  }
};

// Create and export a storageService object with all the functions
export const storageService = {
  getUserData,
  getUserChoices,
  getAdditionalTasks,
  saveAdditionalTasks,
  getUserClassKey,
  saveCompletedTasks, // Legacy for charts
  getCompletedTasks,  // Legacy for charts
  saveDailyTasksState,
  getDailyTasksState,
  saveTaskCompletionRecord,
  getTaskCompletionRecords,
  getAccountAge,
  getWeeklyTrial,
  saveWeeklyTrial,
  increaseAccountCreationDay,
  decreaseAccountCreationDay,
  updateTaskDuration,
  removeTaskCompletionRecord,
  normalizeCategory, // Export normalizeCategory
};
