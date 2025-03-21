import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface TaskItem {
  text: string;
  image?: string | null;
  completed?: boolean;
  showImage?: boolean;
}

interface DailyTaskInputProps {
  tasks: TaskItem[];
  theme: any;
  onChangeTask?: (index: number, text: string) => void;
  editable?: boolean;
  onPickImage?: (index: number) => void;
  onToggleImageVisibility?: (index: number) => void;
}

const DailyTaskInput = ({ 
  tasks, 
  theme, 
  onChangeTask,
  editable = false,
  onPickImage,
  onToggleImageVisibility
}: DailyTaskInputProps) => {
  
  if (tasks.length === 0) return null;
  
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionHeaderText, { color: theme.subtext }]}>
          Daily Tasks
        </Text>
      </View>
      
      {tasks.filter(task => task.text && task.text.trim() !== '').map((task, index) => (
        editable ? (
          // Enhanced version for AddTaskScreen with photo functionality
          <View 
            key={`daily-${index}`} 
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
            <View style={[styles.taskHeader, { backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)' }]}>
              <Text style={[styles.taskTitle, { color: theme.text }]}>Daily Task {index + 1}</Text>
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
                onChangeText={(text) => onChangeTask && onChangeTask(index, text)}
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
          // Simple version for HomepageScreen
          <TextInput
            key={`task-${index}`}
            style={[
              styles.input, 
              { 
                color: theme.text,
                backgroundColor: theme.boxBackground,
                borderColor: theme.border
              }
            ]}
            value={task.text}
            onChangeText={(text) => onChangeTask && onChangeTask(index, text)}
            placeholder={`Task ${index + 1}`}
            placeholderTextColor={theme.mode === 'dark' ? '#777' : '#aaa'}
            multiline={true}
          />
        )
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  // Styles for addtask page
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
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default DailyTaskInput;
