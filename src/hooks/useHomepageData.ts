import { useState, useEffect, useCallback } from 'react';
import { UserChoices, AdditionalTask } from '../types/UserTypes';
import * as storageService from '../utils/StorageUtils';
import quotesData from '../../assets/Quote.json';
import questsData from '../../assets/Quest.json';
import { Task } from '../components/DailyTaskInput';

// Define interfaces for the new quest structure
interface DayTask {
  dayNumber: number;
  tasks: string[];
}

interface Week {
  weekNumber: number;
  weeklyTrial: string;
  days: DayTask[];
}

interface Challenge {
  id: string;
  path: string;
  intensity: number;
  title: string;
  description: string;
  weeks: Week[];
}

interface QuestData {
  progressiveChallenges: Challenge[];
  taskLibrary: Record<string, any>;
}

// WeeklyTrial type to match our updated component
interface WeeklyTrialData {
  title: string;
  description: string;
  weeklyTrialSummary: string;
}

interface TaskLibraryItem {
  task: string;
  category: string;
  intensities: {
    [key: string]: {
      duration: string;
    }
  }
}

// Helper function to determine task category from task ID with safe access
const getTaskCategory = (taskId: string, taskLibrary: Record<string, TaskLibraryItem> | undefined): string => {
  if (!taskId || !taskLibrary) return 'general';
  
  const task = taskLibrary[taskId];
  return task ? task.category : 'general';
};

// Define a new interface for completed task tracking
interface CompletedTaskData {
  category: string;
  minutes: number;
  timestamp: number;
}

// Add this function to normalize category names
const normalizeCategory = (category: string): string => {
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
      return 'general';
  }
};

