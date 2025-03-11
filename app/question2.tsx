import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Question2() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [userToken, setUserToken] = useState(null);

  // Difficulty mapping to align with classes.json format (D value)
  const difficultyToCode = {
    'Daily Trials': 1,
    'Epic Missions': 2,
    'Relentless Campaign': 3,
    'Seasonal Conquests': 4,
    'Spartan Trials': 5
  };

  // Load user token and saved selection when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user token
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
        
        // First try to load with token-specific key
        let savedSelection = null;
        if (token) {
          savedSelection = await AsyncStorage.getItem(`question2Choice_${token}`);
        }
        
        // Fall back to non-token specific key if needed
        if (savedSelection === null) {
          savedSelection = await AsyncStorage.getItem('question2Choice');
        }
        
        if (savedSelection !== null) {
          setSelected(savedSelection);
        } else {
          setSelected(null);
        }
      } catch (e) {
        console.error('Error loading data:', e);
      }
    };
    loadData();
  }, []);

  // Function to save selection to AsyncStorage
  const handleSelection = async (option) => {
    try {
      // Get the numeric code for the selected difficulty
      const difficultyCode = difficultyToCode[option];
      
      // Store both the human-readable choice and the code
      await AsyncStorage.setItem('question2Choice', option);
      await AsyncStorage.setItem('question2Code', String(difficultyCode));
      
      // If we have a user token, also store with token-specific keys
      if (userToken) {
        await AsyncStorage.setItem(`question2Choice_${userToken}`, option);
        await AsyncStorage.setItem(`question2Code_${userToken}`, String(difficultyCode));
      }
      
      setSelected(option);
    } catch (e) {
      console.error('Error saving selection:', e);
    }
  };

  // Function to handle navigation to the next question
  const handleNext = async () => {
    if (selected) {
      try {
        // Get the numeric code for the selected difficulty
        const difficultyCode = difficultyToCode[selected];
        
        // Store both the human-readable choice and the code before navigation
        await AsyncStorage.setItem('question2Choice', selected);
        await AsyncStorage.setItem('question2Code', String(difficultyCode));
        
        // If we have a user token, also store with token-specific keys
        if (userToken) {
          await AsyncStorage.setItem(`question2Choice_${userToken}`, selected);
          await AsyncStorage.setItem(`question2Code_${userToken}`, String(difficultyCode));
        }
        
        router.push('/question3');
      } catch (e) {
        console.error('Error saving before navigation:', e);
      }
    }
  };

  // Function to navigate back to Question 1
  const handleBack = async () => {
    try {
      router.push('/question1');
    } catch (e) {
      console.error('Error navigating back:', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Section with Progress Bar and Back Button */}
      <View style={styles.topSection}>
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '50%' }]} />
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
        <Text style={styles.questionTitle}>How shall your journey unfold?</Text>
        <Text style={styles.subtext}>Choose your difficulty.</Text>

        {/* Options */}
        {['Daily Trials', 'Epic Missions', 'Relentless Campaign', 'Seasonal Conquests', 'Spartan Trials'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.option, selected === option && styles.selectedOption]}
            onPress={() => handleSelection(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
            {selected === option && <Text style={styles.checkmark}>✔</Text>}
          </TouchableOpacity>
        ))}

        {/* Description */}
        <Text style={styles.description}>
          Your chosen challenge style determines how your quests will be structured in your journey.
        </Text>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, !selected && styles.disabledButton]}
        onPress={handleNext}
        disabled={!selected}
      >
        <Text style={styles.nextText}>Next</Text>
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
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    backgroundColor: '#222',
  },
  selectedOption: {
    backgroundColor: '#444',
    borderColor: 'red',
  },
  optionText: {
    fontSize: 16,
    color: 'white',
  },
  checkmark: {
    color: 'red',
    fontSize: 18,
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