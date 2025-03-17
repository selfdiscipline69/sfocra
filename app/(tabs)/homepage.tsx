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
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import quotesData from '../../assets/Quote.json';
import questsData from '../../assets/Quest.json'; 
import WeeklyTrialBox from '../../src/components/WeeklyTrialBox';
import { useTheme } from '../../src/context/ThemeContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import HabitTrackingChart from '../../src/components/HabitTrackingChart';

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
        
        // Load additional tasks from addTask screen - ensure proper formatting
        const savedAdditionalTasks = await AsyncStorage.getItem(`additionalTasks_${userToken}`);
        console.log('Loaded additional tasks from storage:', savedAdditionalTasks);
        
        if (savedAdditionalTasks) {
          const parsedTasks = JSON.parse(savedAdditionalTasks);
          // Make sure we're using only the valid tasks with text
          if (Array.isArray(parsedTasks)) {
            const validTasks = parsedTasks.filter(task => task && task.text && task.text.trim() !== '');
            console.log(`Found ${validTasks.length} valid additional tasks`);
            setAdditionalTasks(validTasks);
          } else {
            console.log('Parsed additional tasks is not an array');
            setAdditionalTasks([]);
          }
        } else {
          console.log('No additional tasks found in storage');
          setAdditionalTasks([]); // Initialize with empty array if nothing found
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
          "No user class information found",
          "Please complete the classification process"
        ]);
        if (refreshWeeklyTrial) {
          setWeeklyTrial("No user class information found");
        }
        return;
      }
      
      // Extract just the path and difficulty (first two components) from P-D-T-C format
      const pathDifficultyKey = userClassKey.split('-').slice(0, 2).join('-');
      console.log(`Using path-difficulty key: ${pathDifficultyKey}`);
      
      // Filter quests to only those matching this exact path-difficulty key
      const matchingQuests = questsData.filter(quest => quest.key === pathDifficultyKey);
      console.log(`Found ${matchingQuests.length} quests matching ${pathDifficultyKey}`);
      
      // Create a working copy to select from without replacement
      let availableQuests = [...matchingQuests];
      
      // 1. HANDLE WEEKLY TRIAL - 5 quests if available
      if (refreshWeeklyTrial) {
        if (availableQuests.length === 0) {
          // No matching quests available
          setWeeklyTrial("No quests available for your class type");
          await AsyncStorage.setItem('weeklyTrial', "No quests available for your class type");
        } else {
          // Determine how many weekly quests we can provide (up to 5)
          const weeklyQuestCount = Math.min(5, availableQuests.length);
          const weeklyQuests = [];
          
          // Select quests without replacement
          for (let i = 0; i < weeklyQuestCount; i++) {
            if (availableQuests.length === 0) break;
            
            // Select a random quest from remaining ones
            const randomIndex = Math.floor(Math.random() * availableQuests.length);
            const selectedQuest = availableQuests.splice(randomIndex, 1)[0];
            weeklyQuests.push(selectedQuest);
          }
          
          // Format weekly quests
          if (weeklyQuests.length > 0) {
            const formattedWeeklyQuests = weeklyQuests.map(quest => 
              `${quest.task} (${quest.duration_minutes} min)`
            ).join('\n\n');
            
            setWeeklyTrial(formattedWeeklyQuests);
            await AsyncStorage.setItem('weeklyTrial', formattedWeeklyQuests);
          } else {
            setWeeklyTrial("Not enough quests available for your class type");
            await AsyncStorage.setItem('weeklyTrial', "Not enough quests available for your class type");
          }
        }
      }
      
      // 2. HANDLE DAILY TASKS - 2 quests if available
      const dailyTasks = [];
      const dailyTaskObjects = []; // For addTask format
      
      for (let i = 0; i < 2; i++) {
        if (availableQuests.length === 0) {
          const taskText = "Not enough quests available for your class type";
          dailyTasks.push(taskText);
          dailyTaskObjects.push({
            text: taskText,
            image: null,
            completed: false,
            showImage: false
          });
        } else {
          const randomIndex = Math.floor(Math.random() * availableQuests.length);
          const selectedQuest = availableQuests.splice(randomIndex, 1)[0];
          const taskText = `${selectedQuest.task} (${selectedQuest.duration_minutes} min)`;
          dailyTasks.push(taskText);
          dailyTaskObjects.push({
            text: taskText,
            image: null,
            completed: false,
            showImage: false
          });
        }
      }
      
      setDailyTasks(dailyTasks);
      await AsyncStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
      
      // Also save in the format needed by addTask
      if (userToken) {
        await AsyncStorage.setItem(`dailyTasks_${userToken}`, JSON.stringify(dailyTaskObjects));
      }
      
      // 3. HANDLE DAILY QUOTE - always refresh this
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
        setWeeklyTrial("Error loading weekly trial");
      }
      
      setDailyTasks([
        "Error loading daily task 1",
        "Error loading daily task 2"
      ]);
      setDailyQuote("Error loading daily quote");
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

  // Add a focus effect to reload data whenever the homepage comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("Homepage focused - reloading data");
      loadUserChoices();
      // Don't refresh weekly trial when returning to screen
      loadQuestsAndQuotes(false);
      return () => {};
    }, [])
  );

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
      
      // Save to AsyncStorage with proper error handling
      if (userToken) {
        AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks))
          .then(() => {
            console.log('Additional tasks saved successfully');
          })
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
            <WeeklyTrialBox title="Weekly Trial">
              {weeklyTrial ? (
                <Text style={[
                  styles.userChoiceText, 
                  { color: theme.mode === 'dark' ? 'white' : 'black' }
                ]}>
                  {weeklyTrial}
                </Text>
              ) : (
                <Text style={[
                  styles.noChoicesText, 
                  { color: theme.mode === 'dark' ? 'white' : 'black' }
                ]}>
                  No quest available
                </Text>
              )}
            </WeeklyTrialBox>

            {/* Daily Tasks */}
            {dailyTasks.map((task, index) => (
              <WeeklyTrialBox key={`task-${index}`} title={`Daily Task ${index + 1}`}>
                <TextInput
                  style={[
                    styles.quoteInput, 
                    { color: theme.mode === 'dark' ? 'white' : 'black' }
                  ]}
                  value={task}
                  onChangeText={(text) => handleTaskChange(index, text)}
                  multiline={true}
                  textAlign="center"
                  placeholder="Enter a task"
                  placeholderTextColor={theme.mode === 'dark' ? "#aaa" : "#777"}
                />
              </WeeklyTrialBox>
            ))}
            
            {/* Additional Tasks */}
            {additionalTasks.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionHeaderText, { color: theme.subtext }]}>
                    Additional Tasks
                  </Text>
                </View>
                
                {additionalTasks.map((task, index) => (
                  <WeeklyTrialBox key={`additional-${index}`} title={`Extra Task ${index + 1}`}>
                    <Text
                      style={[
                        styles.additionalTaskText, 
                        { color: theme.mode === 'dark' ? 'white' : 'black' }
                      ]}
                    >
                      {task.text}
                    </Text>
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
  },
  noChoicesText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  quoteInput: {
    fontSize: 14,
    paddingVertical: 0,
    textAlign: 'center',
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
  additionalTaskText: {
    fontSize: 14,
    paddingVertical: 5,
    textAlign: 'center',
    width: '100%',
    lineHeight: 18,
  },
});

export const unstable_settings = {
  bottomTabs: {
    tabBarStyle: { display: 'none' },
  },
};