import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import optionDescriptions from '../assets/Option_Description.json';

export default function Question4() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [expandedOption, setExpandedOption] = useState(null);

  // Consequence mapping to align with classes.json format (C value)
  const consequenceToCode = {
    'Yes, Bring It On': 1,
    'Choose My Own Punishments': 2,
    'Without Consequence': 3
  };

  // Load user token and saved selection when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // First, remove any NON-token specific choices to avoid confusion
        await AsyncStorage.removeItem('question4Choice');
        await AsyncStorage.removeItem('question4Code');
        
        // Get user token (this should be set during login/registration)
        const token = await AsyncStorage.getItem('userToken');
        console.log('Question4 - Current token:', token);
        
        if (!token) {
          // If no token, redirect to login
          console.log('No user token found - redirecting to login');
          Alert.alert(
            "Session Expired", 
            "Please log in again to continue.",
            [{ text: "OK", onPress: () => router.replace('/signup') }]
          );
          return;
        }
        
        setUserToken(token);
        
        // Only load TOKEN-SPECIFIC choices
        const savedSelection = await AsyncStorage.getItem(`question4Choice_${token}`);
        console.log('Loaded selection for this user:', savedSelection);
        
        if (savedSelection !== null) {
          setSelected(savedSelection);
          setExpandedOption(savedSelection);
        } else {
          // No saved selection for this token
          setSelected(null);
          setExpandedOption(null);
          console.log('No saved selections for this user. Starting fresh.');
        }
      } catch (e) {
        console.error('Error loading data:', e);
      }
    };
    loadData();
  }, [router]);

  // Function to handle option selection and expansion
  const handleSelection = async (option) => {
    if (!userToken) {
      console.log('No user token found when selecting option');
      return;
    }
    
    try {
      if (selected === option) {
        // If already selected, unselect it
        setSelected(null);
        setExpandedOption(null);
        
        // Remove from AsyncStorage - ONLY TOKEN-SPECIFIC
        await AsyncStorage.removeItem(`question4Choice_${userToken}`);
        await AsyncStorage.removeItem(`question4Code_${userToken}`);
        console.log('Selection cleared');
      } else {
        // Get the numeric code for the selected consequence
        const consequenceCode = consequenceToCode[option];
        
        // Store ONLY with token-specific keys
        await AsyncStorage.setItem(`question4Choice_${userToken}`, option);
        await AsyncStorage.setItem(`question4Code_${userToken}`, String(consequenceCode));
        console.log(`Saved selection: ${option} (${consequenceCode}) for token ${userToken}`);
        
        setSelected(option);
        setExpandedOption(option);
      }
    } catch (e) {
      console.error('Error saving selection:', e);
    }
  };

  // Function to get description key for an option
  const getDescriptionKey = (option) => {
    const consequenceCode = consequenceToCode[option];
    return `0-0-0-${consequenceCode}`;
  };

  // Handle navigation with save - now navigating directly to User_Classification
  const handleNext = async () => {
    if (!userToken) {
      console.log('No user token found when navigating');
      return;
    }
    
    if (selected) {
      try {
        // Get the numeric code for the selected consequence
        const consequenceCode = consequenceToCode[selected];
        
        // Store ONLY with token-specific keys
        await AsyncStorage.setItem(`question4Choice_${userToken}`, selected);
        await AsyncStorage.setItem(`question4Code_${userToken}`, String(consequenceCode));
        console.log(`Confirmed selection before navigation: ${selected}`);
        
        // Make sure this is the only navigation occurring
        console.log("Navigating to homepage");
        await router.push({
          pathname: '/User_Classification',
        });
      } catch (e) {
        console.error('Error during navigation:', e);
      }
    }
  };

  // Back to previous page
  const handleBack = () => {
    router.push('/question3');
  };

  return (
    <View style={styles.container}>
      {/* Top Section with Progress Bar and Back Button */}
      <View style={styles.topSection}>
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '100%' }]} />
        </View>

        {/* Back Button - Now below the progress bar */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Question Content */}
      <View style={styles.questionContent}>
        {/* Question */}
        <Text style={styles.questionTitle}>
          Every hero must face hardship. Shall the fates impose a price upon your failures?
        </Text>
        <Text style={styles.subtext}>Do you accept consequences?</Text>

        {/* Options with expandable descriptions */}
        {['Yes, Bring It On', 'Choose My Own Punishments', 'Without Consequence'].map((option) => (
          <View key={option} style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.option, 
                selected === option && styles.selectedOption,
                selected === option && expandedOption === option && styles.expandedOption
              ]}
              onPress={() => handleSelection(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
              {selected === option && <Text style={styles.checkmark}>✔</Text>}
            </TouchableOpacity>
            
            {/* Description section that expands when option is selected */}
            {expandedOption === option && (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>
                  {optionDescriptions[getDescriptionKey(option)]}
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Description */}
        <Text style={styles.description}>
          A hero's strength is tested not only by victories but also by the weight of their failures.
        </Text>
      </View>

      {/* Finish Button */}
      <TouchableOpacity
        style={[styles.nextButton, !selected && styles.disabledButton]}
        onPress={handleNext}
        disabled={!selected}
      >
        <Text style={styles.nextText}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: 'black',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  tokenText: {
    color: '#888',
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  topSection: {
    width: '100%',
  },
  progressBar: {
    height: 5,
    backgroundColor: '#555',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progress: {
    height: '100%',
    backgroundColor: 'red',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
  questionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',
  },
  subtext: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionContainer: {
    width: '100%',
    marginBottom: 15,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 10,
    width: '100%',
    backgroundColor: '#222',
  },
  selectedOption: {
    backgroundColor: '#444',
    borderColor: 'red',
  },
  expandedOption: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  optionText: {
    fontSize: 16,
    color: 'white',
  },
  checkmark: {
    color: 'red',
    fontSize: 18,
  },
  descriptionBox: {
    backgroundColor: '#333',
    padding: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderColor: 'red',
    borderWidth: 1,
    borderTopWidth: 0,
  },
  descriptionText: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
  },
  description: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 40,
    color: '#aaa',
  },
  nextButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#555',
    opacity: 0.7,
  },
  nextText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});