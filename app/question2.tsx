import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import optionDescriptions from '../assets/Option_Description.json';

export default function Question2() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [expandedOption, setExpandedOption] = useState(null);

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
      const { loadSessionData } = require('../src/utils/loadSessionData');
      await loadSessionData(2, router, setUserToken, setSelected, setExpandedOption);
    };
    loadData();
  }, []);

  // Function to save selection to AsyncStorage and handle expansion
  const handleSelection = async (option) => {
    const { handleSelection: handleSelectionUtil } = require('../src/utils/handleSelectionUtil');
    await handleSelectionUtil(
      2, // question number
      option,
      userToken,
      selected,
      setSelected,
      setExpandedOption,
      difficultyToCode,
      true // store non-token version (matches behavior in question2)
    );
  };

  // Function to get description key for an option
  const getDescriptionKey = (option) => {
    const difficultyCode = difficultyToCode[option];
    return `0-${difficultyCode}-0-0`;
  };

  // Function to handle navigation to the next question
  const handleNext = async () => {
    const { handleNext: handleNextNavigation } = require('../src/utils/handleNextNavigation');
    await handleNextNavigation(
      2, // question number
      userToken,
      selected,
      difficultyToCode,
      router,
      '/question3',
      true // store non-token version (matches behavior in question2)
    );
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

        {/* Options with expandable descriptions */}
        {['Daily Trials', 'Epic Missions', 'Relentless Campaign', 'Seasonal Conquests', 'Spartan Trials'].map((option) => (
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