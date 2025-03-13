import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import quotesData from '../../assets/Quote.json';
import questsData from '../../assets/Quest.json'; 
import WeeklyTrialBox from '../components/WeeklyTrialBox';
import { useTheme } from '../context/ThemeContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Define TypeScript interfaces for our data types
interface UserChoices {
  question1: string | null;
  question2: string | null;
  question3: string | null;
  question4: string | null;
}

interface AdditionalTask {
  text: string;
  image?: string | null;
  completed?: boolean;
  showImage?: boolean;
}

export default function Homepage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [userToken, setUserToken] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userHandle, setUserHandle] = useState<string>('');
  const [userChoices, setUserChoices] = useState<UserChoices>({
    question1: null,
    question2: null,
    question3: null,
    question4: null,
  });
  const [dailyQuote, setDailyQuote] = useState<string>(''); 
  const [dailyTasks, setDailyTasks] = useState<string[]>(['', '']);
  const [weeklyTrial, setWeeklyTrial] = useState<string | null>(null); 
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [additionalTasks, setAdditionalTasks] = useState<AdditionalTask[]>([]);

  // Function to load user choices from AsyncStorage
  const loadUserChoices = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedPassword = await AsyncStorage.getItem('userPassword');
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (storedEmail !== null) setEmail(storedEmail);
      if (storedPassword !== null) setPassword(storedPassword);
      if (userToken !== null) setUserToken(userToken);
      
      // Load user name and username
      const storedName = await AsyncStorage.getItem('userFullName');
      const storedHandle = await AsyncStorage.getItem('userUsername');
      
      if (storedName) setUserName(storedName);
      if (storedHandle) setUserHandle(storedHandle);
      
      // Initialize an object to store choices
      const choices: UserChoices = {
        question1: null,
        question2: null,
        question3: null,
        question4: null,
      };
      
      // Try to load with both key patterns for each question
      for (let i = 1; i <= 4; i++) {
        const questionKey = `question${i}` as keyof UserChoices;
        // First try with token-specific key
        if (userToken) {
          const choiceWithToken = await AsyncStorage.getItem(`question${i}Choice_${userToken}`);
          if (choiceWithToken !== null) {
            choices[questionKey] = choiceWithToken;
            continue; // Skip to next question if found
          }
        }
        
        // Fall back to non-token-specific key if token-specific not found
        const choiceWithoutToken = await AsyncStorage.getItem(`question${i}Choice`);
        if (choiceWithoutToken !== null) {
          choices[questionKey] = choiceWithoutToken;
        }
      }
      
      // Load profile image if it exists
      if (userToken) {
        const storedImage = await AsyncStorage.getItem(`profileImage_${userToken}`);
        if (storedImage !== null) setProfileImage(storedImage);
        
        // Load additional tasks from addTask screen
        const savedAdditionalTasks = await AsyncStorage.getItem(`additionalTasks_${userToken}`);
        if (savedAdditionalTasks) {
          setAdditionalTasks(JSON.parse(savedAdditionalTasks));
        }
      }

      // Update state with all found choices
      setUserChoices(choices);
      
      console.log("Loaded choices:", choices); // Debug log to verify what was loaded
    } catch (err) {
      console.error('Error loading user choices:', err);
    }
  };

  // Function to load quests and quotes with an option to refresh weekly trial or not
  const loadQuestsAndQuotes = async (refreshWeeklyTrial = true) => {
    try {
      // Get user's class key (P-D-T-C format)
      const userClassKey = await AsyncStorage.getItem('userClassKey') || 
                          await AsyncStorage.getItem(`userClassKey_${userToken}`);
      
      if (!userClassKey) {
        console.log("No user class key found, using default quests");
        setDailyTasks([
          "default quests",
          "default quests"
        ]);
        if (refreshWeeklyTrial) {
          setWeeklyTrial("default quests");
        }
        return;
      }
      
      // Parse the key to get path (P) and difficulty (D)
      const keyParts = userClassKey.split('-');
      const userPath = keyParts[0]; // P value (1=Mind, 2=Body, 3=Balanced)
      const userDifficulty = parseInt(keyParts[1]); // D value (1-5)
      
      console.log(`User path: ${userPath}, difficulty: ${userDifficulty}`);
      
      // Get all available paths
      const allPaths = ["1", "2", "3"]; // Mind, Body, Balanced
      
      // Determine the other paths (paths that are not the user's main path)
      const otherPaths = allPaths.filter(path => path !== userPath);
      
      // Filter quests matching the user's path
      const userPathQuests = questsData.filter(quest => {
        const questKeyParts = quest.key.split('-');
        return questKeyParts[0] === userPath;
      });
      
      // Filter quests for other paths
      const otherPathsQuests = questsData.filter(quest => {
        const questKeyParts = quest.key.split('-');
        return otherPaths.includes(questKeyParts[0]);
      });
      
      // 1. WEEKLY TRIAL SELECTION - 5 quests with path diversity
      if (refreshWeeklyTrial) {
        const weeklyTrials = [];
        
        // First, select quests from other paths (at least 1, at most 3)
        const otherPathsWeeklyQuests = [];
        
        // Find higher difficulty quests from other paths
        const difficultOtherPathsQuests = otherPathsQuests.filter(quest => {
          const questKeyParts = quest.key.split('-');
          // Use user difficulty or higher for other paths
          return parseInt(questKeyParts[1]) >= userDifficulty;
        });
        
        // If not enough high difficulty quests from other paths, use any difficulty
        let availableOtherPathsQuests = difficultOtherPathsQuests.length >= 3 
          ? difficultOtherPathsQuests 
          : otherPathsQuests;
        
        // Select 1-3 quests from other paths (randomly)
        const numOtherPathsQuests = Math.min(
          Math.floor(Math.random() * 3) + 1, // Random number between 1-3
          availableOtherPathsQuests.length
        );
        
        for (let i = 0; i < numOtherPathsQuests; i++) {
          if (availableOtherPathsQuests.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableOtherPathsQuests.length);
            const selectedQuest = availableOtherPathsQuests.splice(randomIndex, 1)[0];
            otherPathsWeeklyQuests.push(selectedQuest);
          }
        }
        
        // Then, select remaining quests from user's path
        // Find higher difficulty quests from user's path
        const difficultUserPathQuests = userPathQuests.filter(quest => {
          const questKeyParts = quest.key.split('-');
          return parseInt(questKeyParts[1]) >= userDifficulty;
        });
        
        // If not enough high difficulty quests, use any difficulty
        let availableUserPathQuests = difficultUserPathQuests.length >= 5 
          ? difficultUserPathQuests 
          : userPathQuests;
        
        // Select remaining quests from user's path
        const remainingQuests = 5 - otherPathsWeeklyQuests.length;
        for (let i = 0; i < remainingQuests; i++) {
          if (availableUserPathQuests.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableUserPathQuests.length);
            const selectedQuest = availableUserPathQuests.splice(randomIndex, 1)[0];
            weeklyTrials.push(selectedQuest);
          }
        }
        
        // Combine and shuffle all selected weekly trials
        const allWeeklyTrials = [...otherPathsWeeklyQuests, ...weeklyTrials];
        
        // Fisher-Yates shuffle algorithm
        for (let i = allWeeklyTrials.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allWeeklyTrials[i], allWeeklyTrials[j]] = [allWeeklyTrials[j], allWeeklyTrials[i]];
        }
        
        // Format the weekly trials (without showing intensity)
        if (allWeeklyTrials.length > 0) {
          // Join all trials with line breaks
          const formattedWeeklyTrials = allWeeklyTrials.map(quest => 
            `${quest.task} (${quest.duration_minutes} min)`
          ).join('\n\n');
          
          setWeeklyTrial(formattedWeeklyTrials);
          await AsyncStorage.setItem('weeklyTrial', formattedWeeklyTrials);
        } else {
          console.log("No weekly trial quests found");
          setWeeklyTrial("Custom weekly challenge - adapt to your level");
        }
      }
      
      // 2. DAILY TASKS SELECTION - use actual difficulty and ensure path diversity
      // Use the user's actual difficulty without capping
      const dailyIntensity = userDifficulty.toString();
      
      // Find tasks matching user's path and difficulty
      const mainPathTasks = questsData.filter(quest => {
        const questKeyParts = quest.key.split('-');
        return questKeyParts[0] === userPath && questKeyParts[1] === dailyIntensity;
      });
      
      // Prepare to select daily tasks with path diversity
      const dailyTasks = [];
      
      // For Balanced path (P=3), include at least 1 from Mind or Body
      if (userPath === "3") {
        // Find tasks from other paths (Mind or Body) matching difficulty
        const diverseTasks = questsData.filter(quest => {
          const questKeyParts = quest.key.split('-');
          return (questKeyParts[0] === "1" || questKeyParts[0] === "2") && 
                 questKeyParts[1] === dailyIntensity;
        });
        
        // If we have diverse tasks, select one randomly
        if (diverseTasks.length > 0) {
          const randomIndex = Math.floor(Math.random() * diverseTasks.length);
          const diverseTask = diverseTasks[randomIndex];
          dailyTasks.push(`${diverseTask.task} (${diverseTask.duration_minutes} min)`);
        } else {
          // Fallback if no matching difficulty found in other paths
          const anyDiverseTasks = questsData.filter(quest => {
            const questKeyParts = quest.key.split('-');
            return questKeyParts[0] === "1" || questKeyParts[0] === "2";
          });
          
          if (anyDiverseTasks.length > 0) {
            const randomIndex = Math.floor(Math.random() * anyDiverseTasks.length);
            const diverseTask = anyDiverseTasks[randomIndex];
            dailyTasks.push(`${diverseTask.task} (${diverseTask.duration_minutes} min)`);
          } else {
            dailyTasks.push("No task available from Mind or Body paths");
          }
        }
        
        // Add one more task from main path if available
        if (mainPathTasks.length > 0) {
          const randomIndex = Math.floor(Math.random() * mainPathTasks.length);
          const mainPathTask = mainPathTasks[randomIndex];
          dailyTasks.push(`${mainPathTask.task} (${mainPathTask.duration_minutes} min)`);
        } else {
          // Fallback to any balanced path task
          const anyBalancedTasks = questsData.filter(quest => {
            const questKeyParts = quest.key.split('-');
            return questKeyParts[0] === "3";
          });
          
          if (anyBalancedTasks.length > 0) {
            const randomIndex = Math.floor(Math.random() * anyBalancedTasks.length);
            const balancedTask = anyBalancedTasks[randomIndex];
            dailyTasks.push(`${balancedTask.task} (${balancedTask.duration_minutes} min)`);
          } else {
            dailyTasks.push("No Balanced path task available");
          }
        }
      } 
      // For Mind (P=1) or Body (P=2), include one from the other paths
      else {
        // Find tasks from other paths matching difficulty
        const diverseTasks = questsData.filter(quest => {
          const questKeyParts = quest.key.split('-');
          return questKeyParts[0] !== userPath && questKeyParts[1] === dailyIntensity;
        });
        
        // If we have diverse tasks, select one randomly
        if (diverseTasks.length > 0) {
          const randomIndex = Math.floor(Math.random() * diverseTasks.length);
          const diverseTask = diverseTasks[randomIndex];
          dailyTasks.push(`${diverseTask.task} (${diverseTask.duration_minutes} min)`);
        } else {
          // Fallback if no matching difficulty found in other paths
          const anyDiverseTasks = questsData.filter(quest => {
            const questKeyParts = quest.key.split('-');
            return questKeyParts[0] !== userPath;
          });
          
          if (anyDiverseTasks.length > 0) {
            const randomIndex = Math.floor(Math.random() * anyDiverseTasks.length);
            const diverseTask = anyDiverseTasks[randomIndex];
            dailyTasks.push(`${diverseTask.task} (${diverseTask.duration_minutes} min)`);
          } else {
            dailyTasks.push("No task available from other paths");
          }
        }
        
        // Add one task from main path if available
        if (mainPathTasks.length > 0) {
          const randomIndex = Math.floor(Math.random() * mainPathTasks.length);
          const mainPathTask = mainPathTasks[randomIndex];
          dailyTasks.push(`${mainPathTask.task} (${mainPathTask.duration_minutes} min)`);
        } else {
          // Fallback to any task from user's path
          const anyMainPathTasks = questsData.filter(quest => {
            const questKeyParts = quest.key.split('-');
            return questKeyParts[0] === userPath;
          });
          
          if (anyMainPathTasks.length > 0) {
            const randomIndex = Math.floor(Math.random() * anyMainPathTasks.length);
            const mainPathTask = anyMainPathTasks[randomIndex];
            dailyTasks.push(`${mainPathTask.task} (${mainPathTask.duration_minutes} min)`);
          } else {
            dailyTasks.push("No task available from your path");
          }
        }
      }
      
      // Ensure we have exactly 2 daily tasks
      while (dailyTasks.length < 2) {
        dailyTasks.push("Additional task not available");
      }
      
      // Shuffle the tasks to randomize order
      const shuffledDailyTasks = [...dailyTasks];
      for (let i = shuffledDailyTasks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDailyTasks[i], shuffledDailyTasks[j]] = [shuffledDailyTasks[j], shuffledDailyTasks[i]];
      }
      
      // Update state and save to AsyncStorage
      setDailyTasks(shuffledDailyTasks);
      await AsyncStorage.setItem('dailyTasks', JSON.stringify(shuffledDailyTasks));
      
      // Select 1 random quote for Daily Quote - always refresh this
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
    } catch (err) {
      console.error('Error loading quests and quotes:', err);
      
      // Set defaults in case of error - but respect the refreshWeeklyTrial parameter
      if (refreshWeeklyTrial) {
        setWeeklyTrial("Working out in the gym (60 min) - Physical");
      }
      
      setDailyTasks([
        "Meditation (30 min) - Mental",
        "Reading (30 min) - Knowledge"
      ]);
      setDailyQuote("The unexamined life is not worth living - Socrates");
    }
  };

  // Function to refresh all data
  const handleRefresh = () => {
    loadUserChoices();
    loadQuestsAndQuotes(false); // Pass false to not refresh weekly trial
  };

  // Load all stored choices from AsyncStorage when component mounts
  useEffect(() => {
    loadUserChoices();
    loadQuestsAndQuotes();
  }, []);

  const handleTaskChange = (index: number, newTask: string) => {
    const updatedTasks = [...dailyTasks];
    updatedTasks[index] = newTask;
    setDailyTasks(updatedTasks);
  };

  const handleQuoteChange = (newQuote: string) => {
    setDailyQuote(newQuote);
  };

  // Add function to handle changes to additional tasks text
  const handleAdditionalTaskChange = (index: number, newText: string) => {
    const updatedTasks = [...additionalTasks];
    if (updatedTasks[index]) {
      updatedTasks[index].text = newText;
      setAdditionalTasks(updatedTasks);
      
      // Save to AsyncStorage
      if (userToken) {
        AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks))
          .catch(err => console.error('Error saving additional tasks:', err));
      }
    }
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTitleStyle: {
            fontSize: 16,
            color: theme.text,
          },
          headerTitle: "",
        }} 
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: theme.background }]}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        <View style={styles.innerContainer}>
          {/* Profile Section */}
          <View style={styles.header}>
            <View>
              {/* Daily Quote now appears at the top */}
              <Text style={[styles.description, { color: theme.text }]}>
                {dailyQuote}
              </Text>
            </View>
            
            <View style={styles.headerButtons}>
              {/* User Profile Image or Default Icon - Moved left */}
              <View style={styles.profileSection}>
                <TouchableOpacity 
                  onPress={() => router.push('/(tabs)/settings')} 
                  style={styles.profileIconButton}
                  accessibilityLabel="Settings"
                >
                  {profileImage ? (
                    <Image 
                      source={{ uri: profileImage }} 
                      style={styles.profileIcon} 
                    />
                  ) : (
                    <View style={styles.profileIcon} />
                  )}
                </TouchableOpacity>
                
                {/* Username display under profile icon */}
                <Text style={styles.usernameText}>
                  {userHandle || '@username'}
                </Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <ScrollView 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={true} 
            scrollEnabled={true}
            style={styles.scrollView}  
          >
            <View style={styles.spacerView} />
            
            {/* Weekly Trial with WeeklyTrialBox component */}
            <WeeklyTrialBox 
              title="Weekly Trial"
              rightElement={
                <TouchableOpacity 
                  onPress={() => loadQuestsAndQuotes(true)} 
                  style={styles.refreshButton}
                  accessibilityLabel="Refresh weekly trials"
                >
                  <Ionicons name="refresh" size={18} color="white" />
                </TouchableOpacity>
              }
            >
              {weeklyTrial ? (
                <Text style={styles.userChoiceText}>{weeklyTrial}</Text>
              ) : (
                <Text style={styles.noChoicesText}>No quest available</Text>
              )}
            </WeeklyTrialBox>

            {/* Daily Tasks */}
            {dailyTasks.map((task, index) => (
              <WeeklyTrialBox key={`task-${index}`} title={`Daily Task ${index + 1}`}>
                <TextInput
                  style={styles.quoteInput}
                  value={task}
                  onChangeText={(text) => handleTaskChange(index, text)}
                  multiline={true}
                  textAlign="center"
                  placeholder="Enter a task"
                  placeholderTextColor="#aaa"
                />
              </WeeklyTrialBox>
            ))}
            
            {/* Additional Tasks */}
            {additionalTasks.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionHeaderText, { color: theme.subtext }]}>Additional Tasks</Text>
                </View>
                
                {additionalTasks.map((task, index) => (
                  <WeeklyTrialBox key={`additional-${index}`} title={`Extra Task ${index + 1}`}>
                    <TextInput
                      style={styles.quoteInput}
                      value={task.text}
                      onChangeText={(text) => handleAdditionalTaskChange(index, text)}
                      multiline={true}
                      textAlign="center"
                      placeholder="Task details"
                      placeholderTextColor="#aaa"
                    />
                  </WeeklyTrialBox>
                ))}
              </>
            )}
            
            {/* Extra space at bottom for keyboard */}
            <View style={styles.keyboardSpace} />
          </ScrollView>

          {/* Bottom Navigation Icons */}
          <View style={[styles.bottomNav, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/performance')}
              style={styles.navButton}
            >
              <FontAwesome5 name="chart-line" size={22} color={theme.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.homeButton}
              onPress={() => router.push('/(tabs)/addTask')}
            >
              <Text style={styles.homeButtonText}>Add Task</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/settings')}
              style={styles.navButton}
            >
              <Ionicons name="settings-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  // Existing styles...
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 5,
    paddingTop: 20, 
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  description: {
    fontSize: 14,
    marginRight: 10,
    width: width * 0.6,
    fontStyle: 'italic',
  },
  profileIcon: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: 'white',
  },
  content: {
    paddingBottom: 80,
    flexGrow: 1,
  },
  userChoiceText: {
    fontSize: 14,
    marginVertical: 1,
    lineHeight: 18,
    color: 'white', 
  },
  noChoicesText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    color: 'white',
  },
  quoteInput: {
    fontSize: 14,
    paddingVertical: 0,
    textAlign: 'center',
    color: 'white',
    width: '100%',
    lineHeight: 18,
    backgroundColor: 'transparent'
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderTopWidth: 1,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  homeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerButtons: {
    alignItems: 'center',
    marginRight: 25,
  },
  keyboardSpace: {
    height: 100,
  },
  profileIconButton: {
    padding: 8,
  },
  spacerView: {
    height: 30,
  },
  profileSection: {
    alignItems: 'center',
  },
  usernameText: {
    color: '#ddd',
    fontSize: 12,
    marginTop: 6, 
    textAlign: 'center',
    maxWidth: 150,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  refreshButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export const unstable_settings = {
  bottomTabs: {
    tabBarStyle: { display: 'none' },
  },
};