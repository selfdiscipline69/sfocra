import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import WeeklyTrialBox, { useBoxTextColor } from './WeeklyTrialBox';
import { useTheme } from '../context/ThemeContext';

interface DailyTaskInputProps {
  tasks: string[];
  onChangeTask: (index: number, text: string) => void;
  theme: any; // Replace with proper theme type if available
  categories?: Array<'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity' | undefined>;
}

const TaskInput = ({ task, onChangeTask, index, theme }: { 
  task: string; 
  onChangeTask: (index: number, text: string) => void; 
  index: number;
  theme: any;
}) => {
  // Use the box text color from context
  const textColor = useBoxTextColor();
  
  return (
    <TextInput
      style={[
        styles.taskInput, 
        { color: textColor }
      ]}
      value={task}
      onChangeText={(text) => onChangeTask(index, text)}
      multiline={true}
      textAlign="left"
      placeholder="Enter a task"
      placeholderTextColor="rgba(255, 255, 255, 0.6)"
    />
  );
};

const DailyTaskInput = ({ tasks, onChangeTask, theme, categories = [] }: DailyTaskInputProps) => {
  return (
    <>
      {tasks.map((task, index) => {
        const category = categories[index];
        
        return (
          <WeeklyTrialBox 
            key={`task-${index}`} 
            title={`Daily Task ${index + 1}`}
            category={category}
          >
            <TaskInput 
              task={task} 
              onChangeTask={onChangeTask} 
              index={index} 
              theme={theme}
            />
          </WeeklyTrialBox>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  taskInput: {
    fontSize: 14,
    paddingVertical: 0,
    textAlign: 'left',
    width: '100%',
    lineHeight: 18,
    backgroundColor: 'transparent'
  },
});

export default DailyTaskInput;