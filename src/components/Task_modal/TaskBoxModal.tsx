import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Pressable, // Use Pressable for better feedback on press/long press
  TouchableWithoutFeedback // Alternative if Pressable feedback is not desired
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { TaskData } from '../../types/UserTypes'; // Import the unified TaskData interface
import WeeklyTrialBox, { useBoxTextColor } from '../WeeklyTrialBox'; // Reuse the styled box

// Import category animation components (assuming they exist or will be created)
// Example imports - replace with actual component names/paths
import AnimatedFitnessIcon from '../AnimatedSpriteIcon'; 
import AnimatedLearningIcon from '../../components/AnimatedLearningIcon';
import AnimatedMindfulnessIcon from '../../components/AnimatedMindfulnessIcon';
import AnimatedSocialIcon from '../../components/AnimatedSocialIcon';
import AnimatedCreativityIcon from '../../components/AnimatedCreativityIcon';
import PixelArtIcon from '../../components/PixelArtIcon'; // For 'general' or other categories

// Define props for the TaskBoxModal component
interface TaskBoxModalProps {
  task: TaskData; // Expect the unified TaskData object
  theme: any; // Pass theme for styling
  onComplete?: (id: string) => void; // Callback for swipe complete
  onCancel?: (id: string) => void;   // Callback for swipe cancel
  onLongPress?: (task: TaskData) => void; // Callback for long press (timer)
  onPress?: (task: TaskData) => void;   // Callback for single press (edit modal)
}

// --- Swipe Action Components (Reused from DailyTaskInput/AdditionalTaskDisplay logic) ---

// Swipe right action (Cancel)
const CancelAction = (progress: Animated.AnimatedInterpolation<number>, theme: any) => {
  const trans = progress.interpolate({ inputRange: [0, 1], outputRange: [100, 0] });
  return (
    <Animated.View style={[styles.rightAction, { backgroundColor: theme.mode === 'dark' ? '#D13030' : '#FF3B30', transform: [{ translateX: trans }] }]}>
      <Text style={styles.actionText}>Cancel</Text>
    </Animated.View>
  );
};

// Swipe left action (Complete)
const CompleteAction = (progress: Animated.AnimatedInterpolation<number>, theme: any) => {
  const trans = progress.interpolate({ inputRange: [0, 1], outputRange: [-100, 0] });
  return (
    <Animated.View style={[styles.leftAction, { backgroundColor: theme.mode === 'dark' ? '#30A030' : '#34C759', transform: [{ translateX: trans }] }]}>
      <Text style={styles.actionText}>Done</Text>
    </Animated.View>
  );
};

// --- Helper to format Recurrence Frequency array ---
const formatRecurrence = (frequency: number[]): string => {
  if (!frequency || frequency.length !== 7 || frequency.every(day => day === 0)) {
    return ''; // Return empty if no recurrence or invalid array
  }
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activeDays = frequency
    .map((active, index) => (active === 1 ? days[index] : null))
    .filter(day => day !== null);
  
  if (activeDays.length === 7) return 'Every Day';
  if (activeDays.length === 0) return ''; // Should not happen if initial check passes, but safe fallback

  return `Every ${activeDays.join(', ')}`;
};

// --- Main Task Box Component ---
const TaskBoxModal: React.FC<TaskBoxModalProps> = ({
  task,
  theme,
  onComplete = () => {},
  onCancel = () => {},
  onLongPress = () => {},
  onPress = () => {},
}) => {
  // Determine the task type label based on the is_daily flag
  const taskTypeLabel = task.is_daily ? 'Daily Task' : 'Additional Task';

  // Determine category for styling and animation (default to general if unknown)
  const displayCategory = ['fitness', 'learning', 'mindfulness', 'social', 'creativity'].includes(task.category?.toLowerCase()) 
                          ? task.category.toLowerCase() as 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity'
                          : 'general';

  // Helper function to render the correct category animation
  const renderCategoryAnimation = () => {
    const size = 75; // Adjust size as needed
    switch (displayCategory) {
      case 'fitness': return <AnimatedFitnessIcon size={size} />;
      case 'learning': return <AnimatedLearningIcon size={size} />;
      case 'mindfulness': return <AnimatedMindfulnessIcon size={size} />;
      case 'social': return <AnimatedSocialIcon size={size} />;
      case 'creativity': return <AnimatedCreativityIcon size={size} />;
      // Default or 'general' case - using PixelArtIcon as a fallback
      default: 
        // Ensure the category passed to PixelArtIcon matches its expected type
        const pixelArtCategory = ['fitness', 'learning', 'mindfulness', 'social', 'creativity'].includes(task.category?.toLowerCase())
          ? task.category as 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity' // Cast if it's a known specific category
          : undefined; // Pass undefined if it's 'general' or another string
        return <PixelArtIcon category={pixelArtCategory} size={24} color={useBoxTextColor()} />; 
    }
  };

  // Format the recurrence frequency string
  const recurrenceString = task.is_Recurrent ? formatRecurrence(task.Recurrent_frequency) : '';

  return (
    <Swipeable
      key={`task-${task.id}`} // Use unique ID for key
      renderRightActions={(progress: Animated.AnimatedInterpolation<number>) => CancelAction(progress, theme)}
      renderLeftActions={(progress: Animated.AnimatedInterpolation<number>) => CompleteAction(progress, theme)}
      onSwipeableRightOpen={() => onCancel(task.id)} // Pass task ID or full task object
      onSwipeableLeftOpen={() => onComplete(task.id)} // Pass task ID or full task object
      enabled={task.status === 'default'} // Only enable swipe for default status tasks
      containerStyle={styles.swipeableContainer} // Style the swipeable container itself if needed
    >
      {/* Use WeeklyTrialBox for consistent styling, passing category for color */}
      <WeeklyTrialBox 
        title="" // Title is handled internally now
        category={displayCategory === 'general' ? undefined : displayCategory} 
        // Remove onPress from WeeklyTrialBox if activating via Pressable below
        // onPress={() => onPress(task)} 
      >
        {/* Use Pressable to capture single tap and long press on the content area */}
        <Pressable
          onPress={() => onPress(task)}
          onLongPress={() => onLongPress(task)}
          delayLongPress={300} // Standard delay for long press
          style={styles.pressableContent} // Make Pressable cover the content area
        >
          {/* Top Row: Task Type and Category Animation */}
          <View style={styles.topRow}>
            <Text style={[styles.taskTypeLabel, { color: useBoxTextColor() }]}>
              {taskTypeLabel}
            </Text>
            <View style={styles.categoryAnimationContainer}>
              {renderCategoryAnimation()}
            </View>
          </View>

          {/* Main Content Area */}
          <View style={styles.contentArea}>
            {/* Display Category Name */}
            <Text style={[styles.detailText, styles.categoryText, { color: useBoxTextColor() }]}>
              Category: {task.category.charAt(0).toUpperCase() + task.category.slice(1)} 
            </Text>
            {/* Display Task Name */}
            <Text style={[styles.detailText, styles.taskNameText, { color: useBoxTextColor() }]}>
              {task.taskName}
            </Text>
            {/* Display Intensity */}
            <Text style={[styles.detailText, styles.intensityText, { color: useBoxTextColor() }]}>
              Intensity: {task.intensity}
            </Text>
            {/* Display Recurrence Info (conditionally) */}
            {task.is_Recurrent && recurrenceString && (
              <Text style={[styles.detailText, styles.recurrenceText, { color: useBoxTextColor() }]}>
                {recurrenceString}
              </Text>
            )}
          </View>

          {/* Bottom Row: Start Time and Hint */}
          <View style={styles.bottomRow}>
            {/* Display Start Time (if provided and not default "00:00") */}
            {task.start_time && task.start_time !== '00:00' && (
              <Text style={[styles.startTimeText, { color: useBoxTextColor() }]}>
                Start: {task.start_time}
              </Text>
            )}
            {/* Spacer to push hint to the right if start time is present */}
            {task.start_time && task.start_time !== '00:00' && <View style={{ flex: 1 }} />} 
            
            {/* Hint Text */}
            <Text style={[styles.hintText, { color: useBoxTextColor(), opacity: 0.7 }]}>
              Swipe | Long press for timer
            </Text>
          </View>
        </Pressable>
      </WeeklyTrialBox>
    </Swipeable>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: 0, // Reset margin if WeeklyTrialBox already has it
    width: '100%',
  },
  pressableContent: {
    // Styles for the pressable area covering the WeeklyTrialBox content
    // Padding might be inherited from WeeklyTrialBox, adjust if needed
    // No background color needed here, relies on WeeklyTrialBox
    minHeight: 100, // Ensure minimum height for interaction
    justifyContent: 'space-between', // Distribute content vertically
    width: '100%', // Ensure it takes full width
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align items to the top
    marginBottom: 8,
    minHeight: 30, // Ensure space for animation/label
  },
  taskTypeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    // Add padding/margin if needed
  },
  categoryAnimationContainer: {
    // Position the animation container if needed (e.g., absolute positioning)
    // Ensure it doesn't overlap content undesirably
    position: 'absolute',
    top: -15, // Adjust positioning relative to the box edge
    right: -5, // Adjust positioning relative to the box edge
    opacity: 0.9, // Slightly transparent
  },
  contentArea: {
    alignItems: 'flex-start', // Align text to the left
    marginBottom: 10, // Space before bottom row
    paddingRight: 40, // Ensure text doesn't overlap animation excessively
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 2, // Small spacing between details
    textAlign: 'left',
  },
  categoryText: {
     fontSize: 13,
     opacity: 0.8,
  },
  taskNameText: {
    fontSize: 16,
    fontWeight: '600', // Slightly bolder task name
  },
  intensityText: {
     fontSize: 14,
  },
   recurrenceText: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Pushes items to ends
    alignItems: 'flex-end', // Align items to the bottom
    marginTop: 'auto', // Pushes the row to the bottom of the flex container
    width: '100%', // Take full width
  },
  startTimeText: {
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  hintText: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'right', // Align hint to the right
  },
  // Styles for Swipe Actions (copied from previous components)
  leftAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 15, // Match WeeklyTrialBox margin
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingLeft: 20,
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 15, // Match WeeklyTrialBox margin
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingRight: 20,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default TaskBoxModal; 