import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AdditionalTask, TaskData } from '../types/UserTypes';
import TaskBoxModal from './Task_modal/TaskBoxModal';

interface AdditionalTaskDisplayProps {
  tasks: AdditionalTask[];
  theme: any;
  onTaskComplete?: (index: number) => void;
  onTaskCancel?: (index: number) => void;
  onTaskLongPress?: (index: number, taskItem: TaskData) => void;
  onTaskEdit?: (taskItem: TaskData) => void;
}

// Helper function to parse task text (e.g., "Task Name (intensity)")
// This was missing from the previous version of the file provided.
const parseAdditionalTaskText = (text: string): { taskName: string; intensity: string } => {
  const intensityRegex = /\(([^)]+)\)$/; // Matches content in parentheses at the end
  const match = text.match(intensityRegex);
  if (match && match[1]) {
    const taskName = text.replace(intensityRegex, '').trim();
    const intensity = match[1].trim();
    return { taskName, intensity };
  }
  // If no specific intensity in parentheses, the whole text is the name
  return { taskName: text.trim(), intensity: 'Standard' }; // Default intensity if not parsed
};

const AdditionalTaskDisplay = ({ 
  tasks, 
  theme,
  onTaskComplete = () => {},
  onTaskCancel = () => {},
  onTaskLongPress = () => {},
  onTaskEdit = () => {},
}: AdditionalTaskDisplayProps) => {
  
  const validTasks = (tasks || [])
    .map((task, index) => ({ ...task, originalIndex: index }))
    // Corrected filter condition: using item.text directly
    .filter(item => item.text && item.text.trim() !== '');

  if (validTasks.length === 0) return null;
  
  const mappedTasks: TaskData[] = validTasks.map(taskItem => {
    const { taskName, intensity } = parseAdditionalTaskText(taskItem.text);
    
    let taskCategory: TaskData['category'] = 'general';
    if (taskItem.category && ['fitness', 'learning', 'mindfulness', 'social', 'creativity'].includes(taskItem.category)) {
      taskCategory = taskItem.category as TaskData['category'];
    }

    return {
      id: taskItem.id,
      category: taskCategory,
      taskName: taskName,
      intensity: intensity,
      is_daily: false,
      XP: 250,
      is_Recurrent: false,
      Recurrent_frequency: [0, 0, 0, 0, 0, 0, 0],
      start_time: '00:00',
      note: '',
      status: taskItem.completed ? 'completed' : 'default',
      completed_at: taskItem.completed ? Date.now() : undefined,
      image: taskItem.image,
      showImage: taskItem.showImage,
      taskKey: taskItem.taskKey,
      intensityKey: taskItem.intensityKey,
      color: taskItem.color,
      originalIndex: taskItem.originalIndex,
    } as TaskData & { originalIndex: number };
  });

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionHeaderText, { color: theme.subtext }]}>
          Additional Tasks
        </Text>
      </View>
      
      {mappedTasks.map((mappedTask) => {
        const taskOriginalIndex = (mappedTask as any).originalIndex;

        if (mappedTask.status === 'completed') {
            return null; 
        }

        return (
          <TaskBoxModal
            key={mappedTask.id}
            task={mappedTask}
            theme={theme}
            onComplete={() => onTaskComplete(taskOriginalIndex)}
            onCancel={() => onTaskCancel(taskOriginalIndex)}
            onLongPress={() => onTaskLongPress(taskOriginalIndex, mappedTask)}
            onPress={() => onTaskEdit(mappedTask)}
          />
        );
      })}
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
});

export default AdditionalTaskDisplay;
