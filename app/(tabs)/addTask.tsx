import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import questsData from '../../assets/Quest.json';
import { FontAwesome5, Ionicons } from '@expo/vector-icons'; // Import vector icons
import { useTheme } from '../context/ThemeContext'; // Import the theme hook

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

export default function AddTaskScreen() {
  const router = useRouter();
  const { theme } = useTheme(); // Use the theme context
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

  // Load user data and tasks on component mount
  useEffect(() => {
    loadTasks();
    requestMediaLibraryPermissions();
    
    // Save homepage tasks to AsyncStorage for reference in this screen
    saveHomepageTasks();
  }, []);

  // Function to save homepage tasks to AsyncStorage for reference
  const saveHomepageTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Get weekly trial from homepage
        const weeklyTrialValue = await AsyncStorage.getItem('weeklyTrial');
        if (weeklyTrialValue) {
          await AsyncStorage.setItem(`homepageWeeklyTrial_${token}`, weeklyTrialValue);
        }
        
        // Get daily tasks from homepage
        const dailyTasks = await AsyncStorage.getItem('dailyTasks');
        if (dailyTasks) {
          await AsyncStorage.setItem(`homepageDailyTasks_${token}`, dailyTasks);
        }
      }
    } catch (error) {
      console.error('Error saving homepage tasks:', error);
    }
  };

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload images.');
    }
  };

  const loadTasks = async () => {
    try {
      // Get user token
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setUserToken(token);

        // WEEKLY TRIAL HANDLING
        const savedWeeklyTrial = await AsyncStorage.getItem(`weeklyTrial_${token}`);
        
        if (savedWeeklyTrial) {
          // Use saved weekly trial with image
          const parsedTrial = JSON.parse(savedWeeklyTrial);
          if (parsedTrial.text && parsedTrial.text.trim() !== '') {
            setWeeklyTrial(parsedTrial);
          } else {
            // Empty weekly trial
            setWeeklyTrial({
              text: '',
              image: null,
              completed: false,
              showImage: false
            });
          }
        } else {
          // Try homepage's weekly trial
          const weeklyTrialText = await AsyncStorage.getItem('weeklyTrial');
          if (weeklyTrialText && weeklyTrialText.trim() !== '') {
            setWeeklyTrial({
              text: weeklyTrialText,
              image: null,
              completed: false,
              showImage: false
            });
          } else {
            // Empty weekly trial
            setWeeklyTrial({
              text: '',
              image: null,
              completed: false,
              showImage: false
            });
          }
        }

        // DAILY TASKS HANDLING
        const savedDailyTasks = await AsyncStorage.getItem(`dailyTasks_${token}`);
        
        if (savedDailyTasks) {
          const parsedTasks = JSON.parse(savedDailyTasks);
          // Filter out empty tasks
          const validTasks = Array.isArray(parsedTasks) ? 
            parsedTasks.filter(task => task.text && task.text.trim() !== '') : [];
          setTasks(validTasks);
        } else {
          // Try homepage tasks
          const dailyTasksStr = await AsyncStorage.getItem('dailyTasks');
          if (dailyTasksStr) {
            try {
              const parsedTasks = JSON.parse(dailyTasksStr);
              // Only create tasks from non-empty strings
              const validTasks: TaskItem[] = [];
              
              if (Array.isArray(parsedTasks)) {
                for (const task of parsedTasks) {
                  if (task && task.trim() !== '') {
                    validTasks.push({
                      text: task,
                      image: null,
                      completed: false,
                      showImage: false
                    });
                  }
                }
              }
              
              setTasks(validTasks);
            } catch (e) {
              console.error('Error parsing daily tasks:', e);
              setTasks([]);
            }
          } else {
            // Empty tasks array
            setTasks([]);
          }
        }

        // ADDITIONAL TASKS HANDLING
        const savedAdditionalTasks = await AsyncStorage.getItem(`additionalTasks_${token}`);
        if (savedAdditionalTasks) {
          const parsedAdditionalTasks = JSON.parse(savedAdditionalTasks);
          // Filter out empty tasks
          const validAdditionalTasks = Array.isArray(parsedAdditionalTasks) ?
            parsedAdditionalTasks.filter(task => task.text && task.text.trim() !== '') : [];
          setAdditionalTasks(validAdditionalTasks);
        } else {
          setAdditionalTasks([]);
        }
      } else {
        // No token, set all empty
        setTasks([]);
        setWeeklyTrial({
          text: '',
          image: null,
          completed: false,
          showImage: false
        });
        setAdditionalTasks([]);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
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
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri;
        
        if (type === 'weekly') {
          setWeeklyTrial(prev => ({ 
            ...prev, 
            image: selectedImage,
            completed: true,
            showImage: false // Default to hidden
          }));
        } else if (type === 'daily' && typeof index === 'number') {
          const updatedTasks = [...tasks];
          updatedTasks[index] = { 
            ...updatedTasks[index], 
            image: selectedImage,
            completed: true,
            showImage: false // Default to hidden
          };
          setTasks(updatedTasks);
        } else if (type === 'additional' && typeof index === 'number') {
          const updated = [...additionalTasks];
          updated[index] = { 
            ...updated[index], 
            image: selectedImage,
            completed: true,
            showImage: false // Default to hidden
          };
          setAdditionalTasks(updated);
        }
        
        saveTasks();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const toggleImageVisibility = (type: string, index?: number) => {
    if (type === 'weekly') {
      setWeeklyTrial(prev => ({
        ...prev,
        showImage: !prev.showImage
      }));
    } else if (type === 'daily' && typeof index === 'number') {
      const updatedTasks = [...tasks];
      updatedTasks[index] = {
        ...updatedTasks[index],
        showImage: !updatedTasks[index].showImage
      };
      setTasks(updatedTasks);
    } else if (type === 'additional' && typeof index === 'number') {
      const updated = [...additionalTasks];
      updated[index] = {
        ...updated[index],
        showImage: !updated[index].showImage
      };
      setAdditionalTasks(updated);
    }
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
  const addRandomTask = () => {
    const formattedQuest = `${randomTask} (${randomTaskDuration} min) - ${randomTaskCategory}`;
    const newTask: TaskItem = {
      text: formattedQuest,
      image: null,
      completed: false,
      showImage: false
    };
    
    setAdditionalTasks(prev => [...prev, newTask]);
    saveTasks();
    setModalVisible(false);
  };

  // Function to add the custom task
  const addCustomTask = () => {
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
    
    setAdditionalTasks(prev => [...prev, newTask]);
    saveTasks();
    setModalVisible(false);
  };

  // Add this function to handle task deletion
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
          onPress: () => {
            // Remove task at specified index
            const updatedTasks = [...additionalTasks];
            updatedTasks.splice(index, 1);
            setAdditionalTasks(updatedTasks);
            saveTasks(); // Save the updated task list
          }
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: theme.background, // Use theme background
            height: 100,
          },
          headerTitleStyle: {
            fontSize: 16,
            color: theme.text, // Use theme text color
          },
          headerTitle: "Add Tasks",
        }} 
      />

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be applied dynamically
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 5,
    paddingTop: 10,
  },
  instructionText: {
    // color will be applied dynamically
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: 'bold',
  },
  content: {
    paddingBottom: 80,
  },
  taskContainer: {
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    width: width - 10,
  },
  weeklyTaskContainer: {
    backgroundColor: 'rgba(180, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  dailyTaskContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  completedTaskWeekly: {
    backgroundColor: 'rgba(0, 120, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 0, 0.4)',
  },
  completedTaskDaily: {
    backgroundColor: 'rgba(0, 150, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 0, 0.3)',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  photoButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 12,
  },
  taskContent: {
    padding: 15,
  },
  taskInput: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    paddingVertical: 5,
    minHeight: 50,
  },
  imageContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  taskImage: {
    width: width - 60,
    height: width - 60,
    borderRadius: 8,
    marginTop: 10,
  },
  showProofButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
  },
  showProofText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  addTaskButton: {
    backgroundColor: '#444',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 15,
  },
  addTaskText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderColor: 'gray',
    backgroundColor: 'black',
  },
  icon: {
    fontSize: 24,
    color: 'white',
  },
  homeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 5,
    marginRight: 5,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#222',
    width: '100%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  taskOptionContainer: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
  },
  taskOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  taskOptionText: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  taskOptionInput: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 8,
    color: 'white',
    marginBottom: 15,
    width: '100%',
  },
  taskDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  taskDetailItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  taskDetailLabel: {
    color: '#ddd',
    fontSize: 12,
    marginBottom: 5,
  },
  taskDetailInput: {
    backgroundColor: '#444',
    padding: 8,
    borderRadius: 5,
    color: 'white',
  },
  taskOptionButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  taskOptionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#555',
    width: '100%',
    marginVertical: 15,
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#555',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
  },
  timeInputContainer: {
    marginBottom: 15,
    width: '100%',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
});

export const unstable_settings = {
  // This ensures the tab bar is displayed correctly
  bottomTabs: {
    tabBarStyle: { display: 'flex' },
  },
};