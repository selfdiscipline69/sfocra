import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import WeeklyTrialBox from './WeeklyTrialBox';

interface DailyTaskInputProps {
  tasks: string[];
  onChangeTask: (index: number, text: string) => void;
  theme: any; // Replace with proper theme type if available
}

const DailyTaskInput = ({ tasks, onChangeTask, theme }: DailyTaskInputProps) => {
  return (
    <>
      {tasks.map((task, index) => (
        <WeeklyTrialBox key={`task-${index}`} title={`Daily Task ${index + 1}`}>
          <TextInput
            style={[
              styles.taskInput, 
              { color: theme.mode === 'dark' ? 'white' : 'black' }
            ]}
            value={task}
            onChangeText={(text) => onChangeTask(index, text)}
            multiline={true}
            textAlign="center"
            placeholder="Enter a task"
            placeholderTextColor={theme.mode === 'dark' ? "#aaa" : "#777"}
          />
        </WeeklyTrialBox>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  taskInput: {
    fontSize: 14,
    paddingVertical: 0,
    textAlign: 'center',
    width: '100%',
    lineHeight: 18,
    backgroundColor: 'transparent'
  },
});

export default DailyTaskInput;