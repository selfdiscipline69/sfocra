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
