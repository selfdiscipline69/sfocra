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
import questsData from '../../assets/Quest.json'; // Import Quest data

const { width } = Dimensions.get('window');

export default function Homepage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userToken, setUserToken] = useState('');
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

  // Function to load user choices from AsyncStorage
  const loadUserChoices = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedPassword = await AsyncStorage.getItem('userPassword');
      const userToken = await AsyncStorage.getItem('userToken');
      setUserToken(userToken);
      
      if (storedEmail !== null) setEmail(storedEmail);
      if (storedPassword !== null) setPassword(storedPassword);
      
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

    // Back to previous page
    const handleBack = async () => {
      if (1) {
        try {
          router.push('../question4');
        } catch (e) {
          console.error('Error saving before navigation:', e);
        }
      }
    };
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: 'red',
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            {/* Profile Section */}
            <View style={styles.header}>
              <View>
                <Text style={styles.description}>
                  A warrior does not wait for the perfect moment; they forge it with their own hands. 
                  Every step, every struggle, every victory—this is how legends are made.
                </Text>
              </View>
              
              <View style={styles.headerButtons}>
                {/* Refresh Button */}
                <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                  <Text style={styles.refreshButtonText}>↻</Text>
                </TouchableOpacity>
                
                {/* User Profile Image or Default Icon */}
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
              </View>
            </View>

            {/* Content */}
            <ScrollView 
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Add spacer to create more distance */}
              <View style={styles.spacerView} />
              
              {/* Weekly Trial with Random Quest */}
              <View style={styles.optionContainer}>
                <Text style={styles.optionTitle}>Weekly Trial</Text>
                <View style={styles.optionContent}>
                  {weeklyTrial ? (
                    <Text style={styles.userChoiceText}>{weeklyTrial}</Text>
                  ) : (
                    <Text style={styles.noChoicesText}>No quest available</Text>
                  )}
                  

                </View>
              </View>

              {/* Daily Tasks (2 boxes) */}
              {dailyTasks.map((task, index) => (
                <View key={`task-${index}`} style={styles.optionContainer}>
                  <Text style={styles.optionTitle}>Daily Task {index + 1}</Text>
                  <View style={styles.optionContent}>
                    <TextInput
                      style={styles.quoteInput}
                      value={task}
                      onChangeText={(text) => handleTaskChange(index, text)}
                      multiline={true}
                      textAlign="center"
                      placeholder="Enter a task"
                      placeholderTextColor="#aaa"
                    />
                  </View>
                </View>
              ))}
              
              {/* Extra space at bottom for keyboard */}
              <View style={styles.keyboardSpace} />
            </ScrollView>

            {/* Daily Quote Box - Now positioned above bottom nav with red theme */}
            <View style={styles.redQuoteContainer}>
              <Text style={styles.redQuoteTitle}>Daily Quote</Text>
              <TextInput
                style={styles.redQuoteInput}
                value={dailyQuote}
                onChangeText={handleQuoteChange}
                multiline={true}
                textAlign="center"
                placeholder="Enter a quote"
                placeholderTextColor="#ffcccc"
              />
            </View>

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
        </TouchableWithoutFeedback>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15, // Reduced from 30 to 15
    marginTop: 5, // Added small margin at top
  },
  description: {
    color: 'gray',
    fontSize: 14,
    marginRight: 10,
    width: width * 0.6,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white', // Fallback color if no image
  },
  content: {
    flexGrow: 1,
    paddingBottom: 10, // Reduced from 30 to give space for quote box
  },
  optionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    width: width - 10, // Using absolute width - 10 as requested
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  optionContent: {
    padding: 15,
  },
  userChoiceText: {
    fontSize: 14,
    marginVertical: 1,
    lineHeight: 18,
    color: 'black', 
  },
  noChoicesText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    color: 'black', 
  },
  userChoicesSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  userChoicesHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  quoteInput: {
    fontSize: 14, // Reduced from 16 to 14
    paddingVertical: 0, // Reduced from 10 to 8
    textAlign: 'center',
    color: '#333',
    width: '100%',
    lineHeight: 18, // Added line height for better readability
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginRight: 10,
    padding: 10,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: 'white', // Change to white so the emoji is visible against black background
    fontSize: 16,  // Increase size slightly for better visibility
  },
  keyboardSpace: {
    height: 80, // Extra space at bottom for keyboard
  },
  profileIconButton: {
    padding: 10,
  },
  spacerView: {
    height: 30, // Adjust this value to control the amount of space
  },
  redQuoteContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 10,
    margin: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ff3333',
    overflow: 'hidden',
  },
  redQuoteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    color: 'white',
  },
  redQuoteInput: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 15,
    textAlign: 'center',
    color: 'white',
    width: '100%',
    lineHeight: 18,
    minHeight: 60,
  },
});

export const unstable_settings = {
  // This removes the tab bar for this screen
  bottomTabs: {
    tabBarStyle: { display: 'none' },
  },
};