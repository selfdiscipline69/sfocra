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
    return await AsyncStorage.getItem('userClassKey') || 
           await AsyncStorage.getItem(`userClassKey_${userToken}`);
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
