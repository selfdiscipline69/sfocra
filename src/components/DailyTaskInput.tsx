import React from 'react';
import { StyleSheet, View, Text, Animated, TouchableWithoutFeedback } from 'react-native';
import WeeklyTrialBox, { useBoxTextColor } from './WeeklyTrialBox';
// import { useTheme } from '../context/ThemeContext'; // Theme is passed as prop
import { Swipeable } from 'react-native-gesture-handler';
// import AnimatedSpriteIcon from './AnimatedSpriteIcon'; // Seems unused
// Needed for progress type
import { GestureHandlerStateChangeEvent, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

// Define task type that can be an object with status and optional ID/category
export type Task = {
  id?: string;
  text: string;
  status: 'default' | 'completed' | 'canceled';
  category?: string; // Keep as general string, casting happens at usage
};

// Type for WeeklyTrialBox category prop
// Fix: Ensure 'general' is included as a valid type alongside specific categories
type WeeklyTrialBoxCategory = 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity' | 'general' | undefined;

interface DailyTaskInputProps {
  tasks: Task[]; // Expecting array of Task objects
  theme: any; // Replace with proper theme type if available
  onTaskComplete?: (index: number) => void;
  onTaskCancel?: (index: number) => void;
  // Pass the full task object for context
  onTaskLongPress?: (index: number, taskItem: Task) => void;
}

// Internal component to display the task text and handle long press visual cue
const TaskDisplay = ({
  taskText,
  onLongPress,
}: {
  taskText: string;
  onLongPress?: () => void;
}) => {
  const textColor = useBoxTextColor(); // Get text color from box context

  return (
    <TouchableWithoutFeedback onLongPress={onLongPress} delayLongPress={300}>
      <View style={styles.taskWrapper}>
        <Text style={[styles.taskText, { color: textColor }]}>
          {taskText}
        </Text>
        <Text style={[styles.longPressHint, { color: textColor, opacity: 0.6 }]}>
          Long press to start timer
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};


// Swipe right action (Cancel) - Add type for progress
const CancelAction = (progress: Animated.AnimatedInterpolation<number>, theme: any) => {
  const trans = progress.interpolate({ inputRange: [0, 1], outputRange: [100, 0] });
  return (
    <Animated.View style={[styles.rightAction, { backgroundColor: theme.mode === 'dark' ? '#D13030' : '#FF3B30', transform: [{ translateX: trans }] }]}>
      <Text style={styles.actionText}>Cancel</Text>
    </Animated.View>
  );
};

// Swipe left action (Complete) - Add type for progress
const CompleteAction = (progress: Animated.AnimatedInterpolation<number>, theme: any) => {
  const trans = progress.interpolate({ inputRange: [0, 1], outputRange: [-100, 0] });
  return (
    <Animated.View style={[styles.leftAction, { backgroundColor: theme.mode === 'dark' ? '#30A030' : '#34C759', transform: [{ translateX: trans }] }]}>
      <Text style={styles.actionText}>Done</Text>
    </Animated.View>
  );
};


const DailyTaskInput = ({
  tasks,
  theme,
  onTaskComplete = () => {},
  onTaskCancel = () => {},
  onTaskLongPress = () => {},
}: DailyTaskInputProps) => {

  // Filter tasks to only show those with 'default' status
  const activeTasks = (tasks || []).filter(task => // Ensure tasks is an array
    typeof task === 'object' && task !== null && task.status === 'default'
  );

  // Map to original index for callbacks
   const tasksWithOriginalIndex = activeTasks.map(task => {
        const originalIndex = (tasks || []).findIndex(originalTask =>
            typeof originalTask === 'object' && typeof task === 'object' &&
            ((originalTask.id && task.id && originalTask.id === task.id) || originalTask.text === task.text)
        );
        return { ...task, originalIndex: originalIndex !== -1 ? originalIndex : -1 };
    }).filter(task => task.originalIndex !== -1);


  if (tasksWithOriginalIndex.length === 0) {
      return (
          <View style={styles.noTasksContainer}>
              <Text style={[styles.noTasksText, { color: theme.textMuted || '#888' }]}>
                  No daily tasks pending.
              </Text>
          </View>
      );
  }


  return (
    <>
      {tasksWithOriginalIndex.map((taskItem) => (
        <Swipeable
          key={`task-${taskItem.originalIndex}-${taskItem.id || taskItem.text}`}
          // Fix: Add type annotation for progress parameter
          renderRightActions={(progress: Animated.AnimatedInterpolation<number>) => CancelAction(progress, theme)}
          renderLeftActions={(progress: Animated.AnimatedInterpolation<number>) => CompleteAction(progress, theme)}
          onSwipeableRightOpen={() => onTaskCancel(taskItem.originalIndex)}
          onSwipeableLeftOpen={() => onTaskComplete(taskItem.originalIndex)}
          enabled={taskItem.status === 'default'}
        >
          <WeeklyTrialBox
            title={`Daily Task`}
            // Fix: Pass undefined directly if category is 'general', otherwise pass the category.
            // No need for casting if WeeklyTrialBox expects the specific string types or undefined.
            category={taskItem.category === 'general' ? undefined : taskItem.category}
            theme={theme}
          >
            <TaskDisplay
              taskText={taskItem.text}
              onLongPress={() => onTaskLongPress(taskItem.originalIndex, taskItem)}
            />
          </WeeklyTrialBox>
        </Swipeable>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  taskWrapper: {
      paddingVertical: 5,
  },
  taskText: {
    fontSize: 15,
    textAlign: 'left',
    width: '100%',
    lineHeight: 20,
    marginBottom: 3,
  },
  longPressHint: {
    fontSize: 11,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  leftAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start', // Align text left
    marginBottom: 15,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingLeft: 20, // Indent text
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end', // Align text right
    marginBottom: 15,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingRight: 20, // Indent text
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  noTasksContainer: {
      paddingVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 100,
  },
  noTasksText: {
      fontSize: 16,
      fontStyle: 'italic',
  }
});

export default DailyTaskInput;