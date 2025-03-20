import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AdditionalTask } from '../types/UserTypes';
import WeeklyTrialBox from './WeeklyTrialBox';

interface AdditionalTaskDisplayProps {
  tasks: AdditionalTask[];
  theme: any; // Replace with proper theme type if available
}

const AdditionalTaskDisplay = ({ tasks, theme }: AdditionalTaskDisplayProps) => {
  if (tasks.length === 0) return null;
  
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionHeaderText, { color: theme.subtext }]}>
          Additional Tasks
        </Text>
      </View>
      
      {tasks.map((task, index) => (
        <WeeklyTrialBox key={`additional-${index}`} title={`Extra Task ${index + 1}`}>
          <Text
            style={[
              styles.taskText, 
              { color: theme.mode === 'dark' ? 'white' : 'black' }
            ]}
          >
            {task.text}
          </Text>
        </WeeklyTrialBox>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 10,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  taskText: {
    fontSize: 14,
    paddingVertical: 5,
    textAlign: 'center',
    width: '100%',
    lineHeight: 18,
  },
});

export default AdditionalTaskDisplay;
