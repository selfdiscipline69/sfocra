import { useState, useEffect, useCallback, useRef } from 'react';
import { UserChoices, AdditionalTask } from '../types/UserTypes';
import * as storageService from '../utils/StorageUtils';
import quotesData from '../../assets/Quote.json';
import questsData from '../../assets/Quest.json';
import { Task } from '../components/DailyTaskInput';
import { useFocusEffect } from '@react-navigation/native';
import { loadUserTaskStatus } from '../utils/StorageUtils';

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

// Add type for the structured quote
interface QuoteData {
  quoteText: string;
  author: string;
  origin: string | null;
  authorImageKey: string;
}

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
    question4: null,
  });
  
  // Content states - updated weeklyTrial to object type
  const [dailyQuote, setDailyQuote] = useState<QuoteData | null>(null);
  const [dailyTasks, setDailyTasks] = useState<Task[]>(['', '']);
  const [dailyTaskIds, setDailyTaskIds] = useState<string[]>(['', '']);
  const [weeklyTrial, setWeeklyTrial] = useState<WeeklyTrialData | null>(null);
  const [additionalTasks, setAdditionalTasks] = useState<AdditionalTask[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [accountAge, setAccountAge] = useState<number>(1);

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
      const token = userData.userToken;
      const choices = await storageService.getUserChoices(token);
      setUserChoices(choices);
      
      const addTasks = await storageService.getAdditionalTasks(token);
      setAdditionalTasks(addTasks);
      
      // Load tasks with status
      const tasksWithStatus: Task[] | null = await storageService.getDailyTasksWithStatus(token);
      if (tasksWithStatus && tasksWithStatus.length > 0) {
        setDailyTasks(tasksWithStatus);
      } else {
        setDailyTasks(['', '']);
        setDailyTaskIds(['', '']);
      }
      
      // Load account age
      const age = await storageService.getAccountAge(token);
      console.log("Loaded Account Age:", age); // Log loaded age
      setAccountAge(age);

      // Load completed tasks data
      const savedCompletedTasks = await storageService.getCompletedTasks(token);
      if (savedCompletedTasks) {
        setCompletedTasks(savedCompletedTasks);
      }
    } else {
      setUserChoices({ question1: null, question2: null, question4: null });
      setAdditionalTasks([]);
      setDailyTasks(['', '']);
      setDailyTaskIds(['', '']);
      setWeeklyTrial(null);
      setCurrentChallenge(null);
      setAccountAge(1);
      setCompletedTasks([]);
      setDailyQuote(null);
    }
  }, []);

  // Load quests based on account age and user class
  const loadQuests = useCallback(async () => {
    if (!userToken) {
      console.log("Load Quests: No user token, skipping.");
      setDailyTasks(["Login required", ""]);
      setDailyTaskIds(['', '']);
      setWeeklyTrial(null);
      setCurrentChallenge(null);
      return;
    }

    try {
      console.log(`Load Quests: Starting for user ${userToken}, Account Age: ${accountAge}`);

      // Load existing task statuses to preserve them
      const existingTasksWithStatus: Task[] | null = await storageService.getDailyTasksWithStatus(userToken);
      const tasksMap = new Map<string, 'default' | 'completed' | 'canceled'>();
      if (existingTasksWithStatus) {
        existingTasksWithStatus.forEach((task: Task) => {
          if (typeof task === 'object' && task.text && task.status) {
            tasksMap.set(task.text, task.status);
          }
        });
      }

      // Type guard for Quest data
      if (!questsData || typeof questsData !== 'object') {
        console.error('Quest data is not available or not in the expected format');
        handleLoadError(true);
        return;
      }
      
      const typedQuestData = questsData as unknown as QuestData;
      
      if (!typedQuestData.progressiveChallenges || !typedQuestData.taskLibrary) {
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
        
        if (weeklyTrial) {
          setWeeklyTrial({
            title: "No user class information",
            description: "Please complete the classification process",
            weeklyTrialSummary: ""
          });
        }
        return;
      }
      
      // Handle both old and new format class keys
      let pathCode: string;
      let intensity: number;

      if (classKey.includes('-epic-') || classKey.includes('-beginner-')) {
        // New format: "path-difficulty-consequence" (e.g. "1-epic-consequence")
        const parts = classKey.split('-');
        pathCode = parts[0];
        
        // Map difficulty to numeric intensity
        const difficulty = parts[1];
        intensity = difficulty === 'epic' ? 4 : 2; // Map 'epic' to 4, 'beginner' to 2
      } else {
        // Old format: "path-intensity-tracking-consequence" (e.g. "1-3-2-1")
        const parts = classKey.split('-');
        pathCode = parts[0];
        intensity = parseInt(parts[1], 10);
        
        if (isNaN(intensity)) {
          console.error('Invalid intensity in class key:', classKey);
          handleLoadError(true);
          return;
        }
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
        
        if (weeklyTrial) {
          await storageService.saveWeeklyTrial(userToken, JSON.stringify(weeklyTrial));
        }
        return;
      }
      
      // Randomly select one of the matching challenges or use the previously selected one
      let selectedChallenge = currentChallenge;
      
      // If we don't have a challenge yet, or if we're refreshing, select a new one
      if (!selectedChallenge) {
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
      
      // Calculate current week number and day number within the week
      const currentWeekNum = Math.floor((accountAge - 1) / 7) + 1;
      const currentDayInWeek = (accountAge - 1) % 7 + 1;
      console.log(`Load Quests: Calculated Week: ${currentWeekNum}, Day in Week: ${currentDayInWeek}`);

      // Get the correct week data (handle cases where challenge might not have enough weeks)
      const weekIndex = Math.min(currentWeekNum - 1, selectedChallenge.weeks.length - 1);
      const selectedWeek = selectedChallenge.weeks[weekIndex];
      
      if (!selectedWeek || !selectedWeek.days || !Array.isArray(selectedWeek.days) || 
          selectedWeek.days.length === 0) {
        console.error('Selected week has no days data');
        handleLoadError(true);
        return;
      }
      
      // Get the day data
      const dayIndex = Math.min(currentDayInWeek - 1, selectedWeek.days.length - 1);
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
      await storageService.saveWeeklyTrial(userToken, JSON.stringify(weeklyTrialData));
      
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
      
      // Handle daily quote using the new structure
      if (quotesData && Array.isArray(quotesData) && quotesData.length > 0) {
        const randomIndex = Math.floor(Math.random() * quotesData.length);
        // Cast the selected item to the new QuoteData interface
        const randomQuote: QuoteData = quotesData[randomIndex] as QuoteData; 
        
        // Check if the selected quote has the expected structure
        if (randomQuote && randomQuote.quoteText) {
          // Set dailyQuote state with only the quote text
          setDailyQuote(randomQuote); 
        } else {
          console.warn("Selected quote data is missing 'quoteText':", randomQuote);
          setDailyQuote({ quoteText: "Quote not available", author: "System", origin: null, authorImageKey: "" });
        }
      } else {
        console.warn("quotesData is not available or empty.");
        // Provide a default quote text
        setDailyQuote({ quoteText: "The unexamined life is not worth living", author: "Socrates", origin: "Apology", authorImageKey: "socrates" });
      }
      
    } catch (error) {
      console.error('Error loading quests:', error);
      handleLoadError(true); // Refresh all on error
    }
  }, [userToken, accountAge, currentChallenge]);

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
      
      setDailyQuote(null);
  };
  
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
    dailyQuote: dailyQuote?.quoteText ?? "Loading quote...",
    dailyQuoteAuthor: dailyQuote?.author ?? "",
    dailyQuoteOrigin: dailyQuote?.origin, // Expose origin
    dailyTasks,
    dailyTaskIds,
    weeklyTrial,
    additionalTasks,
    currentChallenge,
    completedTasks,
    accountAge, // Expose current age
  };
  
  // Get task categories - ensure we're getting both from the task library and from AsyncStorage
  const getTaskCategories = useCallback((): Array<'mindfulness' | 'learning' | 'creativity' | 'social' | 'fitness' | undefined | string> => {
    try {
      // If we don't have any tasks, return an empty array
      if (!dailyTasks || !Array.isArray(dailyTasks)) return [];
      
      // Process each daily task to find its category
      const taskCategories = dailyTasks.map((task, index) => {
        // For string-only tasks, we need to check if we have categories in dailyTaskIds 
        if (typeof task === 'string') {
          // Try to find a matching task ID
          const taskId = dailyTaskIds && dailyTaskIds[index];
          if (taskId) {
            // Convert from task library generic categories to our specific ones
            const category = getTaskCategory(taskId, questsData?.taskLibrary as any);
            switch (category) {
              case 'physical': return 'fitness';
              case 'mindfulness': return 'mindfulness';
              case 'learning': return 'learning';
              case 'social': return 'social'; 
              case 'creativity': return 'creativity';
              default: return undefined;
            }
          }
        } else {
          // For object tasks, check if they have a category property
          const taskObj = task as any; // Use any temporarily to access potential category
          if (taskObj.category) {
            return taskObj.category;
          }
        }
        
        // Default to undefined if no category found
        return undefined;
      });
      
      // Filter out undefined values
      return taskCategories.filter(cat => cat !== undefined) as Array<'mindfulness' | 'learning' | 'creativity' | 'social' | 'fitness' | string>;
    } catch (error) {
      console.error('Error getting task categories:', error);
      return [];
    }
  }, [dailyTasks, dailyTaskIds]);

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
    setDailyQuote(null);
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

  // Refresh data function - Reloads user data which includes age, triggering quest reload
  const isRefreshingData = useRef(false);
  
  const refreshData = useCallback(async () => {
    // Prevent concurrent refreshes
    if (isRefreshingData.current) {
      console.log("Refresh already in progress, skipping");
      return;
    }
    
    try {
      isRefreshingData.current = true;
      console.log("Manual Refresh Triggered");
      await loadUserData();
    } finally {
      // Always reset the flag, even if an error occurs
      isRefreshingData.current = false;
    }
  }, [loadUserData]);

  // Function to increase account age (by adjusting creation date)
  const increaseAccountAge = useCallback(async () => {
    if (!userToken) return;
    console.log("DEV: Attempting to increase account age...");
    const success = await storageService.increaseAccountCreationDay(userToken);
    if (success) {
      await loadUserData(); // Reload user data to get new age and trigger quest update
    }
  }, [userToken, loadUserData]);

  // Function to decrease account age (by adjusting creation date)
  const decreaseAccountAge = useCallback(async () => {
    if (!userToken) return;
    console.log("DEV: Attempting to decrease account age...");
    const success = await storageService.decreaseAccountCreationDay(userToken);
    if (success) {
      await loadUserData(); // Reload user data to get new age and trigger quest update
    }
  }, [userToken, loadUserData]);

  // Load initial user data on mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Load quests whenever accountAge or userToken changes (after initial loadUserData)
   useEffect(() => {
     if (userToken && accountAge > 0) { // Ensure we have token and age
       loadQuests();
     }
   }, [accountAge, userToken, loadQuests]); // Add loadQuests

  // Load quote - Separate from quest loading
  const loadQuote = useCallback(() => {
       console.log("Load Quote: Loading new quote.");
       if (quotesData && Array.isArray(quotesData) && quotesData.length > 0) {
           const randomIndex = Math.floor(Math.random() * quotesData.length);
           const randomQuote: QuoteData = quotesData[randomIndex] as QuoteData;
           if (randomQuote && randomQuote.quoteText) {
               setDailyQuote(randomQuote); // Store the full quote object
           } else {
               console.warn("Selected quote data is invalid:", randomQuote);
               setDailyQuote({ quoteText: "Quote not available", author: "System", origin: null, authorImageKey: "" });
           }
       } else {
           console.warn("quotesData is not available or empty.");
           setDailyQuote({ quoteText: "The unexamined life is not worth living", author: "Socrates", origin: "Apology", authorImageKey: "socrates" });
       }
  }, []); // No dependencies, loads randomly each time called

  // Load quote and potentially quests on focus
  useFocusEffect(
    useCallback(() => {
      console.log("Homepage Focused");
      loadQuote(); // Load a new quote every time the screen is focused

      // Optionally force-reload quests on focus, although the useEffect above handles changes
      // If you want quests to *always* reload on focus (e.g., to catch background updates):
      // if (userToken && accountAge > 0) {
      //    console.log("Focus: Reloading quests");
      //    loadQuests();
      // }

      // Reload task status from storage in case it was updated elsewhere?
      // This might conflict with the status preservation in loadQuests. Be careful.
      // const reloadStatus = async () => {
      //    if(userToken) {
      //       const tasks = await loadUserTaskStatus(userToken);
      //       if (tasks && tasks.length > 0) {
      //          setDailyTasks(tasks);
      //       }
      //    }
      // }
      // reloadStatus();

      return () => {
        // Optional cleanup logic when screen loses focus
      };
    }, [loadQuote, userToken, accountAge, loadQuests]) // Add dependencies
  );

  // Update the addCompletedTask function
  const addCompletedTask = useCallback(async (
    task: string,
    category: string,
    duration: number,
    isDaily: boolean
  ) => {
    if (!userToken) return null; // Need user token

    try {
      // Normalize the category
      const taskCategory = normalizeCategory(category);

      // Extract duration from task string if not provided
      let taskDuration = duration;
      if (!taskDuration || isNaN(taskDuration)) {
        const durationMatch = task.match(/\((\d+)\s*m/); // Match digits followed by 'm' (minutes)
        taskDuration = durationMatch ? parseInt(durationMatch[1], 10) : 30; // Default 30
      }

      // Get account age directly from state
      const currentAccountAge = accountAge;

      // Create task completion record
      const record = {
        day: currentAccountAge,
        task_name: task.split('(')[0].trim(),
        category: taskCategory.toLowerCase(),
        duration: taskDuration,
        is_daily: isDaily ? 1 : 0,
        completed_at: Date.now()
      };

      // Save the record using the new structure
      const savedRecord = await storageService.saveTaskCompletionRecord(userToken, record);
      console.log("Saved task completion record:", savedRecord);

      // Maintain the old completedTasks structure for compatibility if needed
      const newCompletedTask: CompletedTaskData = {
        category: taskCategory.toLowerCase(),
        minutes: taskDuration,
        timestamp: Date.now()
      };
      const updatedLegacyTasks = [...completedTasks, newCompletedTask];
      setCompletedTasks(updatedLegacyTasks);
      await storageService.saveCompletedTasks(userToken, updatedLegacyTasks); // Save legacy structure

      return savedRecord;
    } catch (error) {
      console.error('Error adding completed task:', error);
      return null;
    }
  }, [userToken, accountAge, completedTasks]); // Depend on accountAge from state

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

  const actions = {
    loadUserData,
    loadQuests,
    handleAdditionalTaskChange,
    setAdditionalTasks: updateAdditionalTasks,
    refreshData,
    getTaskCategories,
    addCompletedTask,
    setCompletedTasks,
    setDailyTasks: setDailyTasksWithStatus,
    updateTaskStatus,
    increaseAccountAge, // Added action
    decreaseAccountAge, // Added action
  };

  return { userData, content, actions };
}
