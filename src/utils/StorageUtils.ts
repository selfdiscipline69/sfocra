import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserChoices, AdditionalTask } from '../types/UserTypes';

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
    const choices: UserChoices = {
      question1: null,
      question2: null,
      question3: null,
      question4: null,
    };
    
    for (let i = 1; i <= 4; i++) {
      const questionKey = `question${i}` as keyof UserChoices;
      
      // Try with token-specific key first
      if (userToken) {
        const choiceWithToken = await AsyncStorage.getItem(`question${i}Choice_${userToken}`);
        if (choiceWithToken !== null) {
          choices[questionKey] = choiceWithToken;
          continue;
        }
      }
      
      // Fall back to non-token key
      const choiceWithoutToken = await AsyncStorage.getItem(`question${i}Choice`);
      if (choiceWithoutToken !== null) {
        choices[questionKey] = choiceWithoutToken;
      }
    }
    
    return choices;
  } catch (error) {
    console.error('Error getting user choices:', error);
    return {
      question1: null,
      question2: null,
      question3: null,
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

export const getUserClassKey = async (userToken: string): Promise<string | null> => {
  try {
    // First try to get the new format key
    const newFormatKey = await AsyncStorage.getItem('userClassKey') || 
                         await AsyncStorage.getItem(`userClassKey_${userToken}`);
                         
    // If found, return it
    if (newFormatKey) return newFormatKey;
    
    // Otherwise try to get the old format key
    const oldFormatKey = await AsyncStorage.getItem('userClassKeyOld') || 
                         await AsyncStorage.getItem(`userClassKeyOld_${userToken}`);
                         
    return oldFormatKey;
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

export const saveWeeklyTrial = async (trial: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('weeklyTrial', trial);
  } catch (error) {
    console.error('Error saving weekly trial:', error);
  }
};

// Save and load challenge progress
export const saveChallengeProgress = async (
  userToken: string,
  progress: { week: number; day: number }
) => {
  try {
    const key = `@challenge_progress_${userToken}`;
    await AsyncStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving challenge progress:', error);
  }
};

export const getChallengeProgress = async (userToken: string) => {
  try {
    const key = `@challenge_progress_${userToken}`;
    const progressData = await AsyncStorage.getItem(key);
    
    if (progressData) {
      return JSON.parse(progressData);
    }
    
    // Default to week 1, day 1
    return { week: 1, day: 1 };
  } catch (error) {
    console.error('Error getting challenge progress:', error);
    return { week: 1, day: 1 };
  }
};

// Save last refresh timestamps
export const saveLastRefreshTimestamps = async (userToken: string, timestamps: {
  daily?: number;
  weekly?: number;
}) => {
  try {
    const key = `@refresh_timestamps_${userToken}`;
    const currentData = await AsyncStorage.getItem(key);
    let data = {};
    
    if (currentData) {
      data = JSON.parse(currentData);
    }
    
    // Update with new timestamps
    const updatedData = { ...data, ...timestamps };
    await AsyncStorage.setItem(key, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving refresh timestamps:', error);
  }
};

export const getLastRefreshTimestamps = async (userToken: string) => {
  try {
    const key = `@refresh_timestamps_${userToken}`;
    const data = await AsyncStorage.getItem(key);
    
    if (data) {
      return JSON.parse(data);
    }
    
    // Default to epoch time (will trigger immediate refresh)
    return { daily: 0, weekly: 0 };
  } catch (error) {
    console.error('Error getting refresh timestamps:', error);
    return { daily: 0, weekly: 0 };
  }
};

// Check if refresh is needed based on date
export const shouldRefreshDaily = async (userToken: string) => {
  const timestamps = await getLastRefreshTimestamps(userToken);
  const lastDaily = timestamps.daily || 0;
  
  // Get current date at midnight
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  // Get date of last refresh at midnight
  const lastDate = new Date(lastDaily);
  const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime();
  
  // Refresh if it's a new day
  return today > lastDay;
};

export const shouldRefreshWeekly = async (userToken: string) => {
  const timestamps = await getLastRefreshTimestamps(userToken);
  const lastWeekly = timestamps.weekly || 0;
  
  // Get current date
  const now = new Date();
  
  // Get date of last refresh
  const lastDate = new Date(lastWeekly);
  
  // Check if it's been 7 or more days since last refresh
  const dayDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return dayDiff >= 7;
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

// Function to calculate account age in days
export const getAccountAge = async (userToken: string): Promise<number> => {
  try {
    // Try to get account creation date
    const creationDateStr = await AsyncStorage.getItem(`@account_creation_date_${userToken}`);
    
    if (creationDateStr) {
      const creationDate = new Date(parseInt(creationDateStr, 10));
      const today = new Date();
      
      // Calculate days difference
      const diffTime = Math.abs(today.getTime() - creationDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } else {
      // If creation date not found, set it now and return 1
      await AsyncStorage.setItem(
        `@account_creation_date_${userToken}`, 
        Date.now().toString()
      );
      return 1;
    }
  } catch (error) {
    console.error('Error calculating account age:', error);
    return 1;
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
  saveWeeklyTrial,
  saveChallengeProgress,
  getChallengeProgress,
  saveLastRefreshTimestamps,
  getLastRefreshTimestamps,
  shouldRefreshDaily,
  shouldRefreshWeekly,
  saveCompletedTasks,
  getCompletedTasks,
  saveDailyTasksWithStatus,
  getDailyTasksWithStatus,
  saveTaskCompletionRecord,
  getTaskCompletionRecords,
  getAccountAge,
  
  // Add this new function to load user task status
  loadUserTaskStatus: async (userToken: string) => {
    try {
      const taskData = await getDailyTasksWithStatus(userToken);
      return taskData || [];
    } catch (error) {
      console.error('Error loading user task status:', error);
      return [];
    }
  }
};
