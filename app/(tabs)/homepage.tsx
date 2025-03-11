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
  Image
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import quotesData from '../../assets/Quote.json';
import questsData from '../../assets/Quest.json'; 
import WeeklyTrialBox from '../components/WeeklyTrialBox';

const { width } = Dimensions.get('window');

export default function Homepage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userToken, setUserToken] = useState('');
  const [userName, setUserName] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [userChoices, setUserChoices] = useState({
    question1: null,
    question2: null,
    question3: null,
    question4: null,
  });
  const [dailyQuote, setDailyQuote] = useState(''); // Changed to single quote
  const [dailyTasks, setDailyTasks] = useState(['', '']); // Two daily tasks
  const [weeklyTrial, setWeeklyTrial] = useState(null); // Weekly trial quest
  const [profileImage, setProfileImage] = useState(null);
  const [additionalTasks, setAdditionalTasks] = useState([]); // Add state for additional tasks

  // Function to load user choices from AsyncStorage
  const loadUserChoices = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedPassword = await AsyncStorage.getItem('userPassword');
      const userToken = await AsyncStorage.getItem('userToken');
      setUserToken(userToken);
      
      if (storedEmail !== null) setEmail(storedEmail);
      if (storedPassword !== null) setPassword(storedPassword);
      
      // Load user name and username
      const storedName = await AsyncStorage.getItem('userFullName');
      const storedHandle = await AsyncStorage.getItem('userUsername');
      
      if (storedName) setUserName(storedName);
      if (storedHandle) setUserHandle(storedHandle);
      
      // Initialize an object to store choices
      const choices = {
        question1: null,
        question2: null,
        question3: null,
        question4: null,
      };
      
      // Try to load with both key patterns for each question
      for (let i = 1; i <= 4; i++) {
        // First try with token-specific key
        if (userToken) {
          const choiceWithToken = await AsyncStorage.getItem(`question${i}Choice_${userToken}`);
          if (choiceWithToken !== null) {
            choices[`question${i}`] = choiceWithToken;
            continue; // Skip to next question if found
          }
        }
        
        // Fall back to non-token-specific key if token-specific not found
        const choiceWithoutToken = await AsyncStorage.getItem(`question${i}Choice`);
        if (choiceWithoutToken !== null) {
          choices[`question${i}`] = choiceWithoutToken;
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
      // Select 3 random quests from the quests data
      const selectedQuests = [];
      const questsCopy = [...questsData]; // Create a copy to avoid modifying the original
      
      for (let i = 0; i < 3; i++) {
        if (questsCopy.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * questsCopy.length);
        const randomQuest = questsCopy.splice(randomIndex, 1)[0]; // Remove and get the selected quest
        
        selectedQuests.push(randomQuest);
      }
      
      // First quest for Weekly Trial - only update if refreshWeeklyTrial is true
      if (selectedQuests.length > 0 && refreshWeeklyTrial) {
        const formattedQuest = `${selectedQuests[0].task} (${selectedQuests[0].duration_minutes} min) - ${selectedQuests[0].category}`;
        setWeeklyTrial(formattedQuest);
      }
      
      // Next 2 quests for Daily Tasks - always refresh these
      const tasks = [];
      for (let i = 1; i < 3; i++) {
        if (i < selectedQuests.length) {
          const quest = selectedQuests[i];
          const formattedQuest = `${quest.task} (${quest.duration_minutes} min) - ${quest.category}`;
          tasks.push(formattedQuest);
        } else {
          tasks.push("No task available");
        }
      }
      setDailyTasks(tasks);
      
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

  const handleTaskChange = (index, newTask) => {
    const updatedTasks = [...dailyTasks];
    updatedTasks[index] = newTask;
    setDailyTasks(updatedTasks);
  };

  const handleQuoteChange = (newQuote) => {
    setDailyQuote(newQuote);
  };

  // Add function to handle changes to additional tasks text
  const handleAdditionalTaskChange = (index, newText) => {
    const updatedTasks = [...additionalTasks];
    updatedTasks[index].text = newText;
    setAdditionalTasks(updatedTasks);
    
    // Save to AsyncStorage
    if (userToken) {
      AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks))
        .catch(err => console.error('Error saving additional tasks:', err));
    }
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: 'black',
            height: 70, // Reduced height
          },
          headerTitleStyle: {
            fontSize: 16,
            color: 'white',
          },
          headerTitle: "",
          //headerTitleAlign: 'center',
        }} 
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        <View style={styles.innerContainer}>
          {/* Profile Section */}
          <View style={styles.header}>
            <View>
              {/* Daily Quote now appears at the top */}
              <Text style={styles.description}>
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
            showsVerticalScrollIndicator={true}  // Changed to true to show scroll indicator
            scrollEnabled={true}  // Explicitly enable scrolling
            style={styles.scrollView}  // Added a specific style for ScrollView
          >
            <View style={styles.spacerView} />
            
            {/* Weekly Trial with WeeklyTrialBox component */}
            <WeeklyTrialBox title="Weekly Trial">
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
                  <Text style={styles.sectionHeaderText}>Additional Tasks</Text>
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
          <View style={styles.bottomNav}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/performance')}>
              <Text style={styles.icon}>📈</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/addTask')}>
              <Text style={styles.icon}>➕</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/settings')}
              accessibilityLabel="Settings"
            >
              <Text style={styles.icon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 5,
    paddingTop: 20, 
    position: 'relative',  // Added for precise positioning
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15, // Reduced from 30 to 15
    marginTop: 5, // Added small margin at top
  },
  description: {
    color: 'white', // Changed from gray to white for better visibility
    fontSize: 14,
    marginRight: 10,
    width: width * 0.6,
    fontStyle: 'italic', // Added italic to make it look like a quote
  },
  profileIcon: {
    width: 55, // Increased from 40
    height: 55, // Increased from 40
    borderRadius: 28, // Adjusted to maintain circular shape (width/2 + 0.5)
    backgroundColor: 'white', // Fallback color if no image
  },
  content: {
    paddingBottom: 80,  // Increased to ensure there's scrollable space at bottom
    flexGrow: 1,  // This allows the content to grow but still be scrollable
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
    fontSize: 14, // Reduced from 16 to 14
    paddingVertical: 0, // Reduced from 10 to 8
    textAlign: 'center',
    color: 'white',
    width: '100%',
    lineHeight: 18,
    backgroundColor: 'transparent' // Added line height for better readability
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderColor: 'gray',
  },
  icon: {
    fontSize: 24,
    color: 'white',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    right: 100,
    backgroundColor: 'gray',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
  headerButtons: {
    alignItems: 'center',
    marginRight: 25, // Added margin to move the profile section left
  },
  keyboardSpace: {
    height: 100,  // Increased from 80 to provide more scrollable space
  },
  profileIconButton: {
    padding: 8, // Slightly reduced padding to accommodate larger icon
  },
  spacerView: {
    height: 30, // Adjust this value to control the amount of space
  },
  profileSection: {
    alignItems: 'center',
  },
  changeProfileText: {
    color: 'gray',
    fontSize: 8,
    marginTop: 4,
    textAlign: 'center',
    width: 60,
  },
  usernameText: {
    color: '#ddd',
    fontSize: 12,
    marginTop: 6, 
    textAlign: 'center',
    maxWidth: 150, // Increased from 70 to accommodate longer usernames without wrapping
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 10,
  },
  sectionHeaderText: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  scrollView: {
    flex: 1,  // Make sure ScrollView takes up available space
    width: '100%',  // Ensure full width
  },
});
export const unstable_settings = {
  // This removes the tab bar for this screen
  bottomTabs: {
    tabBarStyle: { display: 'none' },
  },
};