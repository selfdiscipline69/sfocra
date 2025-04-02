import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserChoices, AdditionalTask } from '../types/UserTypes';

// Add the WeeklyTrialData interface
interface WeeklyTrialData {
  title: string;
  description: string;
  weeklyTrialSummary: string;
}

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
      if (Array.isArray(parsedTasks)) {
        return parsedTasks.filter(task => task && task.text && task.text.trim() !== '');
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

export const saveDailyTasks = async (tasks: string[], userToken?: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('dailyTasks', JSON.stringify(tasks));
    
    if (userToken) {
      const taskObjects = tasks.map(text => ({
        text,
        image: null,
        completed: false,
        showImage: false
      }));
      
      await AsyncStorage.setItem(`dailyTasks_${userToken}`, JSON.stringify(taskObjects));
    }
  } catch (error) {
    console.error('Error saving daily tasks:', error);
  }
};

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

// Save completed tasks
export const saveCompletedTasks = async (userToken: string, tasks: any[]) => {
  try {
    await AsyncStorage.setItem(`@completed_tasks_${userToken}`, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Error saving completed tasks:', error);
    return false;
  }
};

// Get completed tasks
export const getCompletedTasks = async (userToken: string) => {
  try {
    const tasksData = await AsyncStorage.getItem(`@completed_tasks_${userToken}`);
    return tasksData ? JSON.parse(tasksData) : [];
  } catch (error) {
    console.error('Error getting completed tasks:', error);
    return [];
  }
};

// Function to save daily tasks with status
export const saveDailyTasksWithStatus = async (userToken: string, tasks: any[]) => {
  try {
    const tasksJSON = JSON.stringify(tasks);
    await AsyncStorage.setItem(`@dailyTasksWithStatus_${userToken}`, tasksJSON);
    return true;
  } catch (error) {
    console.error('Error saving daily tasks with status:', error);
    return false;
  }
};

// Function to get daily tasks with status
export const getDailyTasksWithStatus = async (userToken: string) => {
  try {
    const tasksJSON = await AsyncStorage.getItem(`@dailyTasksWithStatus_${userToken}`);
    if (tasksJSON) {
      return JSON.parse(tasksJSON);
    }
    return null;
  } catch (error) {
    console.error('Error getting daily tasks with status:', error);
    return null;
  }
};

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
  try {
    // Get existing records
    const existingRecords = await getTaskCompletionRecords(userToken);
    
    // Generate new ID (increment from the last record or start at 1)
    const newId = existingRecords.length > 0 
      ? Math.max(...existingRecords.map(r => r.id)) + 1 
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
  try {
    const records = await AsyncStorage.getItem(`@task_completion_records_${userToken}`);
    return records ? JSON.parse(records) : [];
  } catch (error) {
    console.error('Error getting task completion records:', error);
    return [];
  }
};

// Function to calculate account age in days and save creation date if missing
export const getAccountAge = async (userToken: string): Promise<number> => {
  try {
    const creationDateKey = `@account_creation_date_${userToken}`;
    let creationDateStr = await AsyncStorage.getItem(creationDateKey);
    let creationTimestamp: number;

    if (creationDateStr) {
      creationTimestamp = parseInt(creationDateStr, 10);
    } else {
      // If creation date not found, set it to the beginning of today and save
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      creationTimestamp = startOfToday.getTime();
      await AsyncStorage.setItem(creationDateKey, creationTimestamp.toString());
      console.log("Account creation date not found, set to:", startOfToday.toISOString());
      return 1; // First day
    }

    const creationDate = new Date(creationTimestamp);
    const today = new Date();
    const startOfTodayTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const startOfCreationDayTimestamp = new Date(creationDate.getFullYear(), creationDate.getMonth(), creationDate.getDate()).getTime();


    // Calculate days difference based on the start of each day
    const diffTime = startOfTodayTimestamp - startOfCreationDayTimestamp;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 because day 1 is the first day

    // Ensure minimum age is 1
    return Math.max(1, diffDays);

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
  try {
    const trialData = await AsyncStorage.getItem(`weeklyTrial_${userToken}`);
    if (trialData) {
      return JSON.parse(trialData) as WeeklyTrialData;
    }
    return null;
  } catch (error) {
    console.error('Error getting weekly trial:', error);
    return null;
  }
};

// Add this as a separate export
export const loadUserTaskStatus = async (userToken: string) => {
  try {
    const taskData = await getDailyTasksWithStatus(userToken);
    return taskData || [];
  } catch (error) {
    console.error('Error loading user task status:', error);
    return [];
  }
};

const getCreationDateKey = (userToken: string) => `@account_creation_date_${userToken}`;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Function to adjust the creation date earlier (increase age)
export const increaseAccountCreationDay = async (userToken: string): Promise<boolean> => {
  try {
    const key = getCreationDateKey(userToken);
    const creationDateStr = await AsyncStorage.getItem(key);
    if (!creationDateStr) {
      console.warn("Cannot increase age: Creation date not found.");
      return false;
    }
    const currentTimestamp = parseInt(creationDateStr, 10);
    const newTimestamp = currentTimestamp - DAY_IN_MS; // Move creation date one day earlier
    await AsyncStorage.setItem(key, newTimestamp.toString());
    console.log("DEV: Adjusted creation date earlier to:", new Date(newTimestamp).toISOString());
    return true;
  } catch (error) {
    console.error("Error increasing account age (adjusting creation date earlier):", error);
    return false;
  }
};

// Function to adjust the creation date later (decrease age)
export const decreaseAccountCreationDay = async (userToken: string): Promise<boolean> => {
  try {
    const key = getCreationDateKey(userToken);
    const creationDateStr = await AsyncStorage.getItem(key);
    if (!creationDateStr) {
      console.warn("Cannot decrease age: Creation date not found.");
      return false;
    }

    const currentTimestamp = parseInt(creationDateStr, 10);
    const newTimestamp = currentTimestamp + DAY_IN_MS; // Move creation date one day later

    // Prevent setting creation date to today or in the future
    const now = new Date();
    const startOfTodayTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (newTimestamp >= startOfTodayTimestamp) {
      console.warn("Cannot decrease age below 1. Creation date would be today or later.");
      // Optionally set it *to* yesterday to ensure age becomes 1
       const startOfYesterdayTimestamp = startOfTodayTimestamp - DAY_IN_MS;
       if (currentTimestamp < startOfYesterdayTimestamp) { // Only adjust if not already yesterday
           await AsyncStorage.setItem(key, startOfYesterdayTimestamp.toString());
           console.log("DEV: Adjusted creation date to yesterday (minimum age 1):", new Date(startOfYesterdayTimestamp).toISOString());
           return true;
       }
      return false; // Don't allow decreasing further
    }

    await AsyncStorage.setItem(key, newTimestamp.toString());
    console.log("DEV: Adjusted creation date later to:", new Date(newTimestamp).toISOString());
    return true;
  } catch (error) {
    console.error("Error decreasing account age (adjusting creation date later):", error);
    return false;
  }
};

// Create and export a storageService object with all the functions
export const storageService = {
  getUserData,
  getUserChoices,
  getAdditionalTasks,
  saveAdditionalTasks,
  getUserClassKey,
  saveDailyTasks,
  saveCompletedTasks,
  getCompletedTasks,
  saveDailyTasksWithStatus,
  getDailyTasksWithStatus,
  saveTaskCompletionRecord,
  getTaskCompletionRecords,
  getAccountAge,
  getWeeklyTrial,
  loadUserTaskStatus,
  increaseAccountCreationDay,
  decreaseAccountCreationDay,
};
