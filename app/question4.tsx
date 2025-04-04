import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import optionDescriptions from '../assets/Option_Description.json';

export default function Question4() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [userToken, setUserToken] = useState(null);
  const [expandedOption, setExpandedOption] = useState(null);

  // Consequence mapping - Simplified
  const consequenceToCode = {
    'Yes, Bring It On': 1,
    'Without Consequence': 3 // Keep original code for consistency
  };

  // Load user token and saved selection when component mounts
  useEffect(() => {
    const loadData = async () => {
      const { loadSessionData } = require('../src/utils/loadSessionData');
      // Pass the consequenceToCode map to correctly load the saved selection text
      await loadSessionData(4, router, setUserToken, setSelected, setExpandedOption, consequenceToCode);
    };
    loadData();
  }, []); // Removed router dependency

  // Function to handle option selection and expansion
  const handleSelection = async (option: string) => {
    const { handleSelection: handleSelectionUtil } = require('../src/utils/handleSelectionUtil');
    await handleSelectionUtil(
      4, // question number
      option,
      userToken,
      selected,
      setSelected,
      setExpandedOption,
      consequenceToCode,
      false // only store token-specific version (matches original behavior)
    );
  };

  // Function to get description key for an option
  const getDescriptionKey = (option: string): string => {
    const consequenceCode = consequenceToCode[option as keyof typeof consequenceToCode];
    return `0-0-0-${consequenceCode}`;
  };

  // Handle navigation with save - now navigating directly to User_Classification
  const handleNext = async () => {
    const { handleNext: handleNextNavigation } = require('../src/utils/handleNextNavigation');
    await handleNextNavigation(
      4, // question number
      userToken,
      selected,
      consequenceToCode,
      router,
      { pathname: '/User_Classification' }, // object-based navigation route
      false, // only store token-specific version
      "Navigating to homepage" // custom log message
    );
  };

  // Back to previous page (now question 2)
  const handleBack = () => {
    router.push('/question2');
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

        {/* Options with expandable descriptions - Simplified */}
        {['Yes, Bring It On', 'Without Consequence'].map((option) => (
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
                  {optionDescriptions[getDescriptionKey(option) as keyof typeof optionDescriptions]}
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