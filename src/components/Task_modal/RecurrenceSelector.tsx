import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface RecurrenceSelectorProps {
  theme: any; // Pass theme for styling
  currentFrequency: number[]; // 7-item array [0,0,0,0,0,0,0]
  onFrequencyChange: (newFrequency: number[]) => void;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  theme,
  currentFrequency,
  onFrequencyChange,
}) => {
  const toggleDay = (index: number) => {
    const newFrequency = [...currentFrequency];
    newFrequency[index] = newFrequency[index] === 0 ? 1 : 0;
    onFrequencyChange(newFrequency);
  };

  return (
    <View style={styles.container}>
      {weekDays.map((day, index) => (
        <TouchableOpacity
          key={day}
          style={[
            styles.dayButton,
            { 
              backgroundColor: currentFrequency[index] ? theme.accent : (theme.mode === 'dark' ? theme.border : '#e0e0e0'),
              borderColor: currentFrequency[index] ? theme.accent : theme.borderLight || theme.border,
            },
          ]}
          onPress={() => toggleDay(index)}
        >
          <Text 
            style={[
              styles.dayButtonText, 
              { color: currentFrequency[index] ? (theme.mode === 'dark' ? theme.buttonTextDark || '#000' : theme.buttonTextLight || '#fff') : theme.text }
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20, // Make them circular or rounded
    borderWidth: 1,
    minWidth: 40, // Ensure a minimum width for tapability
    height: 40, // Ensure a consistent height
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2, // Add some spacing between buttons
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default RecurrenceSelector; 