import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  StyleSheet, 
  Dimensions,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  DeviceEventEmitter,
  Pressable
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom hooks
import useHomepageData from '../hooks/useHomepageData';
import { useTheme } from '../context/ThemeContext';
import { getTaskCategory } from '../utils/taskCategoryUtils';

// Components
import ProfileSection from '../components/ProfileSection';
import DailyQuote from '../components/DailyQuote';
import WeeklyTrialSection from '../components/WeeklyTrialSection';
import DailyTaskInput from '../components/DailyTaskInput';
import AdditionalTaskDisplay from '../components/AdditionalTaskDisplay';
import BottomNavigation from '../components/BottomNavigation';
import TaskTimer from '../components/TaskTimer';
import TimerDisplay from '../components/TimerDisplay';

// Task Addition Utilities
import { addCustomTask } from '../utils/taskAdditionUtils';
import questsData from '../../assets/Quest.json';
import { themes } from '../context/ThemeContext';
import { Task } from '../components/DailyTaskInput';
import { storageService } from '../utils/StorageUtils';
import { AdditionalTask } from '../types/UserTypes';

const { width } = Dimensions.get('window');

// Function to get category color - same as in taskAdditionUtils.ts
const getCategoryColor = (category: string): string => {
  // Use the same colors as defined in ThemeContext
  // We'll use light theme colors for consistency
  switch(category.toLowerCase()) {
    case 'fitness': return themes.light.categoryColors.fitness;
    case 'learning': return themes.light.categoryColors.learning;
    case 'knowledge': return themes.light.categoryColors.learning; // map knowledge to learning
    case 'mindfulness': return themes.light.categoryColors.mindfulness;
    case 'social': return themes.light.categoryColors.social;
    case 'creativity': return themes.light.categoryColors.creativity;
    default: return '#607D8B';  // Blue Grey (General)
  }
};

const HomepageScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { userData, content, actions } = useHomepageData();
  
  // Task Addition State
  const [modalType, setModalType] = useState<'none' | 'task' | 'category'>('none');
  const [randomTask, setRandomTask] = useState<string>('');
  const [customTask, setCustomTask] = useState<string>('');
  const [randomTaskDuration, setRandomTaskDuration] = useState<string>('30');
  const [customTaskDuration, setCustomTaskDuration] = useState<string>('30');
  const [randomTaskCategory, setRandomTaskCategory] = useState<string>('General');
  const [customTaskCategory, setCustomTaskCategory] = useState<string>('Select');
  const [customTaskTime, setCustomTaskTime] = useState<string>('');
  
  // Define available categories
  const taskCategories = ["Fitness", "Knowledge", "Mindfulness", "Social", "Creativity"];
  
  // Update weekly trial category determination to use challenge ID instead of title
  const weeklyTrialCategory = React.useMemo(() => {
    if (!content.weeklyTrial || !content.currentChallenge) return undefined;
    
    // Extract path code from the ID (format: "path-intensity-variation")
    const challengeId = content.currentChallenge.id;
    const pathCode = challengeId.split('-')[0];
    
    // Map path code to category
    switch(pathCode) {
      case '1': return 'mindfulness'; // Mental path
      case '2': return 'fitness';     // Physical path
      case '3': return 'social';      // Balanced path
      default: return 'general';
    }
  }, [content.weeklyTrial, content.currentChallenge]);
  
  // Use the task categories from the task library
  const dailyTaskCategories = React.useMemo(() => 
    actions.getTaskCategories(),
    [actions, content.dailyTaskIds]
  );
  
  // Generate a random task for the modal
  const generateRandomTask = () => {
    try {
      // Access task library from the structured quest data
      const typedQuestData = questsData as any;
      const taskLibrary = typedQuestData?.taskLibrary;
      
      if (!taskLibrary || typeof taskLibrary !== 'object') {
        return {
          task: "New task",
          duration: '30',
          category: "General"
        };
      }
      
      // Get all task keys
      const taskKeys = Object.keys(taskLibrary);
      if (taskKeys.length === 0) {
        return {
          task: "New task",
          duration: '30',
          category: "General"
        };
      }
      
      // Pick a random task
      const randomKey = taskKeys[Math.floor(Math.random() * taskKeys.length)];
      const randomTaskObj = taskLibrary[randomKey];
      
      if (!randomTaskObj) {
        return {
          task: "New task",
          duration: '30',
          category: "General"
        };
      }
      
      // Map category to UI category
      let category = "General";
      switch(randomTaskObj.category?.toLowerCase()) {
        case 'physical': category = 'Fitness'; break;
        case 'mindfulness': category = 'Mindfulness'; break;
        case 'learning': category = 'Knowledge'; break;
        case 'social': category = 'Social'; break;
        case 'creativity': category = 'Creativity'; break;
      }
      
      // Get a random intensity level between 1-3 for simplicity
      const intensityLevel = Math.floor(Math.random() * 3) + 1;
      const duration = randomTaskObj.intensities?.[intensityLevel]?.duration || '30';
      
      setRandomTask(randomTaskObj.task || "Task");
      setRandomTaskDuration(duration);
      setRandomTaskCategory(category);
      
      return {
        task: randomTaskObj.task || "Task",
        duration: duration,
        category: category
      };
    } catch (error) {
      console.error('Error generating random task:', error);
      return {
        task: "New task",
        duration: '30',
        category: "General"
      };
    }
  };

  // Show the modal to add new task
  const addNewTask = () => {
    try {
      const randomTaskInfo = generateRandomTask();
      setRandomTask(randomTaskInfo.task);
      setRandomTaskDuration(randomTaskInfo.duration);
      setRandomTaskCategory(randomTaskInfo.category);
      setCustomTask('');
      setCustomTaskDuration('30');
      setCustomTaskCategory('Select');
      setCustomTaskTime('');
      setModalType('task');
    } catch (error) {
      console.error('Error preparing to add new task:', error);
    }
  };

  // Function to add the selected random task
  const addRandomTask = async () => {
    try {
      const formattedQuest = `${randomTask} (${randomTaskDuration}) - ${randomTaskCategory}`;
      
      let categoryKey: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity' | undefined;
      const lowerCaseCategory = randomTaskCategory.toLowerCase();

      switch (lowerCaseCategory) {
          case 'fitness': categoryKey = 'fitness'; break;
          case 'knowledge': categoryKey = 'learning'; break; // Map knowledge
          case 'learning': categoryKey = 'learning'; break;
          case 'mindfulness': categoryKey = 'mindfulness'; break;
          case 'social': categoryKey = 'social'; break;
          case 'creativity': categoryKey = 'creativity'; break;
          default: categoryKey = undefined; // Explicitly undefined for "General" or unknown
      }
      
      const newTask: AdditionalTask = {
        id: `random-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        text: formattedQuest,
        image: null,
        completed: false,
        showImage: false,
        category: categoryKey, // Assign the potentially undefined category key
        color: getCategoryColor(categoryKey || 'general') // Fallback color
      };
      
      // Ensure additionalTasks is always treated as AdditionalTask[]
      const currentTasks: AdditionalTask[] = content.additionalTasks as AdditionalTask[];
      const updatedTasks = [...currentTasks, newTask];
      
      // Pass the correctly typed array to the action
      actions.setAdditionalTasks(updatedTasks); 
      
      setModalType('none');
    } catch (error) {
      console.error('Error adding random task:', error);
    }
  };

  // Function to add the custom task
  const handleAddCustomTask = async () => {
    // Edit 2: Add validation for category selection
    if (customTaskCategory === "Select") {
      Alert.alert('Category Required', 'Please select a category for your task.');
      return; // Prevent adding task if category is not selected
    }
    if (!customTask.trim()) {
        Alert.alert('Task Required', 'Please enter a description for your task.');
        return; // Prevent adding empty task
    }

    // Ensure the setAdditionalTasks function passed matches the expected signature
    const setAdditionalTasksForUtil = (tasks: AdditionalTask[]) => {
        actions.setAdditionalTasks(tasks);
    };

    // Call addCustomTask with a single object argument
    await addCustomTask({ 
        customTask,
        customTaskTime,
        customTaskDuration,
        customTaskCategory,
        additionalTasks: content.additionalTasks as AdditionalTask[], // Ensure type
        setAdditionalTasks: setAdditionalTasksForUtil, 
        userToken: userData.userToken,
        setModalVisible: () => setModalType('none') 
    });
  };

  // Function to open the category selection modal
  const openCategoryModal = () => setModalType('category');
  
  // Function to select a category and close modal
  const selectCategory = (category: string) => {
    setCustomTaskCategory(category);
    setModalType('task'); // Return to the task modal after selection
  };
  
  // Close all modals
  const closeAllModals = () => setModalType('none');

  // Handle task completion when swiped left
  const handleTaskComplete = (index: number) => {
    const taskItem = content.dailyTasks[index];
    const taskText = typeof taskItem === 'string' ? taskItem : taskItem.text;

    // Extract category (ensure dailyTaskCategories aligns with filtered tasks in DailyTaskInput)
    // This might need adjustment if DailyTaskInput filtering changes indices
    // It might be safer to derive category from taskText or pass it back from DailyTaskInput
    const category = dailyTaskCategories[index] || 'general'; // Assuming index still aligns

    let duration = 30; // Default
    // Updated regex to be more robust for formats like (30 min) or (30 minutes)
    const durationMatch = taskText.match(/\((\d+)\s*m/);
    if (durationMatch && durationMatch[1]) {
      duration = parseInt(durationMatch[1], 10);
    }

    actions.addCompletedTask(taskText, category, duration, true); // true for daily
    DeviceEventEmitter.emit('taskCompleted');
    Alert.alert("Task Completed", `You've completed: ${taskText}`);
    actions.updateTaskStatus(index, 'completed');
  };

  // Handle task cancellation when swiped right
  const handleTaskCancel = (index: number) => {
    // Get the current task item (string or object)
    const taskItem = content.dailyTasks[index];
    
    // Get the task text regardless of format
    const taskText = typeof taskItem === 'string' ? taskItem : taskItem.text;
    
    // Confirm before canceling
    Alert.alert(
      "Cancel Task",
      `Are you sure you want to cancel: ${taskText}?`,
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            // Use the updateTaskStatus function
            actions.updateTaskStatus(index, 'canceled');
          }
        }
      ]
    );
  };

  // Handle additional task completion when swiped left
  const handleAdditionalTaskComplete = (index: number) => {
    const currentTasks: AdditionalTask[] = content.additionalTasks as AdditionalTask[];
    const completedTask = currentTasks[index];
    
    if (!completedTask) return; // Guard against index out of bounds

    const category = completedTask.category || 'general';
    // Extract duration - Check for "minutes"
    let duration = 0; // Default duration for additional tasks if not specified
    const durationMatch = completedTask.text.match(/\((\d+)\s*minutes?\)/);
    if (durationMatch && durationMatch[1]) {
        duration = parseInt(durationMatch[1], 10);
    }

    actions.addCompletedTask(completedTask.text, category, duration, false); // false for additional tasks
    
    DeviceEventEmitter.emit('taskCompleted');
    Alert.alert("Task Completed", `You've completed: ${completedTask.text}`);
    
    const updatedTasks = currentTasks.filter((_, i) => i !== index); // Use filter for immutability
    actions.setAdditionalTasks(updatedTasks);
  };

  // Handle additional task cancellation when swiped right
  const handleAdditionalTaskCancel = (index: number) => {
    const currentTasks: AdditionalTask[] = content.additionalTasks as AdditionalTask[];
    const canceledTask = currentTasks[index];

    if (!canceledTask) return; // Guard clause

    Alert.alert(
      "Cancel Task",
      `Are you sure you want to cancel: ${canceledTask.text}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            const updatedTasks = currentTasks.filter((_, i) => i !== index); // Use filter
            actions.setAdditionalTasks(updatedTasks);
          }
        }
      ]
    );
  };

  // New state for timer
  const [activeTimer, setActiveTimer] = useState<{
    taskIndex: number;
    taskName: string;
    isActive: boolean;
    startTime: Date | null;
  } | null>(null);
  
  // Fix the implementation to use the component's own state
  const handleTaskLongPress = (index: number, taskText: string) => {
    // Check if this is a timer task
    if (!taskText || !taskText.includes('(') || !taskText.includes(')')) {
      return; // Not a valid task format for timer
    }

    // Extract task name (everything before the duration in parentheses)
    const taskName = taskText.split('(')[0].trim();
    
    // Check if we're already timing something
    if (activeTimer && activeTimer.isActive) {
      Alert.alert(
        "Active Timer",
        "You already have an active timer. Stop it first before starting a new one.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Confirm timer start
    Alert.alert(
      "Start Timer",
      `Start tracking time for "${taskName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Start", 
          onPress: () => {
            const now = new Date();
            // Set active timer with start time
            setActiveTimer({
              taskIndex: index,
              taskName,
              isActive: true,
              startTime: now
            });
          }
        }
      ]
    );
  };
  
  // Handle stopping the timer
  const handleStopTimer = () => {
    if (!activeTimer) return;
    
    Alert.alert(
      "Stop Timer",
      "Stop tracking time for this task?",
      [
        { text: "Continue", style: "cancel" },
        { 
          text: "Stop", 
          style: "destructive",
          onPress: () => {
            // Fix: Ensure the update function correctly handles null
            setActiveTimer((prev) => (prev ? { ...prev, isActive: false } : null));
            setTimeout(() => {
              setActiveTimer(null);
            }, 5000); // Keep delay or adjust as needed
          }
        }
      ]
    );
  };

  // --- Secret Day Adjustment Logic ---
  const [isDayAdjustModalVisible, setIsDayAdjustModalVisible] = useState(false);
  const [currentAgeForModal, setCurrentAgeForModal] = useState<number>(1); // To display in modal
  const quoteLongPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleQuotePressIn = () => {
    if (quoteLongPressTimer.current) {
      clearTimeout(quoteLongPressTimer.current);
    }
    quoteLongPressTimer.current = setTimeout(() => {
      console.log("Quote long press detected!");
      setCurrentAgeForModal(content.accountAge); // Get current age from hook
      setIsDayAdjustModalVisible(true);
      quoteLongPressTimer.current = null;
    }, 5000); // 5 seconds
  };

  const handleQuotePressOut = () => {
    if (quoteLongPressTimer.current) {
      clearTimeout(quoteLongPressTimer.current);
      quoteLongPressTimer.current = null;
    }
  };

  const handleAdjustDay = async (adjustment: 'increase' | 'decrease') => {
     if (userData.userToken) {
       setIsDayAdjustModalVisible(false); // Close modal immediately
       if (adjustment === 'increase') {
           console.log("DEV: Triggering increase account age...");
           await actions.increaseAccountAge();
           Alert.alert("Age Increased", "Account age increased by 1. Tasks should refresh.");
       } else if (adjustment === 'decrease') {
            console.log("DEV: Triggering decrease account age...");
           await actions.decreaseAccountAge();
           Alert.alert("Age Decreased", "Account age decreased by 1 (if possible). Tasks should refresh.");
       }
     } else {
        Alert.alert("Error", "User token not found.");
        setIsDayAdjustModalVisible(false);
     }
  };
  // --- End Secret Day Adjustment Logic ---

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
    >
      <View style={styles.innerContainer}>
        {/* Active Timer - Displayed at the top */}
        {activeTimer && (
          <>
            <TimerDisplay 
              isRunning={activeTimer.isActive}
              taskName={activeTimer.taskName}
              startTime={activeTimer.startTime || undefined}
              onStop={handleStopTimer}
            />
          </>
        )}
        
        {/* ScrollView with content */}
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true} 
          scrollEnabled={true}
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={actions.refreshData}
              colors={[theme.accent]}
              tintColor={theme.accent}
            />
          }
        >
          {/* Header with Profile and Quote */}
          <View style={styles.header}>
            <Pressable
              onPressIn={handleQuotePressIn}
              onPressOut={handleQuotePressOut}
              style={styles.quotePressable}
            >
              <DailyQuote
                 quote={content.dailyQuote}
                 author={content.dailyQuoteAuthor}
                 origin={content.dailyQuoteOrigin}
                 theme={theme}
              />
            </Pressable>
            
            <View style={styles.headerButtons}>
              <ProfileSection 
                profileImage={userData.profileImage} 
                userHandle={userData.userHandle}
                theme={theme}
              />
            </View>
          </View>
          
          <View style={styles.spacerView} />
          
          {/* Content Container */}
          <View style={styles.contentContainer}>
            {/* Weekly Trial Section */}
            <View style={styles.weeklyTrialContainer}>
              <WeeklyTrialSection 
                weeklyTrial={content.weeklyTrial} 
                theme={theme}
                category={weeklyTrialCategory as any}
              />
            </View>

            {/* Daily Tasks section with long press support */}
            <View style={styles.dailyTasksContainer}>
              <DailyTaskInput 
                tasks={content.dailyTasks} 
                theme={theme}
                categories={dailyTaskCategories as any}
                onTaskComplete={handleTaskComplete}
                onTaskCancel={handleTaskCancel}
                onTaskLongPress={handleTaskLongPress}
              />
            </View>
          </View>
          
          {/* Additional Tasks */}
          <View style={styles.sectionContainer}>
            <AdditionalTaskDisplay 
              tasks={content.additionalTasks}
              theme={theme}
              onTaskComplete={handleAdditionalTaskComplete}
              onTaskCancel={handleAdditionalTaskCancel}
              onTaskLongPress={handleTaskLongPress}
            />
          </View>
          
          {/* Extra space at bottom for keyboard */}
          <View style={styles.keyboardSpace} />
        </ScrollView>

        {/* Task Choice Modal - Outside ScrollView */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalType !== 'none'}
          onRequestClose={closeAllModals}
        >
          {modalType === 'task' && (
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.modalContent, { backgroundColor: theme.boxBackground }]}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Your Task</Text>
                  
                  {/* Wrap these sections in a fragment or View */}
                  <>
                    {/* Random Task Option */}
                    <View style={[styles.taskOptionContainer, { backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }]}>
                      <Text style={[styles.taskOptionTitle, { color: theme.text }]}>Suggested Task:</Text>
                      <Text style={[styles.taskOptionText, { color: theme.text }]}>
                        {randomTask} ({randomTaskDuration}) - {randomTaskCategory}
                      </Text>
                      <TouchableOpacity 
                        style={[styles.taskOptionButton, { backgroundColor: theme.accent }]}
                        onPress={addRandomTask}
                      >
                        <Text style={styles.taskOptionButtonText}>Use This Task</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={[styles.modalDivider, { backgroundColor: theme.mode === 'dark' ? '#555' : '#ddd' }]} />
                    
                    {/* Custom Task Option */}
                    <View style={styles.taskOptionContainer}>
                      <Text style={[styles.taskOptionTitle, { color: theme.text }]}>Create Custom Task:</Text>
                      
                      <TextInput
                        style={[
                          styles.taskOptionInput, 
                          { 
                            backgroundColor: theme.mode === 'dark' ? '#444' : '#f5f5f5',
                            color: theme.text,
                            borderColor: theme.mode === 'dark' ? '#555' : '#ddd',
                            borderWidth: 1,
                            height: 50  // Set explicit height for main task input
                          }
                        ]}
                        placeholder="Enter your task"
                        placeholderTextColor={theme.mode === 'dark' ? '#aaa' : '#888'}
                        value={customTask}
                        onChangeText={setCustomTask}
                      />
                      
                      <View style={styles.taskDetailsRow}>
                        <View style={styles.taskDetailItem}>
                          <Text style={[styles.taskDetailLabel, { color: theme.text }]}>Duration (min)</Text>
                          <TextInput
                            style={[
                              styles.taskDetailInput, 
                              { 
                                backgroundColor: theme.mode === 'dark' ? '#444' : '#f5f5f5',
                                color: theme.text,
                                borderColor: theme.mode === 'dark' ? '#555' : '#ddd',
                                borderWidth: 1
                              }
                            ]}
                            placeholder="30"
                            placeholderTextColor={theme.mode === 'dark' ? '#aaa' : '#888'}
                            keyboardType="numeric"
                            value={customTaskDuration}
                            onChangeText={setCustomTaskDuration}
                          />
                        </View>
                        
                        <View style={styles.taskDetailItem}>
                          <Text style={[styles.taskDetailLabel, { color: theme.text }]}>Category</Text>
                          <TouchableOpacity
                            onPress={openCategoryModal}
                            style={[
                              styles.taskDetailInput, 
                              { 
                                backgroundColor: theme.mode === 'dark' ? '#444' : '#f5f5f5',
                                borderColor: theme.mode === 'dark' ? '#555' : '#ddd',
                                borderWidth: 1,
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                paddingHorizontal: 12,
                                height: 40 // Match duration input height
                              }
                            ]}
                          >
                            <Text style={{ 
                                color: customTaskCategory === "Select" 
                                    ? (theme.mode === 'dark' ? '#aaa' : '#888') 
                                    : theme.text 
                            }}>
                                {customTaskCategory}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={[styles.taskDetailItem, { marginBottom: 10 }]}>
                        <Text style={[styles.taskDetailLabel, { color: theme.text }]}>Time (optional)</Text>
                        <TextInput
                          style={[
                            styles.taskDetailInput, 
                            { 
                              backgroundColor: theme.mode === 'dark' ? '#444' : '#f5f5f5',
                              color: theme.text,
                              borderColor: theme.mode === 'dark' ? '#555' : '#ddd',
                              borderWidth: 1,
                              padding: 12,
                              height: 45
                            }
                          ]}
                          placeholder="e.g., 3:30 PM"
                          placeholderTextColor={theme.mode === 'dark' ? '#aaa' : '#888'}
                          value={customTaskTime}
                          onChangeText={setCustomTaskTime}
                        />
                      </View>
                      
                      <TouchableOpacity 
                        style={[styles.taskOptionButton, { backgroundColor: theme.accent, marginTop: 10 }]} // Reduced margin slightly
                        onPress={handleAddCustomTask}
                      >
                        <Text style={styles.taskOptionButtonText}>Add Custom Task</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                  
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={closeAllModals}
                  >
                    <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          )}

          {/* Category Selection Modal */}
          {modalType === 'category' && (
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.boxBackground }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Select Category</Text>
                
                {taskCategories.map((category, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.categoryButton,
                      { backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }
                    ]}
                    onPress={() => selectCategory(category)}
                  >
                    <Text style={[styles.categoryButtonText, { color: theme.text }]}>{category}</Text>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setModalType('task')}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Modal>

        {/* --- Day Adjustment Modal --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isDayAdjustModalVisible}
          onRequestClose={() => setIsDayAdjustModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.boxBackground }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Adjust Day (DEV)</Text>
              <Text style={[styles.modalText, { color: theme.text, marginBottom: 20 }]}>
                Current Account Age: {currentAgeForModal}
              </Text>
              <Text style={[styles.modalText, { color: theme.text, marginBottom: 20, textAlign: 'center' }]}>
                Adjust the internal account creation date to simulate a different day? This affects task/challenge loading.
              </Text>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.accent }]}
                onPress={() => handleAdjustDay('increase')}
              >
                <Text style={styles.modalButtonText}>Add 1 Day (Age +1)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ff9800' }]} // Orange for subtract
                onPress={() => handleAdjustDay('decrease')}
              >
                <Text style={styles.modalButtonText}>Subtract 1 Day (Age -1)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.mode === 'dark' ? '#555' : '#ccc', marginTop: 15 }]}
                onPress={() => setIsDayAdjustModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.mode === 'dark' ? '#fff' : '#000'}]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* --- End Day Adjustment Modal --- */}

        {/* Bottom Navigation - Pass the addNewTask function */}
        <BottomNavigation 
          theme={theme} 
          onAddTaskPress={addNewTask} 
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 5,
    paddingTop: 0, 
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
    marginLeft: 12,
    flex: 1,
  },
  headerButtons: {
    alignItems: 'center',
    marginRight: 25,
  },
  content: {
    paddingTop: 0,
    paddingBottom: 80,
    flexGrow: 1,
  },
  spacerView: {
    height: 5,
  },
  keyboardSpace: {
    height: 100,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  // New styles for task addition
  addTaskButton: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTaskButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '90%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  taskOptionContainer: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  taskOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskOptionText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  taskOptionInput: {
    width: '100%',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  taskDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  taskDetailItem: {
    width: '48%',
  },
  taskDetailLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  taskDetailInput: {
    borderRadius: 5,
    height: 40,
  },
  taskOptionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  taskOptionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  modalDivider: {
    height: 1,
    width: '90%',
    marginVertical: 15,
  },
  categoryButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 10,
  },
  tasksSectionContainer: {
    minHeight: 100,
  },
  contentContainer: {
    marginBottom: 15,
  },
  weeklyTrialContainer: {
    marginBottom: 15, // Reduced gap between weekly trial and daily tasks
  },
  dailyTasksContainer: {
    width: '100%',
    minHeight: 220, // Fixed height container to prevent layout shifts
  },
  weeklyGraphContainer: {
    minHeight: 220, // Fixed height container to prevent layout shifts
  },
  quotePressable: {
    flex: 1,
    marginRight: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButton: {
    width: '80%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomepageScreen;