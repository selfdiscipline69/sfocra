/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from 'react';
import { UserChoices, AdditionalTask } from '../types/UserTypes';
import * as storageService from '../utils/StorageUtils'; // Import all as storageService
// Import specific functions if preferred, e.g.:
// import { storageService, normalizeCategory } from '../utils/StorageUtils';
import quotesData from '../../assets/Quote.json';
import questsData from '../../assets/Quest.json';
import { Task } from '../components/DailyTaskInput'; // Use Task type from component
import { useFocusEffect } from '@react-navigation/native';

// Define interfaces for the new quest structure
interface DayTaskQuest { // Renamed to avoid conflict with component Task type
  dayNumber: number;
  tasks: string[]; // These are task IDs from the library
}

interface WeekQuest { // Renamed
  weekNumber: number;
  weeklyTrial: string;
  days: DayTaskQuest[];
}

interface ChallengeQuest { // Renamed
  id: string;
  path: string;
  intensity: number;
  title: string;
  description: string;
  weeks: WeekQuest[];
}

interface TaskLibraryItem {
  task: string; // The actual task text
  category: string;
  duration?: string;
  intensities?: { [key: string]: { duration: string } };
}

interface QuestData {
  progressiveChallenges: ChallengeQuest[];
  taskLibrary: Record<string, TaskLibraryItem>; // Map Task ID to TaskLibraryItem
}


// WeeklyTrial type to match our updated component
interface WeeklyTrialData {
  title: string;
  description: string;
  weeklyTrialSummary: string;
}


// Helper function to determine task category from task ID with safe access
const getTaskCategoryFromLibrary = (taskId: string, taskLibrary: Record<string, TaskLibraryItem> | undefined): string => {
  if (!taskId || !taskLibrary) return 'general';
  const task = taskLibrary[taskId];
  const category = task ? (task.category || 'general') : 'general';
  return storageService.normalizeCategory(category); // Use normalizeCategory from storage
};


