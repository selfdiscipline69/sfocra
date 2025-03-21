import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Saves homepage tasks to AsyncStorage for reference in other screens
 * Stores weekly trial and daily tasks with user token prefix
 */
export const saveHomepageTasks = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      // Get weekly trial from homepage
      const weeklyTrialValue = await AsyncStorage.getItem('weeklyTrial');
      if (weeklyTrialValue) {
        await AsyncStorage.setItem(`homepageWeeklyTrial_${token}`, weeklyTrialValue);
      }
      
      // Get daily tasks from homepage
      const dailyTasks = await AsyncStorage.getItem('dailyTasks');
      if (dailyTasks) {
        await AsyncStorage.setItem(`homepageDailyTasks_${token}`, dailyTasks);
      }
    }
  } catch (error) {
    console.error('Error saving homepage tasks:', error);
  }
};