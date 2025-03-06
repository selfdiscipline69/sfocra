import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Question1() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

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
            onPress={() => setSelected(option)}
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

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => router.push('/question2')}
        disabled={!selected} // Prevent navigation without selection
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
    backgroundColor: 'black', // 🔥 Set background to black
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  progressBar: {
    height: 5,
    backgroundColor: '#555', // 🔥 Make progress bar track darker
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
    color: 'white', // 🔥 Make text white
  },
  subtext: {
    fontSize: 16,
    color: '#aaa', // 🔥 Light gray for readability
    marginBottom: 30,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#888', // 🔥 Slightly lighter border
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    backgroundColor: '#222', // 🔥 Dark gray background for options
  },
  selectedOption: {
    backgroundColor: '#444', // 🔥 Darker background for selected option
    borderColor: 'red',
  },
  optionText: {
    fontSize: 16,
    color: 'white', // 🔥 Make text white
  },
  checkmark: {
    color: 'red',
    fontSize: 18,
  },
  description: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 40,
    color: '#aaa', // 🔥 Light gray for readability
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
});