// Define a new interface for completed task tracking (Legacy for charts)
interface CompletedTaskData {
  category: string;
  minutes: number;
  timestamp: number;
}


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
  const [userChoices, setUserChoices] = useState<UserChoices>({ question1: null, question2: null, question4: null });

  // Content states
  const [dailyQuote, setDailyQuote] = useState<QuoteData | null>(null);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]); // Always Task objects
  const [dailyTaskIds, setDailyTaskIds] = useState<string[]>([]); // Store IDs for reference
  const [weeklyTrial, setWeeklyTrial] = useState<WeeklyTrialData | null>(null);
  const [additionalTasks, setAdditionalTasks] = useState<AdditionalTask[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeQuest | null>(null);
  const [accountAge, setAccountAge] = useState<number>(0); // Init to 0

  // Add new state for completed tasks (Legacy for charts)
  const [completedTasks, setCompletedTasks] = useState<CompletedTaskData[]>([]);

  // Load user data from storage
  const loadUserData = useCallback(async () => {
    console.log("loadUserData: Starting");
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
      setAdditionalTasks(addTasks || []);
      const age = await storageService.getAccountAge(token);
      setAccountAge(age); // Set age state, triggers useEffect for loadQuests
      const savedCompletedTasks = await storageService.getCompletedTasks(token);
      setCompletedTasks(savedCompletedTasks || []);
      const savedWeeklyTrial = await storageService.getWeeklyTrial(token);
      setWeeklyTrial(savedWeeklyTrial);
    } else {
      // Reset state if no token
      setUserChoices({ question1: null, question2: null, question4: null });
      setAdditionalTasks([]);
      setDailyTasks([]);
      setDailyTaskIds([]);
      setWeeklyTrial(null);
      setCurrentChallenge(null);
      setAccountAge(0);
      setCompletedTasks([]);
      setDailyQuote(null);
    }
    console.log("loadUserData: Finished. Age:", accountAge); // Log age after setting
  }, [accountAge]); // Include accountAge dependency? Maybe not needed here


  // Load quote - Separate from quest loading
  const loadQuote = useCallback(() => {
       console.log("Load Quote: Loading new quote.");
       // Type guard for quotesData
       const typedQuotesData = quotesData as unknown as QuoteData[];
       if (typedQuotesData && Array.isArray(typedQuotesData) && typedQuotesData.length > 0) {
           const randomIndex = Math.floor(Math.random() * typedQuotesData.length);
           const randomQuote: QuoteData = typedQuotesData[randomIndex];
           if (randomQuote && randomQuote.quoteText) {
               setDailyQuote(randomQuote);
           } else {
               console.warn("Selected quote data is invalid:", randomQuote);
               setDailyQuote({ quoteText: "Quote not available", author: "System", origin: null, authorImageKey: "" });
           }
       } else {
           console.warn("quotesData is not available or empty.");
           setDailyQuote({ quoteText: "The unexamined life is not worth living", author: "Socrates", origin: "Apology", authorImageKey: "socrates" });
       }
  }, []);


  // Handle error state more gracefully
  const handleLoadError = useCallback((errorSource: string, refreshWeeklyTrial: boolean) => {
      console.error(`handleLoadError called from ${errorSource}`);
      if (refreshWeeklyTrial) {
          setWeeklyTrial({
              title: "Error loading challenge",
              description: "There was a problem loading the weekly challenge.",
              weeklyTrialSummary: "Please try refreshing."
          });
      }
      // Set daily tasks to an empty array or a specific error task object
      setDailyTasks([{ id: 'error-loading', text: "Error loading daily tasks.", status: 'default', category: 'general' }]);
      setDailyTaskIds(['error-loading']);

      // Don't clear quote on error
      if (!dailyQuote) loadQuote();
  }, [dailyQuote, loadQuote]); // Dependencies for handleLoadError


  // Load quests based on account age and user class - REFACTORED
  const loadQuests = useCallback(async () => {
    if (!userToken || accountAge <= 0) {
      console.log(`Load Quests: Skipping (token: ${!!userToken}, age: ${accountAge})`);
      setDailyTasks([]);
      setDailyTaskIds([]);
      // Optionally clear weekly trial if dependent on quests?
      // setWeeklyTrial(null);
      // setCurrentChallenge(null);
      return;
    }

    try {
      console.log(`Load Quests: Starting for user ${userToken}, Account Age: ${accountAge}`);

      // 1. Attempt to load saved state for the *current* day using getDailyTasksState
      const savedState = await storageService.getDailyTasksState(userToken);

      if (savedState && savedState.accountAge === accountAge) {
          console.log(`Load Quests: Found saved state for day ${accountAge}. Using tasks.`);
          setDailyTasks(savedState.tasks || []); // Use saved tasks, ensure array
          const loadedTaskIds = (savedState.tasks || []).map(task => task.id || '').filter(Boolean);
          setDailyTaskIds(loadedTaskIds);
          if (!dailyQuote) loadQuote(); // Load quote if missing

          // Re-load weekly trial based on current challenge/age if not persisted separately or needs refresh
          // (logic below finds the challenge/week again if needed)
           if (!weeklyTrial && questsData) { // Add questsData check
               // Replicate logic to find current challenge/week based on age
               const typedQuestData = questsData as QuestData;
               const classKey = await storageService.getUserClassKey(userToken);
               if (classKey && typedQuestData.progressiveChallenges) {
                  // ... (Simplified logic to find challenge and week) ...
                   let pathCode: string, intensity: number;
                   // ... (parse classKey) ...
                    if (classKey.includes('-epic-') || classKey.includes('-beginner-')) {
                        const parts = classKey.split('-'); pathCode = parts[0]; intensity = parts[1] === 'epic' ? 4 : 2;
                    } else {
                        const parts = classKey.split('-'); pathCode = parts[0]; intensity = parseInt(parts[1], 10);
                        if (isNaN(intensity)) { intensity = 2; } // Default intensity
                    }

                   const matchingChallenges = typedQuestData.progressiveChallenges.filter(c => c.id && c.id.startsWith(`${pathCode}-${intensity}`));
                   if (matchingChallenges.length > 0) {
                       const selectedC = currentChallenge && matchingChallenges.some(mc => mc.id === currentChallenge.id)
                           ? currentChallenge
                           : matchingChallenges[0]; // Or random selection
                       if (selectedC && selectedC.weeks) {
                           const currentWeekNum = Math.floor((accountAge - 1) / 7) + 1;
                           const weekIndex = Math.min(currentWeekNum - 1, selectedC.weeks.length - 1);
                           const selectedW = selectedC.weeks[weekIndex];
                           if (selectedW) {
                               const wtData: WeeklyTrialData = { title: selectedC.title, description: selectedC.description, weeklyTrialSummary: selectedW.weeklyTrial };
                               setWeeklyTrial(wtData);
                               setCurrentChallenge(selectedC); // Ensure current challenge is set
                           }
                       }
                   }
               }
           }


          return; // Use the saved state and exit
      }

      // 2. If no valid saved state, fetch quests from data files
      console.log(`Load Quests: Fetching new quests for day ${accountAge}.`);

      // --- Load Quest Data and Class Key ---
      if (!questsData) { handleLoadError('Quest Data Missing', true); return; }
      const typedQuestData = questsData as unknown as QuestData;
      if (!typedQuestData.progressiveChallenges || !typedQuestData.taskLibrary) { handleLoadError('Quest Structure Invalid', true); return; }

      const classKey = await storageService.getUserClassKey(userToken);
      if (!classKey) {
          console.warn("Load Quests: No user class key found.");
          setDailyTasks([ { id: 'error-class-1', text: "No user class info found", status: 'default', category: 'general' }, { id: 'error-class-2', text: "Complete classification", status: 'default', category: 'general' }]);
          setDailyTaskIds(['error-class-1', 'error-class-2']);
          setWeeklyTrial({ title: "No user class", description: "Complete classification", weeklyTrialSummary: "" });
          setCurrentChallenge(null);
          if (!dailyQuote) loadQuote();
          return;
      }

      // --- Find Challenge, Week, Day ---
       let pathCode: string, intensity: number;
        if (classKey.includes('-epic-') || classKey.includes('-beginner-')) {
            const parts = classKey.split('-'); pathCode = parts[0]; intensity = parts[1] === 'epic' ? 4 : 2;
        } else {
            const parts = classKey.split('-'); pathCode = parts[0]; intensity = parseInt(parts[1], 10);
            if (isNaN(intensity)) { handleLoadError('Class Key Intensity', true); return; }
        }

       const matchingChallenges = typedQuestData.progressiveChallenges.filter(c => c.id && c.id.startsWith(`${pathCode}-${intensity}`));
       if (matchingChallenges.length === 0) {
            console.warn(`No challenges found for ${pathCode}-${intensity}`);
            setWeeklyTrial({ title: "No challenge", description: "No challenge matching profile", weeklyTrialSummary: "Try different profile?" });
            setCurrentChallenge(null);
            setDailyTasks([ { id: 'error-match-1', text: "No matching challenges", status: 'default', category: 'general' }, { id: 'error-match-2', text: "Try different profile?", status: 'default', category: 'general' }]);
            setDailyTaskIds(['error-match-1', 'error-match-2']);
            if (!dailyQuote) loadQuote();
            return;
       }

       // Select challenge (persist or random)
        let selectedChallenge = currentChallenge;
        if (!selectedChallenge || !matchingChallenges.some(c => c.id === selectedChallenge?.id)) {
           const randomIndex = Math.floor(Math.random() * matchingChallenges.length);
           selectedChallenge = matchingChallenges[randomIndex];
        }
       if (!selectedChallenge || !selectedChallenge.weeks || selectedChallenge.weeks.length === 0) { handleLoadError('Challenge Weeks', true); return; }
       if (currentChallenge?.id !== selectedChallenge.id) setCurrentChallenge(selectedChallenge); // Update state if changed

       // Calculate week/day indices
       const currentWeekNum = Math.floor((accountAge - 1) / 7) + 1;
       const currentDayInWeek = (accountAge - 1) % 7 + 1;
       const weekIndex = Math.min(currentWeekNum - 1, selectedChallenge.weeks.length - 1);
       const selectedWeek = selectedChallenge.weeks[weekIndex];
       if (!selectedWeek || !selectedWeek.days || selectedWeek.days.length === 0) { handleLoadError('Week Days', true); return; }
       const dayIndex = Math.min(currentDayInWeek - 1, selectedWeek.days.length - 1);
       const selectedDay = selectedWeek.days[dayIndex];
       if (!selectedDay || !Array.isArray(selectedDay.tasks)) { handleLoadError('Day Tasks', true); return; }

      // --- Set Weekly Trial ---
      const weeklyTrialData: WeeklyTrialData = { title: selectedChallenge.title, description: selectedChallenge.description, weeklyTrialSummary: selectedWeek.weeklyTrial };
      if (JSON.stringify(weeklyTrial) !== JSON.stringify(weeklyTrialData)) {
        setWeeklyTrial(weeklyTrialData);
        await storageService.saveWeeklyTrial(userToken, JSON.stringify(weeklyTrialData));
      }

      // --- Get Task IDs and Format Tasks ---
      const taskIdsForDay = selectedDay.tasks.slice(0, 2); // Max 2 tasks
      const taskLibrary = typedQuestData.taskLibrary;
      const newTasks: Task[] = taskIdsForDay.map((taskId) => {
        if (!taskId || !taskLibrary[taskId]) {
          console.warn(`Task not found/invalid ID: ${taskId}`);
          return { id: taskId || `unknown-${Date.now()}`, text: `Unknown task: ${taskId}`, status: 'default', category: 'general' };
        }
        const taskInfo = taskLibrary[taskId];
        const taskIntensityLevel = intensity; // Assume challenge intensity applies
        const duration = taskInfo.duration || taskInfo.intensities?.[taskIntensityLevel]?.duration || '30';
        const taskText = `${taskInfo.task} (${duration} min)`;
        const category = getTaskCategoryFromLibrary(taskId, taskLibrary);
        return { id: taskId, text: taskText, status: 'default', category: category };
      });

       setDailyTasks(newTasks);
       setDailyTaskIds(taskIdsForDay);

      // 4. Save the newly fetched state for this day using saveDailyTasksState
      console.log(`Load Quests: Saving new tasks state for day ${accountAge}`, newTasks);
      await storageService.saveDailyTasksState(userToken, { tasks: newTasks, accountAge });

      // 5. Load quote if not already loaded
      if (!dailyQuote) loadQuote();

    } catch (error) {
      console.error('Error during loadQuests execution:', error);
      handleLoadError('loadQuests Catch', true);
    }
  }, [userToken, accountAge, currentChallenge, weeklyTrial, dailyQuote, loadQuote, handleLoadError]);


  // Load initial user data on mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Load quests whenever accountAge changes *after* initial load and is valid
   useEffect(() => {
     if (userToken && accountAge > 0) {
       console.log(`useEffect[accountAge, userToken]: Triggering loadQuests for age ${accountAge}`);
       loadQuests();
     }
   }, [accountAge, userToken, loadQuests]); // loadQuests dependency is important


   // Load quote on focus (example, could be triggered differently)
   useFocusEffect(
     useCallback(() => {
       console.log("Homepage Focused: Loading quote.");
       loadQuote();
       // Optional: Trigger data refresh if needed based on focus events
       // Be cautious of excessive refreshes
       // actions.refreshData();
     }, [loadQuote]) // Add other dependencies like actions.refreshData if used
   );

  // --- Actions ---

  const userData = { email, password, userToken, userName, userHandle, profileImage, userChoices };
  const content = {
      dailyQuote: dailyQuote?.quoteText ?? "Loading quote...",
      dailyQuoteAuthor: dailyQuote?.author ?? "",
      dailyQuoteOrigin: dailyQuote?.origin,
      dailyTasks, // Always Task objects
      dailyTaskIds,
      weeklyTrial,
      additionalTasks,
      currentChallenge,
      completedTasks, // Legacy chart data
      accountAge,
  };

  const getTaskCategories = useCallback((): Array<string> => {
      return dailyTasks
          .map(task => task.category || 'general')
          .filter(Boolean); // Filter out undefined/null/empty strings
  }, [dailyTasks]);


  const updateAdditionalTasks = useCallback((tasks: AdditionalTask[]) => {
    setAdditionalTasks(tasks);
    if (userToken) {
      storageService.saveAdditionalTasks(userToken, tasks);
    }
  }, [userToken]);

  const isRefreshingData = useRef(false);
  const refreshData = useCallback(async () => {
    if (isRefreshingData.current) { console.log("Refresh already in progress"); return; }
    try {
      isRefreshingData.current = true;
      console.log("Manual Refresh Triggered: Calling loadUserData");
      await loadUserData(); // Reloads user data, triggers age change, which triggers loadQuests
      loadQuote(); // Also refresh the quote
    } catch(error){ console.error("Error during refreshData:", error); }
    finally { isRefreshingData.current = false; }
  }, [loadUserData, loadQuote]);

  // Adjust account age (DEV TOOL)
  const increaseAccountAge = useCallback(async () => {
    if (!userToken) return;
    console.log("DEV: Increasing account age...");
    const success = await storageService.increaseAccountCreationDay(userToken);
    if (success) await loadUserData(); // Reload user data to get new age
  }, [userToken, loadUserData]);

  const decreaseAccountAge = useCallback(async () => {
    if (!userToken) return;
    console.log("DEV: Decreasing account age...");
    const success = await storageService.decreaseAccountCreationDay(userToken);
    if (success) await loadUserData(); // Reload user data to get new age
  }, [userToken, loadUserData]);


  // --- Task Status Update Logic - Uses saveDailyTasksState ---
  const updateTaskStatus = useCallback((index: number, status: 'completed' | 'canceled') => {
    setDailyTasks(prevTasks => {
      if (index < 0 || index >= prevTasks.length) {
          console.error(`updateTaskStatus: Invalid index ${index}`);
          return prevTasks;
      }

      const updatedTasks = [...prevTasks];
      const taskItem = updatedTasks[index]; // Already validated as Task object

      // Prevent updating already processed tasks to avoid duplicate saves/logic
      if (taskItem.status === status) {
         console.log(`updateTaskStatus: Task at index ${index} already has status ${status}. Skipping.`);
         return prevTasks;
      }

      updatedTasks[index] = { ...taskItem, status: status };
      console.log(`updateTaskStatus: Set index ${index} to status ${status}`);

      // Save the entire updated state using saveDailyTasksState
      if (userToken && accountAge > 0) {
          console.log(`updateTaskStatus: Saving tasks state for day ${accountAge}`);
          storageService.saveDailyTasksState(userToken, { tasks: updatedTasks, accountAge });
      } else {
          console.warn("updateTaskStatus: Cannot save state - missing token or invalid age.");
      }
      return updatedTasks; // Return the new state array
    });
  }, [userToken, accountAge]); // Depends on token and age


  // (Legacy function for chart data - keep if needed, ensure consistency)
  const addCompletedTask = useCallback(async (
    taskText: string, category: string, duration: number, isDaily: boolean
  ) => {
    if (!userToken || accountAge <= 0) return null;
    try {
      const taskCategory = storageService.normalizeCategory(category); // Use exported function
      let taskDuration = duration;
      if (isNaN(taskDuration)) {
        const durationMatch = taskText.match(/\((\d+)\s*min\)/);
        taskDuration = durationMatch ? parseInt(durationMatch[1], 10) : 30;
      }

      const record = {
        day: accountAge, task_name: taskText.split('(')[0].trim(), category: taskCategory.toLowerCase(), duration: taskDuration, is_daily: isDaily ? 1 : 0, completed_at: Date.now()
      };
      const savedRecord = await storageService.saveTaskCompletionRecord(userToken, record);
      if (savedRecord) {
          console.log("Saved task completion record (legacy addCompletedTask path):", savedRecord.id);
          // Maintain the old completedTasks structure for compatibility if needed
          const newCompletedTask: CompletedTaskData = { category: taskCategory.toLowerCase(), minutes: taskDuration, timestamp: Date.now() };
          setCompletedTasks(prev => [...prev, newCompletedTask]); // Update state immutably
          await storageService.saveCompletedTasks(userToken, [...completedTasks, newCompletedTask]); // Save updated legacy array
          return savedRecord;
      }
      return null;
    } catch (error) {
      console.error('Error adding completed task (legacy addCompletedTask path):', error);
      return null;
    }
   }, [userToken, accountAge, completedTasks]); // Depend on completedTasks state


  const actions = {
    loadUserData,
    // loadQuests, // Not typically called directly
    setAdditionalTasks: updateAdditionalTasks,
    refreshData,
    getTaskCategories,
    addCompletedTask, // Legacy chart data
    updateTaskStatus, // Key function for completion/cancellation
    increaseAccountAge,
    decreaseAccountAge,
  };

  return { userData, content, actions };
}
