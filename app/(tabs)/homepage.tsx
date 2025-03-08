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
  const [dailyQuotes, setDailyQuotes] = useState(['', '', '']); // Changed to 3 quotes
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

  // Function to load quotes
  const loadQuotes = async () => {
    try {
      // Extract 3 random quotes from the data (changed from 5)
      const randomQuotes = [];
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * quotesData.length);
        const randomQuote = quotesData[randomIndex];
        
        // Extract the quote text from the object
        if (randomQuote && randomQuote.quote) {
          randomQuotes.push(randomQuote.quote);
        } else {
          randomQuotes.push("Quote not available");
        }
      }
      
      setDailyQuotes(randomQuotes);
    } catch (err) {
      console.error('Error loading quotes:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      // Set default quotes in case of error - now 3 quotes
      setDailyQuotes([
        "The unexamined life is not worth living - Socrates",
        "We are what we repeatedly do. Excellence, then, is not an act, but a habit - Aristotle",
        "You have power over your mind - not outside events. Realize this, and you will find strength - Marcus Aurelius"
      ]);
    }
  };

  // Function to refresh all data
  const handleRefresh = () => {
    loadUserChoices();
    loadQuotes();
  };

  // Load all stored choices from AsyncStorage when component mounts
  useEffect(() => {
    loadUserChoices();
    loadQuotes();
  }, []);

  const handleQuoteChange = (index, newQuote) => {
    const updatedQuotes = [...dailyQuotes];
    updatedQuotes[index] = newQuote;
    setDailyQuotes(updatedQuotes);
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
      {/* Custom Header with Red Background and Lower Title */}
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
                  <Text style={styles.refreshButtonText}>↻ Refresh</Text>
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
              
              {/* Weekly Trial */}
              <View style={styles.optionContainer}>
                <Text style={styles.optionTitle}>Weekly Trial</Text>
                <View style={styles.optionContent}>
                  {Object.entries(userChoices).some(([, choice]) => choice) ? (
                    Object.entries(userChoices).map(([question, choice]) => (
                      choice && (
                        <Text key={question} style={styles.userChoiceText}>
                          {`Q${question.replace('question', '')}: ${choice}`}
                        </Text>
                      )
                    ))
                  ) : (
                    <Text style={styles.noChoicesText}>No choices made yet</Text>
                  )}
                </View>
              </View>

              {/* Daily Quotes */}
              {dailyQuotes.map((quote, index) => (
                <View key={index} style={styles.optionContainer}>
                  <Text style={styles.optionTitle}>Daily Quote</Text>
                  <View style={styles.optionContent}>
                    <TextInput
                      style={styles.quoteInput}
                      value={quote}
                      onChangeText={(text) => handleQuoteChange(index, text)}
                      multiline={true}
                      textAlign="center"
                      placeholder="Enter a quote"
                      placeholderTextColor="#aaa"
                    />
                  </View>
                </View>
              ))}
              
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
    paddingBottom: 30,
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
    paddingVertical: 15,
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
  }
});

export const unstable_settings = {
  // This removes the tab bar for this screen
  bottomTabs: {
    tabBarStyle: { display: 'none' },
  },
};