import React from 'react';
import { TextInput, StyleSheet, View, Text, Animated, TouchableWithoutFeedback } from 'react-native';
import WeeklyTrialBox, { useBoxTextColor } from './WeeklyTrialBox';
import { useTheme } from '../context/ThemeContext';
import { Swipeable } from 'react-native-gesture-handler';

interface DailyTaskInputProps {
  tasks: string[];
  onChangeTask: (index: number, text: string) => void;
  theme: any; // Replace with proper theme type if available
  categories?: Array<'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity' | undefined>;
  onTaskComplete?: (index: number) => void;
  onTaskCancel?: (index: number) => void;
  onTaskLongPress?: (index: number, taskText: string) => void;
}

const TaskInput = ({ task, onChangeTask, index, theme, onLongPress }: { 
  task: string; 
  onChangeTask: (index: number, text: string) => void; 
  index: number;
  theme: any;
  onLongPress?: () => void;
}) => {
  // Use the box text color from context
  const textColor = useBoxTextColor();
  
  return (
    <TouchableWithoutFeedback onLongPress={onLongPress}>
      <View style={{ width: '100%' }}>
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
        <Text style={[styles.longPressHint, { color: textColor, opacity: 0.6 }]}>
          Long press to start timer
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

// Swipe right to delete component
const DeleteAction = (progress: Animated.AnimatedInterpolation<number>, theme: any) => {
  const trans = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });
  
  return (
    <Animated.View 
      style={[
        styles.rightAction,
        {
          backgroundColor: theme.mode === 'dark' ? '#D13030' : '#FF3B30',
          transform: [{ translateX: trans }],
        },
      ]}
    >
      <Text style={styles.actionText}>Cancel</Text>
    </Animated.View>
  );
};

// Swipe left to complete component
const CompleteAction = (progress: Animated.AnimatedInterpolation<number>, theme: any) => {
  const trans = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });
  
  return (
    <Animated.View
      style={[
        styles.leftAction,
        {
          backgroundColor: theme.mode === 'dark' ? '#30A030' : '#34C759',
          transform: [{ translateX: trans }],
        },
      ]}
    >
      <Text style={styles.actionText}>Done</Text>
    </Animated.View>
  );
};

const DailyTaskInput = ({ 
  tasks, 
  onChangeTask, 
  theme, 
  categories = [],
  onTaskComplete = () => {},
  onTaskCancel = () => {},
  onTaskLongPress = () => {},
}: DailyTaskInputProps) => {
  return (
    <>
      {tasks
        .map((task, index) => ({ task, index, category: categories[index] }))
        .filter(item => item.task && item.task.trim() !== '') // Only render non-empty tasks
        .map(({ task, index, category }) => (
          <Swipeable
            key={`task-${index}`}
            renderRightActions={(progress: Animated.AnimatedInterpolation<number>) => DeleteAction(progress, theme)}
            renderLeftActions={(progress: Animated.AnimatedInterpolation<number>) => CompleteAction(progress, theme)}
            onSwipeableRightOpen={() => onTaskCancel(index)}
            onSwipeableLeftOpen={() => onTaskComplete(index)}
          >
            <WeeklyTrialBox 
              title={`Daily Task ${index + 1}`}
              category={category}
            >
              <TaskInput 
                task={task} 
                onChangeTask={onChangeTask} 
                index={index} 
                theme={theme}
                onLongPress={() => onTaskLongPress(index, task)}
              />
            </WeeklyTrialBox>
          </Swipeable>
        ))}
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
  longPressHint: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  leftAction: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 15,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 15,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    padding: 20,
  }
});

export default DailyTaskInput;