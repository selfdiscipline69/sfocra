import React from 'react';
import { StyleSheet, View, Text, Animated, TouchableWithoutFeedback } from 'react-native';
import WeeklyTrialBox, { useBoxTextColor } from './WeeklyTrialBox';
import { useTheme } from '../context/ThemeContext';
import { Swipeable } from 'react-native-gesture-handler';
import AnimatedSpriteIcon from './AnimatedSpriteIcon';

// Define task type that can be either a string or an object with status
export type Task = string | { text: string; status: 'default' | 'completed' | 'canceled' };

interface DailyTaskInputProps {
  tasks: Task[];
  onChangeTask: (index: number, text: string) => void;
  theme: any; // Replace with proper theme type if available
  categories?: Array<'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity' | undefined>;
  onTaskComplete?: (index: number) => void;
  onTaskCancel?: (index: number) => void;
  onTaskLongPress?: (index: number, taskText: string) => void;
}

const TaskDisplay = ({ 
  task, 
  status = 'default', 
  index, 
  theme, 
  onLongPress,
  category
}: { 
  task: string; 
  status?: 'default' | 'completed' | 'canceled';
  index: number;
  theme: any;
  onLongPress?: () => void;
  category?: string;
}) => {
  // Use the box text color from context
  const textColor = useBoxTextColor();
  
  return (
    <TouchableWithoutFeedback onLongPress={onLongPress}>
      <View style={{ width: '100%' }}>
        <Text
          style={[
            styles.taskText, 
            { color: textColor }
          ]}
        >
          {task}
        </Text>
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
  // Process and filter tasks
  const processedTasks = tasks
    .map((taskItem, index) => {
      // Handle both string and object task formats
      const taskObj = typeof taskItem === 'string' 
        ? { text: taskItem, status: 'default' as const } 
        : taskItem;
      
      const taskText = typeof taskItem === 'string' ? taskItem : taskItem.text;
      const status = typeof taskItem === 'string' ? 'default' : taskItem.status;
      
      return {
        text: taskText,
        status,
        index,
        category: categories[index]
      };
    })
    .filter(item => 
      // Only include tasks that are not empty AND have status 'default'
      item.text && 
      item.text.trim() !== '' && 
      item.status === 'default'
    );

  return (
    <>
      {processedTasks.map(({ text, status, index, category }) => (
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
            <TaskDisplay 
              task={text} 
              status={status}
              index={index} 
              theme={theme}
              onLongPress={() => onTaskLongPress(index, text)}
              category={category}
            />
          </WeeklyTrialBox>
        </Swipeable>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  taskText: {
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
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'right',
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
  },
  spriteContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 12,
  },
});

export default DailyTaskInput;