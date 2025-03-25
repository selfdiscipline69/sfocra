import { useState, useEffect, useCallback } from 'react';
import { UserChoices, AdditionalTask } from '../types/UserTypes';
import * as storageService from '../utils/StorageUtils';
import quotesData from '../../assets/Quote.json';
import questsData from '../../assets/Quest.json';

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
  
  // Content states
  const [dailyQuote, setDailyQuote] = useState<string>('');
  const [dailyTasks, setDailyTasks] = useState<string[]>(['', '']);
  const [weeklyTrial, setWeeklyTrial] = useState<string | null>(null);
  const [additionalTasks, setAdditionalTasks] = useState<AdditionalTask[]>([]);

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
      
      const tasks = await storageService.getAdditionalTasks(userData.userToken);
      setAdditionalTasks(tasks);
    }
  }, []);

  // Load quests and quotes - use useCallback
  const loadQuestsAndQuotes = useCallback(async (refreshWeeklyTrial = true) => {
    try {
      const classKey = await storageService.getUserClassKey(userToken);
      
      if (!classKey) {
        setDailyTasks([
          "No user class information found",
          "Please complete the classification process"
        ]);
        
        if (refreshWeeklyTrial) {
          setWeeklyTrial("No user class information found");
          await storageService.saveWeeklyTrial("No user class information found");
        }
        return;
      }
      
      // Extract path and difficulty from class key
      const pathDifficultyKey = classKey.split('-').slice(0, 2).join('-');
      
      // Filter quests matching this path-difficulty
      const matchingQuests = questsData.filter(quest => quest.key === pathDifficultyKey);
      let availableQuests = [...matchingQuests];
      
      // Handle weekly trial
      if (refreshWeeklyTrial) {
        if (availableQuests.length === 0) {
          setWeeklyTrial("No quests available for your class type");
          await storageService.saveWeeklyTrial("No quests available for your class type");
        } else {
          const weeklyQuestCount = Math.min(5, availableQuests.length);
          const weeklyQuests = [];
          
          for (let i = 0; i < weeklyQuestCount; i++) {
            if (availableQuests.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableQuests.length);
            const selectedQuest = availableQuests.splice(randomIndex, 1)[0];
            weeklyQuests.push(selectedQuest);
          }
          
          if (weeklyQuests.length > 0) {
            const formattedWeeklyQuests = weeklyQuests.map(quest => 
              `${quest.task} (${quest.duration})`
            ).join('\n\n');
            
            setWeeklyTrial(formattedWeeklyQuests);
            await storageService.saveWeeklyTrial(formattedWeeklyQuests);
          } else {
            setWeeklyTrial("Not enough quests available for your class type");
            await storageService.saveWeeklyTrial("Not enough quests available for your class type");
          }
        }
      }
      
      // Handle daily tasks
      const dailyTasksArray = [];
      
      for (let i = 0; i < 2; i++) {
        if (availableQuests.length === 0) {
          dailyTasksArray.push("Not enough quests available for your class type");
        } else {
          const randomIndex = Math.floor(Math.random() * availableQuests.length);
          const selectedQuest = availableQuests.splice(randomIndex, 1)[0];
          const taskText = `${selectedQuest.task} (${selectedQuest.duration})`;
          dailyTasksArray.push(taskText);
        }
      }
      
      setDailyTasks(dailyTasksArray);
      await storageService.saveDailyTasks(dailyTasksArray, userToken);
      
      // Handle daily quote
      if (quotesData.length > 0) {
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
      
    } catch (error) {
      console.error('Error loading quests and quotes:', error);
      if (refreshWeeklyTrial) {
        setWeeklyTrial("Error loading weekly trial");
      }
      
      setDailyTasks([
        "Error loading daily task 1",
        "Error loading daily task 2"
      ]);
      
      setDailyQuote("Error loading daily quote");
    }
  }, [userToken]); // userToken is the only dependency here

  // Update task handlers - use useCallback
  const handleTaskChange = useCallback((index: number, newTask: string) => {
    setDailyTasks(prevTasks => {
      const updatedTasks = [...prevTasks];
      updatedTasks[index] = newTask;
      return updatedTasks;
    });
  }, []);

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
    loadQuestsAndQuotes(false);
  }, [loadUserData, loadQuestsAndQuotes]);

  // Load data on initial mount
  useEffect(() => {
    loadUserData();
    loadQuestsAndQuotes();
  }, [loadUserData, loadQuestsAndQuotes]);

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
    weeklyTrial,
    additionalTasks,
  };

  const actions = {
    loadUserData,
    loadQuestsAndQuotes,
    handleTaskChange,
    handleQuoteChange,
    handleAdditionalTaskChange,
    setAdditionalTasks: updateAdditionalTasks,
    refreshData,
  };

  return { userData, content, actions };
}
