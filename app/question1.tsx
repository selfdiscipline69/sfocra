import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Question1() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [userToken, setUserToken] = useState('');

  // Load saved selection and user token when component mounts
  useEffect(() => {
    const loadSelection = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token !== null) {
          setUserToken(token);
          const savedSelection = await AsyncStorage.getItem(`question1Choice_${token}`);
          if (savedSelection !== null) {
            setSelected(savedSelection);
          }
        } else {
          // Clear selections for first-time login
          await AsyncStorage.removeItem('question1Choice');
          setSelected(null);
        }
      } catch (e) {
        console.error('Error loading data:', e);
      }
    };
    loadSelection();
  }, []);

  // Function to save selection to AsyncStorage
  const handleSelection = async (option) => {
    try {
      await AsyncStorage.setItem(`question1Choice_${userToken}`, option);
      setSelected(option);
    } catch (e) {
      console.error('Error saving selection:', e);
    }
  };

  // Optional: Function to handle navigation with saved data
  const handleNext = async () => {
    if (selected) {
      try {
        await AsyncStorage.setItem(`question1Choice_${userToken}`, selected);
        router.push('/question2');
      } catch (e) {
        console.error('Error saving before navigation:', e);
      }
    }
  };

  // Optional: Function to handle navigation with saved data
  const handleBack = async () => {
    if (selected) {
      try {
        await AsyncStorage.setItem(`question1Choice_${userToken}`, selected);
        router.push('/signup');
      } catch (e) {
        console.error('Error saving before navigation:', e);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: '25%' }]} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.questionTitle}>Every hero has a calling. What is yours?</Text>
        <Text style={styles.subtext}>Choose your path.</Text>

        {/* Options */}
        {['Mind', 'Body', 'Balanced'].map((option) => (
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
          Your path will shape the nature of your quests and the trials you must face ahead.
        </Text>
      </View>

      {/* User Token */}
      <Text style={styles.tokenText}>User Token: {userToken}</Text>

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
        disabled={!selected}
      >
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
      >
        <Text style={styles.backText}>Back</Text>
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
  progressBar: {
    height: 5,
    backgroundColor: '#555',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progress: {
    height: '100%',
    backgroundColor: 'red',
  },
  content: {
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
  tokenText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  nextText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'gray',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
});