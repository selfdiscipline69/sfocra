import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import optionDescriptions from '../assets/Option_Description.json';

export default function Question1() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [expandedOption, setExpandedOption] = useState(null);

  // Path mapping to align with classes.json format (P value)
  const pathToCode = {
    'Mind': 1,
    'Body': 2,
    'Balanced': 3
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
          savedSelection = await AsyncStorage.getItem(`question1Choice_${token}`);
        }
        
        // Fall back to non-token specific key if needed
        if (savedSelection === null) {
          savedSelection = await AsyncStorage.getItem('question1Choice');
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

  // Function to handle option selection and expansion
  const handleSelection = async (option) => {
    try {
      if (selected === option) {
        // If already selected, unselect it
        setSelected(null);
        setExpandedOption(null);
        
        // Remove from AsyncStorage
        await AsyncStorage.removeItem('question1Choice');
        await AsyncStorage.removeItem('question1Code');
        
        if (userToken) {
          await AsyncStorage.removeItem(`question1Choice_${userToken}`);
          await AsyncStorage.removeItem(`question1Code_${userToken}`);
        }
      } else {
        // If not selected or a different option was selected, select this one
        const pathCode = pathToCode[option];
        
        // Store both the human-readable choice and the code
        await AsyncStorage.setItem('question1Choice', option);
        await AsyncStorage.setItem('question1Code', String(pathCode));
        
        // If we have a user token, also store with token-specific keys
        if (userToken) {
          await AsyncStorage.setItem(`question1Choice_${userToken}`, option);
          await AsyncStorage.setItem(`question1Code_${userToken}`, String(pathCode));
        }
        
        setSelected(option);
        setExpandedOption(option);
      }
    } catch (e) {
      console.error('Error saving selection:', e);
    }
  };

  // Function to get description for an option
  const getDescriptionKey = (option) => {
    const pathCode = pathToCode[option];
    return `${pathCode}-0-0-0`;
  };

  // Function to handle navigation with saved data
  const handleNext = async () => {
    if (selected) {
      try {
        // Get the numeric code for the selected path
        const pathCode = pathToCode[selected];
        
        // Store both the human-readable choice and the code before navigation
        await AsyncStorage.setItem('question1Choice', selected);
        await AsyncStorage.setItem('question1Code', String(pathCode));
        
        // If we have a user token, also store with token-specific keys
        if (userToken) {
          await AsyncStorage.setItem(`question1Choice_${userToken}`, selected);
          await AsyncStorage.setItem(`question1Code_${userToken}`, String(pathCode));
        }
        
        router.push('/question2');
      } catch (e) {
        console.error('Error saving before navigation:', e);
      }
    }
  };

  // Function to handle navigation back
  const handleBack = async () => {
    router.push('/signup');
  };

  return (
    <View style={styles.container}>
      {/* Top Section with Progress Bar and Back Button */}
      <View style={styles.topSection}>
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '25%' }]} />
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
        <Text style={styles.questionTitle}>Every hero has a calling. What is yours?</Text>
        <Text style={styles.subtext}>Choose your path.</Text>

        {/* Options with expandable descriptions */}
        {['Mind', 'Body', 'Balanced'].map((option) => (
          <View key={option} style={styles.optionContainer}>
            <TouchableOpacity
              style={[styles.option, selected === option && styles.selectedOption]}
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
          Your path will shape the nature of your quests and the trials you must face ahead.
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