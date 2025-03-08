import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Question4() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

  // Load saved selection on mount
  useEffect(() => {
    const loadSelection = async () => {
      try {
        const savedSelection = await AsyncStorage.getItem('question4Choice');
        if (savedSelection !== null) {
          setSelected(savedSelection);
        }
      } catch (e) {
        console.error('Error loading selection:', e);
      }
    };
    loadSelection();
  }, []);

  // Handle selection and save to AsyncStorage
  const handleSelection = async (option) => {
    try {
      await AsyncStorage.setItem('question4Choice', option);
      setSelected(option);
    } catch (e) {
      console.error('Error saving selection:', e);
    }
  };

  // Handle navigation with save
  const handleNext = async () => {
    if (selected) {
      try {
        await AsyncStorage.setItem('question4Choice', selected);
        router.replace('/(tabs)/homepage');
      } catch (e) {
        console.error('Error saving before navigation:', e);
      }
    }
  };

    // Back to previous page
    const handleBack = async () => {
      if (1) {
        try {
          router.push('question3');
        } catch (e) {
          console.error('Error saving before navigation:', e);
        }
      }
    };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: '100%' }]} />
      </View>

      {/* Question */}
      <Text style={styles.questionTitle}>
        Every hero must face hardship. Shall the fates impose a price upon your failures?
      </Text>
      <Text style={styles.subtext}>Do you accept consequences?</Text>

      {/* Options */}
      {['Yes, Bring It On', 'Choose My Own Punishments', 'Without Consequence'].map((option) => (
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
        A hero’s strength is tested not only by victories but also by the weight of their failures.
      </Text>

      {/* Finish Button */}
      <TouchableOpacity
        style={[styles.nextButton, !selected && styles.disabledButton]}
        onPress={handleNext}
        disabled={!selected}
      >
        <Text style={styles.nextText}>Finish</Text>
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
  nextButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#444',
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