export default function useHomepageData() {
  // User data states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [userToken, setUserToken] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userHandle, setUserHandle] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userChoices, setUserChoices] = useState<UserChoices>({
    question1: null,
    question2: null,
    question3: null,
    question4: null,
  });
  
  // Content states - updated weeklyTrial to object type
  const [dailyQuote, setDailyQuote] = useState<string>('');
  const [dailyTasks, setDailyTasks] = useState<Task[]>(['', '']);
  const [dailyTaskIds, setDailyTaskIds] = useState<string[]>(['', '']);
  const [weeklyTrial, setWeeklyTrial] = useState<WeeklyTrialData | null>(null);
  const [additionalTasks, setAdditionalTasks] = useState<AdditionalTask[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [currentDay, setCurrentDay] = useState<number>(1);

  // Add new state for completed tasks
  const [completedTasks, setCompletedTasks] = useState<CompletedTaskData[]>([]);

  // Load user data from storage - use useCallback to ensure stable function reference
  const loadUserData = useCallback(async () => {
    const userData = await storageService.getUserData();
    setEmail(userData.email);
    setPassword(userData.password);
    setUserToken(userData.userToken);
    setUserName(userData.userName);
    setUserHandle(userData.userHandle);
    setProfileImage(userData.profileImage);
    
    if (userData.userToken) {
      const choices = await storageService.getUserChoices(userData.userToken);
      setUserChoices(choices);
      
      const additionalTasks = await storageService.getAdditionalTasks(userData.userToken);
      setAdditionalTasks(additionalTasks);
      
      // Load tasks with status
      const tasksWithStatus = await storageService.getDailyTasksWithStatus(userData.userToken);
      if (tasksWithStatus && tasksWithStatus.length > 0) {
        setDailyTasks(tasksWithStatus);
      }
      
      // Load saved progress
      const savedProgress = await storageService.getChallengeProgress(userData.userToken);
      if (savedProgress) {
        setCurrentWeek(savedProgress.week);
        setCurrentDay(savedProgress.day);
      }

      // Load completed tasks data
      const savedCompletedTasks = await storageService.getCompletedTasks(userData.userToken);
      if (savedCompletedTasks) {
        setCompletedTasks(savedCompletedTasks);
      }
    }
  }, []);

  // Load quests and quotes with time checks
  const loadQuestsAndQuotes = useCallback(async (forceRefresh = false) => {
    try {
      // Check if we need to refresh based on date
      const shouldRefreshDailyTasks = forceRefresh || await storageService.shouldRefreshDaily(userToken);
      const shouldRefreshWeeklyTrial = forceRefresh || await storageService.shouldRefreshWeekly(userToken);
      
      // First, load the existing tasks with status from storage
      const existingTasksWithStatus = await storageService.getDailyTasksWithStatus(userToken);
      const tasksMap = new Map();
      
      // Create a map of existing tasks by text for quick lookup when preserving status
      if (existingTasksWithStatus && existingTasksWithStatus.length > 0) {
        existingTasksWithStatus.forEach(task => {
          if (typeof task === 'object' && task.text) {
            tasksMap.set(task.text, task.status);
          }
        });
      }
      
      if (!shouldRefreshDailyTasks && !shouldRefreshWeeklyTrial) {
        console.log("No refresh needed based on timestamps");
        // If no refresh needed, make sure we still load the existing tasks with status
        if (existingTasksWithStatus && existingTasksWithStatus.length > 0) {
          setDailyTasks(existingTasksWithStatus);
        }
        return;
      }
      
      // Type guard for Quest data
      // Add safety check for questsData
      if (!questsData || typeof questsData !== 'object') {
        console.error('Quest data is not available or not in the expected format');
        handleLoadError(true);
        return;
      }
      
      // Safely cast questsData
      const typedQuestData = questsData as unknown as QuestData;
      
      // Verify required structure exists
      if (!typedQuestData.progressiveChallenges || !Array.isArray(typedQuestData.progressiveChallenges) || 
          !typedQuestData.taskLibrary || typeof typedQuestData.taskLibrary !== 'object') {
        console.error('Quest data is missing required structure', typedQuestData);
        handleLoadError(true);
        return;
      }
      
      const classKey = await storageService.getUserClassKey(userToken);
      
      if (!classKey) {
        setDailyTasks([
          "No user class information found",
          "Please complete the classification process"
        ]);
        setDailyTaskIds(['', '']);
        
        if (shouldRefreshWeeklyTrial) {
          setWeeklyTrial({
            title: "No user class information",
            description: "Please complete the classification process",
            weeklyTrialSummary: ""
          });
          await storageService.saveWeeklyTrial(JSON.stringify({
            title: "No user class information",
            description: "Please complete the classification process",
            weeklyTrialSummary: ""
          }));
        }
        return;
      }
      
      // Parse the class key to get path code and intensity
      // Format should be like: "1-3" (path code 1, intensity 3)
      const parts = classKey.split('-');
      if (parts.length < 2) {
        console.error('Invalid class key format:', classKey);
        handleLoadError(true);
        return;
      }
      
      const [pathCode, intensityStr] = parts;
      const intensity = parseInt(intensityStr, 10);
      
      if (isNaN(intensity)) {
        console.error('Invalid intensity in class key:', classKey);
        handleLoadError(true);
        return;
      }
      
      // Get all challenges matching this path code and intensity
      const matchingChallenges = typedQuestData.progressiveChallenges.filter(
        challenge => challenge.id && challenge.id.startsWith(`${pathCode}-${intensity}`)
      );
      
      if (matchingChallenges.length === 0) {
        // No matching challenges
        console.warn(`No challenges found for ${pathCode}-${intensity}`);
        setWeeklyTrial({
          title: "No challenge available",
          description: "No challenge matching your profile was found",
          weeklyTrialSummary: "Please try a different profile"
        });
        setCurrentChallenge(null);
        setDailyTasks(["No matching challenges for your profile", "Please try a different profile"]);
        setDailyTaskIds(['', '']);
        
        if (shouldRefreshWeeklyTrial) {
          await storageService.saveWeeklyTrial(JSON.stringify({
            title: "No challenge available",
            description: "No challenge matching your profile was found",
            weeklyTrialSummary: "Please try a different profile"
          }));
        }
        return;
      }
      
      // Randomly select one of the matching challenges or use the previously selected one
      let selectedChallenge = currentChallenge;
      
      // If we don't have a challenge yet, or if we're refreshing, select a new one
      if (!selectedChallenge || forceRefresh) {
        const randomIndex = Math.floor(Math.random() * matchingChallenges.length);
        selectedChallenge = matchingChallenges[randomIndex];
        setCurrentChallenge(selectedChallenge);
      }
      
      // Safety check for selected challenge
      if (!selectedChallenge || !selectedChallenge.weeks || !Array.isArray(selectedChallenge.weeks) || 
          selectedChallenge.weeks.length === 0) {
        console.error('Selected challenge has no weeks data');
        handleLoadError(true);
        return;
      }
      
      // Get the current week and day data
      const weekIndex = Math.min(currentWeek - 1, selectedChallenge.weeks.length - 1);
      const selectedWeek = selectedChallenge.weeks[weekIndex];
      
      if (!selectedWeek || !selectedWeek.days || !Array.isArray(selectedWeek.days) || 
          selectedWeek.days.length === 0) {
        console.error('Selected week has no days data');
        handleLoadError(true);
        return;
      }
      
      // Get the day data
      const dayIndex = Math.min(currentDay - 1, selectedWeek.days.length - 1);
      const selectedDay = selectedWeek.days[dayIndex];
      
      if (!selectedDay || !selectedDay.tasks || !Array.isArray(selectedDay.tasks)) {
        console.error('Selected day has no tasks data');
        handleLoadError(true);
        return;
      }
      
      // Set weekly trial data
      const weeklyTrialData: WeeklyTrialData = {
        title: selectedChallenge.title || "Challenge",
        description: selectedChallenge.description || "No description available",
        weeklyTrialSummary: selectedWeek.weeklyTrial || "No weekly trial summary available"
      };
      
      setWeeklyTrial(weeklyTrialData);
      await storageService.saveWeeklyTrial(JSON.stringify(weeklyTrialData));
      
      // Set daily tasks from the selected day
      const tasks = selectedDay.tasks;
      
      // In case there are more than 2 tasks, trim to just the first 2
      const taskIds = tasks.slice(0, 2);
      if (taskIds.length === 0) {
        // No tasks found
        setDailyTasks(["No tasks for this day", "Please check back tomorrow"]);
        setDailyTaskIds(['', '']);
        return;
      }
      
      // Format task text with duration from the task library
      const taskLibrary = typedQuestData.taskLibrary;
      const formattedTasks = taskIds.map(taskId => {
        // Ensure taskId is a string and exists in the library
        if (!taskId || typeof taskId !== 'string' || !taskLibrary[taskId]) {
          console.warn(`Task not found in library: ${taskId}`);
          return `Unknown task: ${taskId}`;
        }
        
        const taskInfo = taskLibrary[taskId];
        if (!taskInfo) return `Unknown task: ${taskId}`;
        
        // Get the duration directly from the task - no intensity levels to check
        const duration = taskInfo.duration;
        
        if (!duration) {
          console.warn(`No duration found for task ${taskId}`);
          return `${taskInfo.task} (Duration not found)`;
        }
        
        return `${taskInfo.task} (${duration})`;
      });
      
      // Transform formatted tasks to Task objects (string or {text, status})
      const tasksWithPreservedStatus = formattedTasks.map(taskText => {
        // Check if this task text exists in our loaded tasks and has a non-default status
        const existingStatus = tasksMap.get(taskText);
        
        if (existingStatus && ['completed', 'canceled'].includes(existingStatus)) {
          // Preserve the existing status
          return { text: taskText, status: existingStatus };
        }
        
        // Otherwise use the task as a plain string (default status)
        return taskText;
      });
      
      setDailyTasks(tasksWithPreservedStatus);
      setDailyTaskIds(taskIds);
      
      // Save tasks with preserved status
      await storageService.saveDailyTasksWithStatus(userToken, tasksWithPreservedStatus.map(task => {
        if (typeof task === 'string') {
          return { text: task, status: 'default' };
        }
        return task;
      }));
      
      // Handle daily quote
      if (quotesData && Array.isArray(quotesData) && quotesData.length > 0) {
        const randomIndex = Math.floor(Math.random() * quotesData.length);
        const randomQuote = quotesData[randomIndex];
        
        if (randomQuote && randomQuote.quote) {
          setDailyQuote(randomQuote.quote);
        } else {
          setDailyQuote("Quote not available");
        }
      } else {
        setDailyQuote("The unexamined life is not worth living - Socrates");
      }
      
      // Update the timestamps after successful refresh
      const now = new Date().getTime();
      const timestamps: {daily?: number, weekly?: number} = {};
      
      if (shouldRefreshDailyTasks) {
        timestamps.daily = now;
      }
      
      if (shouldRefreshWeeklyTrial) {
        timestamps.weekly = now;
      }
      
      await storageService.saveLastRefreshTimestamps(userToken, timestamps);
      
    } catch (error) {
      console.error('Error loading quests and quotes:', error);
      handleLoadError(true); // Refresh all on error
    }
  }, [userToken, currentChallenge, currentWeek, currentDay]);

  // Handle error state
  const handleLoadError = (refreshWeeklyTrial: boolean) => {
      if (refreshWeeklyTrial) {
      setWeeklyTrial({
        title: "Error loading challenge",
        description: "There was a problem loading your weekly challenge",
        weeklyTrialSummary: "Please try again later"
      });
      }
      
      setDailyTasks([
        "Error loading daily task 1",
        "Error loading daily task 2"
      ]);
    setDailyTaskIds(['', '']);
      
      setDailyQuote("Error loading daily quote");
  };
  
  // Get task categories based on task IDs
  const getTaskCategories = useCallback(() => {
    if (!questsData || !dailyTaskIds || !Array.isArray(dailyTaskIds)) {
      return ['undefined', 'undefined'];
    }
    
    try {
      const typedQuestData = questsData as unknown as QuestData;
      // Guard against undefined task library
      if (!typedQuestData || !typedQuestData.taskLibrary) {
        return dailyTaskIds.map(() => undefined);
      }
      
      const taskLibrary = typedQuestData.taskLibrary;
      
      return dailyTaskIds.map(taskId => {
        if (!taskId) return undefined;
        const category = getTaskCategory(taskId, taskLibrary);
        
        // Convert category names to expected component props
        switch (category) {
          case 'physical': return 'fitness';
          case 'mindfulness': return 'mindfulness';
          case 'learning': return 'learning';
          case 'social': return 'social'; 
          case 'creativity': return 'creativity';
          default: return undefined;
        }
      });
    } catch (error) {
      console.error('Error getting task categories:', error);
      return dailyTaskIds.map(() => undefined);
    }
  }, [dailyTaskIds]);

  // Update task handlers - use useCallback
  const handleTaskChange = useCallback((index: number, newTask: string) => {
    setDailyTasks(prevTasks => {
      const updatedTasks = [...prevTasks];
      
      // If the current task is an object with status, update only the text
      if (typeof updatedTasks[index] === 'object') {
        (updatedTasks[index] as any).text = newTask;
      } else {
        // Otherwise, replace the string
        updatedTasks[index] = newTask;
      }
      
      // Use StorageUtils instead of direct AsyncStorage
      if (userToken) {
        storageService.saveDailyTasksWithStatus(userToken, updatedTasks);
      }
      
      return updatedTasks;
    });
  }, [userToken]);

  const handleQuoteChange = useCallback((newQuote: string) => {
    setDailyQuote(newQuote);
  }, []);

  const handleAdditionalTaskChange = useCallback((index: number, newText: string) => {
    setAdditionalTasks(prevTasks => {
      const updatedTasks = [...prevTasks];
      if (updatedTasks[index]) {
        updatedTasks[index] = {...updatedTasks[index], text: newText};
        
        // Store the updated tasks with proper closure handling
        if (userToken) {
          storageService.saveAdditionalTasks(userToken, updatedTasks);
        }
        return updatedTasks;
      }
      return prevTasks;
    });
  }, [userToken]);

  // Add a dedicated function to set additional tasks
  const updateAdditionalTasks = useCallback((tasks: AdditionalTask[]) => {
    setAdditionalTasks(tasks);
    
    // Store the updated tasks
    if (userToken) {
      storageService.saveAdditionalTasks(userToken, tasks);
    }
  }, [userToken]);

  // Create a stable refreshData function
  const refreshData = useCallback(() => {
    loadUserData();
    loadQuestsAndQuotes(true); // Force refresh regardless of timestamps
  }, [loadUserData, loadQuestsAndQuotes]);

  // Load data on initial mount
  useEffect(() => {
    loadUserData();
    loadQuestsAndQuotes();
  }, [loadUserData, loadQuestsAndQuotes]);

  // Update the addCompletedTask function
  const addCompletedTask = useCallback(async (
    task: string, 
    category: string, 
    duration: number, 
    isDaily: boolean
  ) => {
    try {
      // Normalize the category
      const taskCategory = normalizeCategory(category);
      
      // Extract duration from task string if not provided (format: "Task name (30)")
      let taskDuration = duration;
      if (!taskDuration) {
        const durationMatch = task.match(/\((\d+)\)/);
        taskDuration = durationMatch ? parseInt(durationMatch[1], 10) : 30; // Default to 30 min
      }
      
      // Get account age
      const accountAge = await storageService.getAccountAge(userToken);
      
      // Create task completion record
      const record = {
        day: accountAge,
        task_name: task.split('(')[0].trim(), // Extract just the task name without duration
        category: taskCategory.toLowerCase(),
        duration: taskDuration,
        is_daily: isDaily ? 1 : 0,
        completed_at: Date.now()
      };
      
      // Save the record
      const savedRecord = await storageService.saveTaskCompletionRecord(userToken, record);
      
      // Also maintain the existing completedTasks for backward compatibility
      const newCompletedTask: CompletedTaskData = {
        category: taskCategory.toLowerCase(),
        minutes: taskDuration,
        timestamp: Date.now()
      };
      
      const updatedTasks = [...completedTasks, newCompletedTask];
      setCompletedTasks(updatedTasks);
      
      // Save to storage using the old format too
      if (userToken) {
        await storageService.saveCompletedTasks(userToken, updatedTasks);
      }
      
      return savedRecord;
    } catch (error) {
      console.error('Error adding completed task:', error);
      return null;
    }
  }, [completedTasks, userToken]);

  // Add a function to explicitly set daily tasks with status
  const setDailyTasksWithStatus = useCallback((tasks: Task[]) => {
    setDailyTasks(tasks);
    
    // Save tasks including their status to storage
    if (userToken) {
      // We need to store both text and status
      const tasksForStorage = tasks.map(task => {
        if (typeof task === 'string') {
          return { text: task, status: 'default' };
        }
        return task;
      });
      
      // Store the tasks with status
      storageService.saveDailyTasksWithStatus(userToken, tasksForStorage);
    }
  }, [userToken]);

  // Add a function to update task status
  const updateTaskStatus = useCallback((index: number, status: 'completed' | 'canceled') => {
    setDailyTasks(prevTasks => {
      const updatedTasks = [...prevTasks];
      
      // Get the task text, regardless of current format
      const taskText = typeof updatedTasks[index] === 'string'
        ? updatedTasks[index] as string
        : (updatedTasks[index] as any).text;
      
      // Update to new format with status
      updatedTasks[index] = {
        text: taskText,
        status: status
      };
      
      // Save the updated tasks with status
      if (userToken) {
        const tasksForStorage = updatedTasks.map(task => {
          if (typeof task === 'string') {
            return { text: task, status: 'default' };
          }
          return task;
        });
        storageService.saveDailyTasksWithStatus(userToken, tasksForStorage);
      }
      
      return updatedTasks;
    });
  }, [userToken]);

  // Return stable object references
  const userData = {
    email,
    password,
    userToken,
    userName,
    userHandle,
    profileImage,
    userChoices,
  };

  const content = {
    dailyQuote,
    dailyTasks,
    dailyTaskIds,
    weeklyTrial,
    additionalTasks,
    currentChallenge,
    currentWeek,
    currentDay,
    completedTasks,
  };

  const actions = {
    loadUserData,
    loadQuestsAndQuotes,
    handleTaskChange,
    handleQuoteChange,
    handleAdditionalTaskChange,
    setAdditionalTasks: updateAdditionalTasks,
    refreshData,
    getTaskCategories,
    addCompletedTask,
    setCompletedTasks,
    setDailyTasks: setDailyTasksWithStatus,
    updateTaskStatus,
  };

  return { userData, content, actions };
}
