import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
// import WeeklyTrialBox, { useBoxTextColor } from './WeeklyTrialBox'; // No longer used directly
// import { Swipeable } from 'react-native-gesture-handler'; // No longer used directly
// import AnimatedSpriteIcon from './AnimatedSpriteIcon'; // Seems unused

// Import the new components and types
import TaskBoxModal from './Task_modal/TaskBoxModal';
import { TaskData } from '../types/UserTypes';

// Define task type that can be an object with status and optional ID/category
// This is the incoming prop type for daily tasks
export type Task = {
  id?: string; // Should ideally be present and unique
  text: string;
  status: 'default' | 'completed' | 'canceled';
  category?: string; // Keep as general string, casting happens at usage
};

// Type for WeeklyTrialBox category prop (no longer directly used here)
// type WeeklyTrialBoxCategory = 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity' | 'general' | undefined;

interface DailyTaskInputProps {
  tasks: Task[]; // Expecting array of Task objects
  theme: any; // Replace with proper theme type if available
  onTaskComplete?: (index: number) => void; // HomepageScreen expects index
  onTaskCancel?: (index: number) => void;   // HomepageScreen expects index
  onTaskLongPress?: (index: number, taskItem: TaskData) => void; // Pass mapped TaskData
  onTaskEdit?: (taskItem: TaskData) => void; // New prop to handle edit modal opening
}

// Helper function to parse task text into name and intensity
const parseTaskText = (text: string): { taskName: string; intensity: string } => {
  const intensityRegex = /\(([^)]+)\)$/; // Matches content in parentheses at the end
  const match = text.match(intensityRegex);
  if (match && match[1]) {
    const taskName = text.replace(intensityRegex, '').trim();
    const intensity = match[1].trim();
    return { taskName, intensity };
  }
  return { taskName: text.trim(), intensity: 'Standard' }; // Default intensity if not parsed
};


// // Internal component to display the task text and handle long press visual cue (No longer needed)
// const TaskDisplay = ({
//   taskText,
//   onLongPress,
// }: {
//   taskText: string;
//   onLongPress?: () => void;
// }) => {
//   const textColor = useBoxTextColor(); 

//   return (
//     <TouchableWithoutFeedback onLongPress={onLongPress} delayLongPress={300}>
//       <View style={styles.taskWrapper}>
//         <Text style={[styles.taskText, { color: textColor }]}>
//           {taskText}
//         </Text>
//         <Text style={[styles.longPressHint, { color: textColor, opacity: 0.6 }]}>
//           Long press to start timer
//         </Text>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// };


// // Swipe right action (Cancel) - (No longer needed, handled by TaskBoxModal)
// const CancelAction = (progress: Animated.AnimatedInterpolation<number>, theme: any) => {
//   const trans = progress.interpolate({ inputRange: [0, 1], outputRange: [100, 0] });
//   return (
//     <Animated.View style={[styles.rightAction, { backgroundColor: theme.mode === 'dark' ? '#D13030' : '#FF3B30', transform: [{ translateX: trans }] }]}>
//       <Text style={styles.actionText}>Cancel</Text>
//     </Animated.View>
//   );
// };

// // Swipe left action (Complete) - (No longer needed, handled by TaskBoxModal)
// const CompleteAction = (progress: Animated.AnimatedInterpolation<number>, theme: any) => {
//   const trans = progress.interpolate({ inputRange: [0, 1], outputRange: [-100, 0] });
//   return (
//     <Animated.View style={[styles.leftAction, { backgroundColor: theme.mode === 'dark' ? '#30A030' : '#34C759', transform: [{ translateX: trans }] }]}>
//       <Text style={styles.actionText}>Done</Text>
//     </Animated.View>
//   );
// };


const DailyTaskInput = ({
  tasks,
  theme,
  onTaskComplete = () => {},
  onTaskCancel = () => {},
  onTaskLongPress = () => {},
  onTaskEdit = () => {}, // Initialize new prop
}: DailyTaskInputProps) => {

  // Filter tasks to only show those with 'default' status
  const activeTasksWithOriginalIndex = (tasks || [])
    .map((task, index) => ({ ...task, originalIndex: index })) // Keep original index
    .filter(task => typeof task === 'object' && task !== null && task.status === 'default');

  if (activeTasksWithOriginalIndex.length === 0) {
      return (
          <View style={styles.noTasksContainer}>
              <Text style={[styles.noTasksText, { color: theme.textMuted || '#888' }]}>
                  No daily tasks pending.
              </Text>
          </View>
      );
  }

  // Map Task[] to TaskData[]
  const mappedTasks: TaskData[] = activeTasksWithOriginalIndex.map(taskItem => {
    const { taskName, intensity } = parseTaskText(taskItem.text);
    const taskId = taskItem.id || `daily-${taskItem.originalIndex}-${Date.now()}`; // Ensure an ID

    return {
      id: taskId,
      category: taskItem.category || 'general',
      taskName: taskName,
      intensity: intensity,
      is_daily: true,
      XP: 500, // Default XP for daily tasks
      is_Recurrent: false, // Daily tasks from Quest.json are not typically recurrent by default in this structure
      Recurrent_frequency: [0, 0, 0, 0, 0, 0, 0],
      start_time: '00:00', // Default start time
      note: '', // Default empty note
      status: taskItem.status,
      // completed_at, day, taskKey, intensityKey can be undefined or set if available
      // For daily tasks from Quest.json, taskKey/intensityKey might not be directly applicable
      // unless Quest.json is also mapped to TaskLibrary structure.
      originalIndex: taskItem.originalIndex, // Keep for callbacks if needed
    } as TaskData & { originalIndex: number }; // Add originalIndex to the mapped type for temporary use
  });


  return (
    <>
      {mappedTasks.map((mappedTask) => {
        // Find the original index using the id or the temporary originalIndex from mappedTask
        // This assumes mappedTask.id is unique and reliable.
        // Or, if we are certain about the order, mappedTask.originalIndex can be used directly.
        const taskOriginalIndex = (mappedTask as any).originalIndex; // Accessing the temporarily added originalIndex

        return (
          <TaskBoxModal
            key={mappedTask.id}
            task={mappedTask}
            theme={theme}
            onComplete={() => onTaskComplete(taskOriginalIndex)} // Pass original index
            onCancel={() => onTaskCancel(taskOriginalIndex)}     // Pass original index
            onLongPress={() => onTaskLongPress(taskOriginalIndex, mappedTask)} // Pass original index and mapped TaskData
            onPress={() => onTaskEdit(mappedTask)} // Pass mapped TaskData for editing
          />
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  // Styles for TaskDisplay, leftAction, rightAction, taskWrapper, longPressHint can be removed
  // as they are no longer used. Keep noTasksContainer and noTasksText.
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
  // Removed old styles: taskWrapper, taskText, longPressHint, leftAction, rightAction, actionText
});

export default DailyTaskInput;