import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import optionDescriptions from '../assets/Option_Description.json';

export default function Question3() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [expandedOption, setExpandedOption] = useState(null);

  // Tracking mapping to align with classes.json format (T value)
  const trackingToCode = {
    'Leveling System': 1,
    'Streaks & Habits': 2,
    'Both': 3
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
          savedSelection = await AsyncStorage.getItem(`question3Choice_${token}`);
        }
        
        // Fall back to non-token specific key if needed
        if (savedSelection === null) {
          savedSelection = await AsyncStorage.getItem('question3Choice');
        }
        
        if (savedSelection !== null) {
          setSelected(savedSelection);
          setExpandedOption(savedSelection); // Also expand the saved selection
        } else {
          setSelected(null);
          setExpandedOption(null);
        }
      } catch (e) {
        console.error('Error loading data:', e);
      }
    };
    loadData();
  }, []);

  // Function to save selection to AsyncStorage and handle expansion
  const handleSelection = async (option) => {
    try {
      if (selected === option) {
        // If already selected, unselect it
        setSelected(null);
        setExpandedOption(null);
        
        // Remove from AsyncStorage
        await AsyncStorage.removeItem('question3Choice');
        await AsyncStorage.removeItem('question3Code');
        
        if (userToken) {
          await AsyncStorage.removeItem(`question3Choice_${userToken}`);
          await AsyncStorage.removeItem(`question3Code_${userToken}`);
        }
      } else {
        // Get the numeric code for the selected tracking option
        const trackingCode = trackingToCode[option];
        
        // Store both the human-readable choice and the code
        await AsyncStorage.setItem('question3Choice', option);
        await AsyncStorage.setItem('question3Code', String(trackingCode));
        
        // If we have a user token, also store with token-specific keys
        if (userToken) {
          await AsyncStorage.setItem(`question3Choice_${userToken}`, option);
          await AsyncStorage.setItem(`question3Code_${userToken}`, String(trackingCode));
        }
        
        setSelected(option);
        setExpandedOption(option);
      }
    } catch (e) {
      console.error('Error saving selection:', e);
    }
  };

  // Function to get description key for an option
  const getDescriptionKey = (option) => {
    const trackingCode = trackingToCode[option];
    return `0-0-${trackingCode}-0`;
  };

  // Handle navigation with save
  const handleNext = async () => {
    if (selected) {
      try {
        // Get the numeric code for the selected tracking option
        const trackingCode = trackingToCode[selected];
        
        // Store both the human-readable choice and the code before navigation
        await AsyncStorage.setItem('question3Choice', selected);
        await AsyncStorage.setItem('question3Code', String(trackingCode));
        
        // If we have a user token, also store with token-specific keys
        if (userToken) {
          await AsyncStorage.setItem(`question3Choice_${userToken}`, selected);
          await AsyncStorage.setItem(`question3Code_${userToken}`, String(trackingCode));
        }
        
        router.push('/question4');
      } catch (e) {
        console.error('Error saving before navigation:', e);
      }
    }
  };

  // Back to previous page
  const handleBack = async () => {
    try {
      router.push('/question2');
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
          <View style={[styles.progress, { width: '75%' }]} />
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
        <Text style={styles.questionTitle}>Heroes rise not by chance, but by tracking their growth.</Text>
        <Text style={styles.subtext}>Choose your tracking focus.</Text>

        {/* Options with expandable descriptions */}
        {['Leveling System', 'Streaks & Habits', 'Both'].map((option) => (
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
          The way you measure progress defines the legacy you will leave behind.
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