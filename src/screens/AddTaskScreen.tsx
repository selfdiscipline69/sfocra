import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView,
  Platform, Keyboard, TouchableWithoutFeedback, Image, Alert, Modal, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { saveHomepageTasks } from '../utils/taskStorage';
import { loadTasksFromStorage } from '../utils/taskLoader';
import { requestMediaLibraryPermissions } from '../utils/mediaPermissions';
import { selectImage } from '../utils/imagePickerUtils';
import { updateTaskWithImage } from '../utils/taskImageUtils';
import questsData from '../../assets/Quest.json';
import { createStyles } from '../styles/addTaskStyles';
import { imageVisibilityUtils } from '../utils/imageVisibilityUtils';
import WeeklyTrialBox from '../components/WeeklyTrialBox';

// Move all your interfaces and component implementation here
const { width } = Dimensions.get('window');

// Define TypeScript interfaces for task types
interface TaskItem {
  text: string;
  image: string | null;
  completed: boolean;
  showImage: boolean;
}

interface WeeklyTrialItem {
  text: string;
  image: string | null;
  completed: boolean;
  showImage: boolean;
}

interface VisibleImagesState {
  weekly: boolean;
  daily: Record<number, boolean>;
  additional: Record<number, boolean>;
}

const AddTaskScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  // Copy all your state declarations here
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [weeklyTrial, setWeeklyTrial] = useState<WeeklyTrialItem>({
    text: '',
    image: null,
    completed: false,
    showImage: false
  });
  const [additionalTasks, setAdditionalTasks] = useState<TaskItem[]>([]);
  const [userToken, setUserToken] = useState<string>('');
  const [visibleImages, setVisibleImages] = useState<VisibleImagesState>({
    weekly: false,
    daily: {},
    additional: {}
  });
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [randomTask, setRandomTask] = useState<string>('');
  const [customTask, setCustomTask] = useState<string>('');
  const [randomTaskDuration, setRandomTaskDuration] = useState<number>(30);
  const [customTaskDuration, setCustomTaskDuration] = useState<string>('30');
  const [randomTaskCategory, setRandomTaskCategory] = useState<string>('General');
  const [customTaskCategory, setCustomTaskCategory] = useState<string>('General');
  const [customTaskTime, setCustomTaskTime] = useState<string>('');

  
  // Copy all your functions and effects here
  useEffect(() => {
    loadTasks();
    requestMediaLibraryPermissions();

    // Save homepage tasks to AsyncStorage for reference in this screen
    saveHomepageTasks();
  }, []);
  
  const loadTasks = async () => {
    try {
      const loadedData = await loadTasksFromStorage();
      setUserToken(loadedData.userToken);
      setWeeklyTrial(loadedData.weeklyTrial);
      setTasks(loadedData.tasks);
      setAdditionalTasks(loadedData.additionalTasks);
    } catch (error) {
      console.error('Error in loadTasks:', error);
      // Initialize with empty arrays in case of error
      setTasks([]);
      setWeeklyTrial({
        text: '',
        image: null,
        completed: false,
        showImage: false
      });
      setAdditionalTasks([]);
    }
  };

  const saveTasks = async () => {
    try {
      if (userToken) {
        await AsyncStorage.setItem(`weeklyTrial_${userToken}`, JSON.stringify(weeklyTrial));
        await AsyncStorage.setItem(`dailyTasks_${userToken}`, JSON.stringify(tasks));
        await AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(additionalTasks));
      }
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const handleTaskChange = (index: number, text: string) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], text };
    setTasks(updatedTasks);
    saveTasks();
  };

  const handleAdditionalTaskChange = (index: number, text: string) => {
    const updated = [...additionalTasks];
    updated[index] = { ...updated[index], text };
    setAdditionalTasks(updated);
    saveTasks();
  };

  const handleWeeklyTrialChange = (text: string) => {
    setWeeklyTrial(prev => ({ ...prev, text }));
    saveTasks();
  };

  const pickImage = async (type: string, index?: number) => {
    const selectedImage = await selectImage();
    
    if (selectedImage) {
      // Use the extracted utility function
      updateTaskWithImage(
        type, 
        selectedImage, 
        index, 
        {
          weeklyTrial,
          setWeeklyTrial,
          tasks,
          setTasks,
          additionalTasks,
          setAdditionalTasks
        },
        saveTasks
      );
    }
  };

  const toggleImageVisibility = (type: string, index?: number) => {
    imageVisibilityUtils.toggleImageVisibility(
      type,
      index,
      {
        weeklyTrial,
        setWeeklyTrial,
        tasks,
        setTasks,
        additionalTasks,
        setAdditionalTasks
      }
    );
  };

  // Generate a random task for the modal
  const generateRandomTask = () => {
    if (questsData.length > 0) {
      const randomIndex = Math.floor(Math.random() * questsData.length);
      const randomQuest = questsData[randomIndex];
      
      setRandomTask(randomQuest.task || "Task");
      setRandomTaskDuration(randomQuest.duration_minutes || 30);
      setRandomTaskCategory(randomQuest.category || "General");
      
      return {
        task: randomQuest.task || "Task",
        duration: randomQuest.duration_minutes || 30,
        category: randomQuest.category || "General"
      };
    }
    return {
      task: "New task",
      duration: 30,
      category: "General"
    };
  };

  // Modified addNewTask function to show the modal
  const addNewTask = () => {
    try {
      const randomTaskInfo = generateRandomTask();
      setRandomTask(randomTaskInfo.task);
      setRandomTaskDuration(randomTaskInfo.duration);
      setRandomTaskCategory(randomTaskInfo.category);
      setCustomTask('');
      setCustomTaskDuration('30');
      setCustomTaskCategory('General');
      setCustomTaskTime(''); // Reset the time field
      setModalVisible(true);
    } catch (error) {
      console.error('Error preparing to add new task:', error);
    }
  };

  // Function to add the selected random task
  const addRandomTask = async () => {
    try {
      const formattedQuest = `${randomTask} (${randomTaskDuration} min) - ${randomTaskCategory}`;
      const newTask: TaskItem = {
        text: formattedQuest,
        image: null,
        completed: false,
        showImage: false
      };
      
      const updatedTasks = [...additionalTasks, newTask];
      setAdditionalTasks(updatedTasks);
      
      // Save with await to ensure completion
      if (userToken) {
        await AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks));
        console.log('Tasks saved after adding random task:', JSON.stringify(updatedTasks));
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding random task:', error);
    }
  };

  // Function to add the custom task
  const addCustomTask = async () => {
    try {
      if (customTask.trim() === '') {
        Alert.alert('Error', 'Please enter a task description');
        return;
      }
      
      const duration = parseInt(customTaskDuration) || 30;
      // Include time in the formatted task if provided
      const timeInfo = customTaskTime.trim() ? ` at ${customTaskTime}` : '';
      const formattedQuest = `${customTask}${timeInfo} (${duration} min) - ${customTaskCategory}`;
      const newTask: TaskItem = {
        text: formattedQuest,
        image: null,
        completed: false,
        showImage: false
      };
      
      const updatedTasks = [...additionalTasks, newTask];
      setAdditionalTasks(updatedTasks);
      
      // Save with await to ensure completion
      if (userToken) {
        await AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks));
        console.log('Tasks saved after adding custom task:', JSON.stringify(updatedTasks));
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding custom task:', error);
    }
  };

  // Improve the handleDeleteTask function to ensure AsyncStorage is updated properly

  const handleDeleteTask = (index: number) => {
    // Show confirmation alert before deleting
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Remove task at specified index
              const updatedTasks = [...additionalTasks];
              updatedTasks.splice(index, 1);
              setAdditionalTasks(updatedTasks);
              
              // Save to AsyncStorage with await to ensure it completes
              if (userToken) {
                await AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks));
                console.log('Tasks saved after deletion:', JSON.stringify(updatedTasks));
              }
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: theme.background }]} // Apply theme background
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <Text style={[styles.instructionText, { color: theme.text }]}>
              Upload photos to mark your completed tasks
            </Text>
            
            <ScrollView 
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Weekly Trial Box - Only show if text is not empty */}
              {weeklyTrial.text && weeklyTrial.text.trim() !== '' && (
                <View style={[
                  styles.taskContainer, 
                  weeklyTrial.completed ? 
                    [styles.completedTaskWeekly, { borderColor: theme.mode === 'dark' ? 'rgba(0, 180, 0, 0.4)' : 'rgba(0, 150, 0, 0.8)' }] : 
                    [styles.weeklyTaskContainer, { 
                      backgroundColor: theme.mode === 'dark' ? 'rgba(180, 0, 0, 0.2)' : 'rgba(255, 0, 0, 0.1)',
                      borderColor: theme.mode === 'dark' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 0, 0, 0.2)' 
                    }]
                ]}>
                  <View style={[styles.taskHeader, { backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)' }]}>
                    <Text style={[styles.taskTitle, { color: theme.text }]}>Weekly Trial</Text>
                    <TouchableOpacity 
                      style={[styles.photoButton, { backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)' }]}
                      onPress={() => pickImage('weekly')}
                    >
                      <Text style={[styles.photoButtonText, { color: theme.text }]}>➕ Photo</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.taskContent}>
                    <TextInput
                      style={[styles.taskInput, { color: theme.text }]}
                      value={weeklyTrial.text}
                      onChangeText={handleWeeklyTrialChange}
                      multiline={true}
                      textAlign="center"
                      editable={false}
                    />
                    
                    {weeklyTrial.image && weeklyTrial.showImage && (
                      <View style={styles.imageContainer}>
                        <Image 
                          source={{ uri: weeklyTrial.image }} 
                          style={styles.taskImage} 
                        />
                      </View>
                    )}
                    
                    {weeklyTrial.image && (
                      <TouchableOpacity 
                        style={[styles.showProofButton, { backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)' }]}
                        onPress={() => toggleImageVisibility('weekly')}
                      >
                        <Text style={[styles.showProofText, { color: theme.text }]}>
                          {weeklyTrial.showImage ? 'Hide Picture of Proof' : 'Show Picture of Proof'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Daily Tasks - Only show non-empty tasks */}
              {tasks.filter(task => task.text && task.text.trim() !== '').map((task, index) => (
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
                    <TouchableOpacity 
                      style={[styles.photoButton, { backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)' }]}
                      onPress={() => pickImage('daily', index)}
                    >
                      <Text style={[styles.photoButtonText, { color: theme.text }]}>➕ Photo</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.taskContent}>
                    <TextInput
                      style={[styles.taskInput, { color: theme.text }]}
                      value={task.text}
                      onChangeText={(text) => handleTaskChange(index, text)}
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
                    
                    {task.image && (
                      <TouchableOpacity 
                        style={[styles.showProofButton, { backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)' }]}
                        onPress={() => toggleImageVisibility('daily', index)}
                      >
                        <Text style={[styles.showProofText, { color: theme.text }]}>
                          {task.showImage ? 'Hide Picture of Proof' : 'Show Picture of Proof'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}

              {/* Additional Tasks - Only show non-empty tasks */}
              {additionalTasks.filter(task => task.text && task.text.trim() !== '').map((task, index) => (
                <View 
                  key={`additional-${index}`} 
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
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTask(index)}
                      >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                      </TouchableOpacity>
                      <Text style={[styles.taskTitle, { color: theme.text }]}>Extra Task {index + 1}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.photoButton, { backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)' }]}
                      onPress={() => pickImage('additional', index)}
                    >
                      <Text style={[styles.photoButtonText, { color: theme.text }]}>➕ Photo</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.taskContent}>
                    <TextInput
                      style={[styles.taskInput, { color: theme.text }]}
                      value={task.text}
                      onChangeText={(text) => handleAdditionalTaskChange(index, text)}
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
                    
                    {task.image && (
                      <TouchableOpacity 
                        style={[styles.showProofButton, { backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)' }]}
                        onPress={() => toggleImageVisibility('additional', index)}
                      >
                        <Text style={[styles.showProofText, { color: theme.text }]}>
                          {task.showImage ? 'Hide Picture of Proof' : 'Show Picture of Proof'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}

              {/* Add New Task Button */}
              <TouchableOpacity 
                style={[styles.addTaskButton, { backgroundColor: theme.mode === 'dark' ? '#444' : '#ccc' }]}
                onPress={addNewTask}
              >
                <Text style={[styles.addTaskText, { color: theme.text }]}>+ Add New Extra Task</Text>
              </TouchableOpacity>

              {/* Task Choice Modal */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={[styles.modalContent, { backgroundColor: theme.boxBackground }]}>
                      <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Your Task</Text>
                      
                      {/* Random Task Option */}
                      <View style={styles.taskOptionContainer}>
                        <Text style={[styles.taskOptionTitle, { color: theme.text }]}>Suggested Task:</Text>
                        <Text style={[styles.taskOptionText, { color: theme.text }]}>
                          {randomTask} ({randomTaskDuration} min) - {randomTaskCategory}
                        </Text>
                        <TouchableOpacity 
                          style={styles.taskOptionButton}
                          onPress={addRandomTask}
                        >
                          <Text style={styles.taskOptionButtonText}>Use This Task</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.modalDivider} />
                      
                      {/* Custom Task Option - Updated with Time Field */}
                      <View style={styles.taskOptionContainer}>
                        <Text style={[styles.taskOptionTitle, { color: theme.text }]}>Create Your Own:</Text>
                        <TextInput
                          style={[styles.taskOptionInput, { color: theme.text }]}
                          placeholder="Enter your task description"
                          placeholderTextColor="#999"
                          value={customTask}
                          onChangeText={setCustomTask}
                        />
                        
                        <View style={styles.taskDetailsRow}>
                          <View style={styles.taskDetailItem}>
                            <Text style={[styles.taskDetailLabel, { color: theme.text }]}>Duration (min):</Text>
                            <TextInput
                              style={[styles.taskDetailInput, { color: theme.text }]}
                              keyboardType="numeric"
                              value={customTaskDuration}
                              onChangeText={setCustomTaskDuration}
                            />
                          </View>
                          
                          <View style={styles.taskDetailItem}>
                            <Text style={[styles.taskDetailLabel, { color: theme.text }]}>Category:</Text>
                            <TextInput
                              style={[styles.taskDetailInput, { color: theme.text }]}
                              value={customTaskCategory}
                              onChangeText={setCustomTaskCategory}
                            />
                          </View>
                        </View>
                        
                        {/* New Time Input Field */}
                        <View style={styles.timeInputContainer}>
                          <Text style={[styles.taskDetailLabel, { color: theme.text }]}>Time (optional):</Text>
                          <TextInput
                            style={[styles.taskDetailInput, { color: theme.text }]}
                            placeholder="e.g., 8:00 AM"
                            placeholderTextColor="#777"
                            value={customTaskTime}
                            onChangeText={setCustomTaskTime}
                          />
                        </View>
                        
                        <TouchableOpacity 
                          style={styles.taskOptionButton}
                          onPress={addCustomTask}
                        >
                          <Text style={styles.taskOptionButtonText}>Create Custom Task</Text>
                        </TouchableOpacity>
                      </View>
                      
                      {/* Cancel Button */}
                      <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </Modal>
            </ScrollView>

            {/* Bottom Navigation Icons - Updated to match settings.tsx */}
            <View style={[styles.bottomNav, { 
              backgroundColor: theme.background, 
              borderColor: theme.border 
            }]}>
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/performance')}
                style={styles.navButton}
              >
                <FontAwesome5 name="chart-line" size={22} color={theme.text} />
              </TouchableOpacity>
              
              {/* Home button */}
              <TouchableOpacity 
                style={styles.homeButton} 
                onPress={() => router.push('/(tabs)/homepage')}
              >
                <Text style={styles.homeButtonText}>Home</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/settings')}
                style={styles.navButton}
              >
                <Ionicons name="settings-outline" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
  );
};

export default AddTaskScreen;