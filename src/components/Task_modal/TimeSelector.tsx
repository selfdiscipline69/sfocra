import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

interface TimeSelectorProps {
  theme: any; // Pass theme for styling
  initialTime?: string; // "HH:MM" format
  onTimeChange: (time: string) => void; // Callback with "HH:MM"
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  theme,
  initialTime = "00:00",
  onTimeChange,
}) => {
  const [hour, setHour] = useState<string>(initialTime.split(':')[0] || "00");
  const [minute, setMinute] = useState<string>(initialTime.split(':')[1] || "00");

  useEffect(() => {
    // Update internal state if initialTime prop changes from outside
    const [initialHour, initialMinute] = initialTime.split(':');
    setHour(initialHour || "00");
    setMinute(initialMinute || "00");
  }, [initialTime]);

  const handleHourChange = (text: string) => {
    let newHour = text.replace(/[^0-9]/g, ''); // Allow only numbers
    if (newHour === '') {
      setHour('');
      onTimeChange(`00:${minute.padStart(2, '0')}`);
      return;
    }
    
    const numHour = parseInt(newHour, 10);
    if (numHour >= 0 && numHour <= 23) {
      setHour(newHour);
      onTimeChange(`${newHour.padStart(2, '0')}:${minute.padStart(2, '0')}`);
    } else if (numHour > 23) {
      // If user types something like "24", cap it or handle as invalid
      setHour("23"); // Cap at 23
      onTimeChange(`23:${minute.padStart(2, '0')}`);
    }
  };

  const handleMinuteChange = (text: string) => {
    let newMinute = text.replace(/[^0-9]/g, ''); // Allow only numbers
    if (newMinute === '') {
        setMinute('');
        onTimeChange(`${hour.padStart(2, '0')}:00`);
        return;
    }

    const numMinute = parseInt(newMinute, 10);
    if (numMinute >= 0 && numMinute <= 59) {
      setMinute(newMinute);
      onTimeChange(`${hour.padStart(2, '0')}:${newMinute.padStart(2, '0')}`);
    } else if (numMinute > 59) {
      setMinute("59"); // Cap at 59
      onTimeChange(`${hour.padStart(2, '0')}:59`);
    }
  };

  const formatValue = (value: string) => {
    // Pad with leading zero when input loses focus if it's a single digit
    if (value.length === 1) {
      return `0${value}`;
    }
    return value;
  };


  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground || theme.background }]}
        value={hour}
        onChangeText={handleHourChange}
        onBlur={() => setHour(prev => formatValue(prev))}
        keyboardType="number-pad"
        maxLength={2}
        placeholder="HH"
        placeholderTextColor={theme.subtext || '#888'}
      />
      <Text style={[styles.separator, { color: theme.text }]}>:</Text>
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground || theme.background }]}
        value={minute}
        onChangeText={handleMinuteChange}
        onBlur={() => setMinute(prev => formatValue(prev))}
        keyboardType="number-pad"
        maxLength={2}
        placeholder="MM"
        placeholderTextColor={theme.subtext || '#888'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    // Add any container-specific styling if needed, e.g., width: '100%'
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10, // Reduced padding for smaller inputs
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 40,
    width: 60, // Fixed width for hour/minute inputs
    textAlign: 'center',
  },
  separator: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
});

export default TimeSelector; 