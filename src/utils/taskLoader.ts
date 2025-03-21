import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskItem, WeeklyTrialItem } from '../types/UserTypes'; // Adjust import if needed

/**
 * Loads user tasks from AsyncStorage with fallback to homepage data
 * @returns Object containing loaded task data and user token
 */
export const loadTasksFromStorage = async () => {
  try {
    // Get user token
    const token = await AsyncStorage.getItem('userToken');
    let weeklyTrial: WeeklyTrialItem = {
      text: '',
      image: null,
      completed: false,
      showImage: false
    };
    let tasks: TaskItem[] = [];
    let additionalTasks: TaskItem[] = [];
    
    if (token) {
      // WEEKLY TRIAL HANDLING
      const savedWeeklyTrial = await AsyncStorage.getItem(`weeklyTrial_${token}`);
      
      if (savedWeeklyTrial) {
        // Use saved weekly trial with image
        const parsedTrial = JSON.parse(savedWeeklyTrial);
        if (parsedTrial.text && parsedTrial.text.trim() !== '') {
          weeklyTrial = parsedTrial;
        }
      } else {
        // Try homepage's weekly trial
        const weeklyTrialText = await AsyncStorage.getItem('weeklyTrial');
        if (weeklyTrialText && weeklyTrialText.trim() !== '') {
          weeklyTrial = {
            text: weeklyTrialText,
            image: null,
            completed: false,
            showImage: false
          };
        }
      }

      // DAILY TASKS HANDLING
      const savedDailyTasks = await AsyncStorage.getItem(`dailyTasks_${token}`);
      
      if (savedDailyTasks) {
        const parsedTasks = JSON.parse(savedDailyTasks);
        // Filter out empty tasks
        tasks = Array.isArray(parsedTasks) ? 
          parsedTasks.filter(task => task.text && task.text.trim() !== '') : [];
      } else {
        // Try homepage tasks - convert from strings to task objects if needed
        const dailyTasksStr = await AsyncStorage.getItem('dailyTasks');
        if (dailyTasksStr) {
          try {
            const parsedTasks = JSON.parse(dailyTasksStr);
            // Only create tasks from non-empty strings
            const validTasks: TaskItem[] = [];
            
            if (Array.isArray(parsedTasks)) {
              for (const task of parsedTasks) {
                if (task && task.trim() !== '') {
                  validTasks.push({
                    text: task,
                    image: null,
                    completed: false,
                    showImage: false
                  });
                }
              }
              
              // Also save these converted tasks for future use
              await AsyncStorage.setItem(`dailyTasks_${token}`, JSON.stringify(validTasks));
              tasks = validTasks;
            }
          } catch (e) {
            console.error('Error parsing daily tasks:', e);
          }
        }
      }

      // ADDITIONAL TASKS HANDLING
      const savedAdditionalTasks = await AsyncStorage.getItem(`additionalTasks_${token}`);
      if (savedAdditionalTasks) {
        const parsedAdditionalTasks = JSON.parse(savedAdditionalTasks);
        // Filter out empty tasks
        additionalTasks = Array.isArray(parsedAdditionalTasks) ?
          parsedAdditionalTasks.filter(task => task.text && task.text.trim() !== '') : [];
      }
    }

    return {
      userToken: token || '',
      weeklyTrial,
      tasks,
      additionalTasks
    };
  } catch (error) {
    console.error('Failed to load tasks:', error);
    // Return empty data in case of error
    return {
      userToken: '',
      weeklyTrial: {
        text: '',
        image: null,
        completed: false,
        showImage: false
      },
      tasks: [],
      additionalTasks: []
    };
  }
};