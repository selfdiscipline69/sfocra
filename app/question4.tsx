import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Question4() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

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
          onPress={() => setSelected(option)}
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
        onPress={() => router.replace('/(tabs)/homepage')} // ✅ Fixed Navigation
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
      backgroundColor: 'black', // 🔥 Set background to black
      justifyContent: 'space-between',
      paddingVertical: 50,
    },
    progressBar: {
      height: 5,
      backgroundColor: '#555', // 🔥 Darker progress bar track
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
      color: 'white', // 🔥 White text
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
      color: 'white', // 🔥 White text
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
    disabledButton: {
      backgroundColor: '#444', // 🔥 Disable button when no selection
    },
    nextText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
});