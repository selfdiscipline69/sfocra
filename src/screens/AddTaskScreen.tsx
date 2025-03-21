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
// import { requestMediaLibraryPermissions } from '../utils/mediaPermissions';
import { selectImage } from '../utils/imagePickerUtils';
import { updateTaskWithImage } from '../utils/taskImageUtils';
import questsData from '../../assets/Quest.json';
import { createStyles } from '../styles/addTaskStyles';
import { imageVisibilityUtils } from '../utils/imageVisibilityUtils';
import WeeklyTrialBox from '../components/WeeklyTrialBox';
import BottomNavigation from '../components/settings/SettingBottomNavigation';
import WeeklyTrialSection from '../components/WeeklyTrialSection';
import AdditionalTaskDisplay from '../components/AdditionalTaskDisplay';
import DailyTaskInput from '../components/DailyTaskInput';
import { addCustomTask as addCustomTaskUtil } from '../utils/taskAdditionUtils';

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
    //requestMediaLibraryPermissions();

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
    await addCustomTaskUtil({
      customTask,
      customTaskTime,
      customTaskDuration,
      customTaskCategory,
      additionalTasks,
      setAdditionalTasks,
      userToken,
      setModalVisible
    });
  };

  // handleDeleteTask function to remove an additional task
  const handleDeleteTask = (index: number) => {
    const { handleTaskDeletion } = require('../utils/handleDeleteTask');
    handleTaskDeletion(index, additionalTasks, setAdditionalTasks, userToken);
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
                <WeeklyTrialSection 
                  weeklyTrial={weeklyTrial} 
                  theme={theme}
                  onChangeText={handleWeeklyTrialChange}
                  onPickImage={() => pickImage('weekly')}
                  onToggleImageVisibility={() => toggleImageVisibility('weekly')}
                />
              )}

              {/* Daily Tasks - Only show non-empty tasks */}
              <DailyTaskInput 
                tasks={tasks}
                theme={theme}
                editable={true}
                onChangeTask={handleTaskChange}
                onPickImage={(index) => pickImage('daily', index)}
                onToggleImageVisibility={(index) => toggleImageVisibility('daily', index)}
              />

              {/* Additional Tasks - Only show non-empty tasks */}
              <AdditionalTaskDisplay 
                tasks={additionalTasks}
                theme={theme}
                editable={true}
                onChangeTask={handleAdditionalTaskChange}
                onDeleteTask={handleDeleteTask}
                onPickImage={(index) => pickImage('additional', index)}
                onToggleImageVisibility={(index) => toggleImageVisibility('additional', index)}
              />

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

            <BottomNavigation theme={theme} activeScreen="homepage" />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
  );
};

export default AddTaskScreen;