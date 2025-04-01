import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Animated, TouchableWithoutFeedback } from 'react-native';
import { AdditionalTask } from '../types/UserTypes';
import WeeklyTrialBox, { useBoxTextColor } from './WeeklyTrialBox';
import { Swipeable } from 'react-native-gesture-handler';
import AnimatedSpriteIcon from './AnimatedSpriteIcon';

interface AdditionalTaskDisplayProps {
  tasks: AdditionalTask[];
  theme: any; // Replace with proper theme type if available
  editable?: boolean;
  onChangeTask?: (index: number, text: string) => void;
  onDeleteTask?: (index: number) => void;
  onPickImage?: (index: number) => void;
  onToggleImageVisibility?: (index: number) => void;
  onTaskComplete?: (index: number) => void;
  onTaskCancel?: (index: number) => void;
  onTaskLongPress?: (index: number, text: string) => void;
}

// Component for the content of the additional task box
const AdditionalTaskContent = ({ 
  text,
  onLongPress,
  category
}: { 
  text: string;
  onLongPress?: () => void;
  category?: string;
}) => {
  // Use the box text color from context
  const textColor = useBoxTextColor();
  
  return (
    <TouchableWithoutFeedback onLongPress={onLongPress}>
      <View style={{ width: '100%' }}>
        <Text style={[styles.taskText, { color: textColor }]}>
          {text}
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

const AdditionalTaskDisplay = ({ 
  tasks, 
  theme,
  editable = false,
  onChangeTask,
  onDeleteTask,
  onPickImage,
  onToggleImageVisibility,
  onTaskComplete = () => {},
  onTaskCancel = () => {},
  onTaskLongPress
}: AdditionalTaskDisplayProps) => {
  if (tasks.length === 0) return null;
  
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionHeaderText, { color: theme.subtext }]}>
          Additional Tasks
        </Text>
      </View>
      
      {tasks
        .map((task, index) => ({ task, index }))
        .filter(item => item.task.text && item.task.text.trim() !== '')
        .map(({ task, index }) => (
          editable ? (
            // Enhanced version for AddTaskScreen with full functionality
            <View 
              key={task.id || `additional-editable-${index}`}
              style={[
                styles.taskContainer, 
                task.completed ? 
                  [styles.completedTaskDaily, { 
                    backgroundColor: theme.mode === 'dark' ? 'rgba(0, 150, 0, 0.2)' : 'rgba(0, 150, 0, 0.1)',
                    borderColor: theme.mode === 'dark' ? 'rgba(0, 180, 0, 0.3)' : 'rgba(0, 150, 0, 0.5)'
                  }] : 
                  [styles.dailyTaskContainer, { 
                    backgroundColor: theme.mode === 'dark' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 0, 0, 0.05)',
                    borderColor: theme.mode === 'dark' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 0, 0, 0.15)'
                  }]
              ]}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleContainer}>
                  {onDeleteTask && (
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => onDeleteTask(index)}
                    >
                      <Image 
                        source={require('../../assets/icons/recycle-bin-icon-trash-bin-icon-png.png')} 
                        style={[styles.deleteButtonIcon, { tintColor: theme.mode === 'dark' ? 'white' : 'white' }]} 
                      />
                    </TouchableOpacity>
                  )}
                  <Text style={[styles.taskTitle, { color: theme.text }]}>Extra Task {index + 1}</Text>
                </View>
                {onPickImage && (
                  <TouchableOpacity 
                    style={[styles.photoButton, { backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)' }]}
                    onPress={() => onPickImage(index)}
                  >
                    <Text style={[styles.photoButtonText, { color: theme.text }]}>➕ Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.taskContent}>
                <TextInput
                  style={[styles.taskInput, { color: theme.text }]}
                  value={task.text}
                  onChangeText={(text: string) => onChangeTask && onChangeTask(index, text)}
                  multiline={true}
                  textAlign="center"
                  editable={false}
                />
                
                {task.image && task.showImage && (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: task.image }} 
                      style={styles.taskImage} 
                    />
                  </View>
                )}
                
                {task.image && onToggleImageVisibility && (
                  <TouchableOpacity 
                    style={[styles.showProofButton, { backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)' }]}
                    onPress={() => onToggleImageVisibility(index)}
                  >
                    <Text style={[styles.showProofText, { color: theme.text }]}>
                      {task.showImage ? 'Hide Picture of Proof' : 'Show Picture of Proof'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            // Normal version for Homepage with swipe functionality and long press for timer
            <Swipeable
              key={task.id || `additional-${index}`}
              renderRightActions={(progress: Animated.AnimatedInterpolation<number>) => DeleteAction(progress, theme)}
              renderLeftActions={(progress: Animated.AnimatedInterpolation<number>) => CompleteAction(progress, theme)}
              onSwipeableRightOpen={() => onTaskCancel(index)}
              onSwipeableLeftOpen={() => onTaskComplete(index)}
            >
              <WeeklyTrialBox 
                title={`Additional Task ${index + 1}`}
                category={task.category}
              >
                <AdditionalTaskContent 
                  text={task.text} 
                  onLongPress={() => onTaskLongPress && onTaskLongPress(index, task.text)}
                  category={task.category}
                />
              </WeeklyTrialBox>
            </Swipeable>
          )
        ))
      }
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
  timerHintText: {
    fontSize: 12,
    marginLeft: 5,
    fontStyle: 'italic',
    marginTop: 2,
  },
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
  // Styles for addTaskScreen
  taskContainer: {
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
  },
  completedTaskDaily: {
    opacity: 0.8,
  },
  dailyTaskContainer: {
    opacity: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginRight: 10,
  },
  deleteButtonIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  photoButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  photoButtonText: {
    fontSize: 12,
  },
  taskContent: {
    padding: 10,
    alignItems: 'center',
  },
  taskInput: {
    width: '100%',
    paddingVertical: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  imageContainer: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  taskImage: {
    width: '90%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  showProofButton: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  showProofText: {
    fontSize: 12,
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

export default AdditionalTaskDisplay;
