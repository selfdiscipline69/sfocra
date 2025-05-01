import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the WeeklyTrialData interface
export interface WeeklyTrialData {
  title: string;
  description: string;
  weeklyTrialSummary: string;
}

export const saveWeeklyTrial = async (userToken: string, trialData: WeeklyTrialData): Promise<void> => {
  try {
    if (!userToken) {
      console.warn('Cannot save weekly trial: No user token provided');
      return;
    }
    // Save the whole object as JSON string
    await AsyncStorage.setItem(`weeklyTrial_${userToken}`, JSON.stringify(trialData));
  } catch (error) {
    console.error('Error saving weekly trial:', error);
  }
};

export const getWeeklyTrial = async (userToken: string): Promise<WeeklyTrialData | null> => {
  if (!userToken) return null;
  try {
    const trialDataJSON = await AsyncStorage.getItem(`weeklyTrial_${userToken}`);
    if (trialDataJSON) {
      const parsedData = JSON.parse(trialDataJSON);
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