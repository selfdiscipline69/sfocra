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
  Alert,
  RefreshControl,
  DeviceEventEmitter,
  Pressable,
  Image,
  Animated
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom hooks
import useHomepageData from '../hooks/useHomepageData';
import { useTheme } from '../context/ThemeContext';
import { storageService, normalizeCategory, TaskCompletionRecord } from '../utils/StorageUtils';

// Components
import ProfileSection from '../components/ProfileSection';
import DailyQuote from '../components/DailyQuote';
import WeeklyTrialSection from '../components/WeeklyTrialSection';
import DailyTaskInput from '../components/DailyTaskInput';
import AdditionalTaskDisplay from '../components/AdditionalTaskDisplay';
import BottomNavigation from '../components/BottomNavigation';
import TimerDisplay, { TimerDisplayRef } from '../components/TimerDisplay';
import CustomTaskSelector, { CustomTaskSelectorRef } from '../components/addTask/CustomTaskSelector';

// Task Addition Utilities
import { addCustomTask } from '../utils/taskAdditionUtils';
import TaskLibrary from '../../assets/TaskLibrary.json';
import questsData from '../../assets/Quest.json';
import { themes } from '../context/ThemeContext';
import { Task } from '../components/DailyTaskInput';
import { AdditionalTask } from '../types/UserTypes';

const { width } = Dimensions.get('window');

// Define types for TaskLibrary structure
type TaskDetails = {
  task: string;
  category: string;
  intensities: { [key: string]: { duration: string } };
};

type TaskLibraryType = {
  task_category: { [key: string]: string[] };
  [key: string]: TaskDetails | { [key: string]: string[] }; // Index signature for tasks
};

const TypedTaskLibrary = TaskLibrary as TaskLibraryType;

// Function to get category color
const getCategoryColor = (category: string): string => {
  const lowerCategory = category?.toLowerCase() || 'general';
  switch(lowerCategory) {
    case 'fitness': return themes.light.categoryColors.fitness;
    case 'learning': return themes.light.categoryColors.learning;
    case 'knowledge': return themes.light.categoryColors.learning;
    case 'mindfulness': return themes.light.categoryColors.mindfulness;
    case 'social': return themes.light.categoryColors.social;
    case 'creativity': return themes.light.categoryColors.creativity;
    default: return '#607D8B'; // Blue Grey (General)
  }
};

const HomepageScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { userData, content, actions } = useHomepageData();
  
  // Task Addition State (Main Modal)
  const [modalType, setModalType] = useState<'none' | 'task'>('none'); // Simplified main modal control

  // Random Task State (Keep as is)
  const [randomTask, setRandomTask] = useState<string>('');
  const [randomTaskDuration, setRandomTaskDuration] = useState<string>('30');
  const [randomTaskCategory, setRandomTaskCategory] = useState<string>('General');
  
  // --- State to hold selection from CustomTaskSelector ---
  const [customSelection, setCustomSelection] = useState<{
      category: string | null;
      taskKey: string | null;
      intensityKey: string | null;
  }>({ category: null, taskKey: null, intensityKey: null });
  // --- End selection state ---

  // Ref for the custom task selector component
  const customTaskSelectorRef = useRef<CustomTaskSelectorRef>(null);

  // Weekly trial category determination from hook
  const weeklyTrialCategory = React.useMemo(() => {
    if (!content.currentChallenge) return 'general';
    const pathCode = content.currentChallenge.id.split('-')[0];
    switch(pathCode) {
      case '1': return 'mindfulness';
      case '2': return 'fitness';
      case '3': return 'social';
      default: return 'general';
    }
  }, [content.currentChallenge]);

  // Refresh content on focus (handled by hook's useEffect)
  useFocusEffect(
    React.useCallback(() => {
      console.log('HomepageScreen focused');
      // The hook now handles refreshing data based on age/token changes.
      // Manual refresh on focus might be redundant unless specifically needed.
      // if (userData.userToken) { actions.refreshData(); }
      return () => { /* Optional cleanup */ };
    }, [userData.userToken, actions.refreshData])
  );
  
  // Generate a random task for the modal
  const generateRandomTask = () => {
    try {
      const typedQuestData = questsData as any;
      const taskLibrary = typedQuestData?.taskLibrary;
      if (!taskLibrary || typeof taskLibrary !== 'object') { return { task: "No library", duration: '0', category: "General" }; }
      const taskKeys = Object.keys(taskLibrary);
      if (taskKeys.length === 0) { return { task: "Empty library", duration: '0', category: "General" }; }
      const randomKey = taskKeys[Math.floor(Math.random() * taskKeys.length)];
      const randomTaskObj = taskLibrary[randomKey];
      if (!randomTaskObj) { return { task: "Task not found", duration: '30', category: "General" }; }

      // Use imported normalizeCategory
      const category = normalizeCategory(randomTaskObj.category);
      const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
      const duration = randomTaskObj.duration || '30';

      return { task: randomTaskObj.task || "Task", duration, category: displayCategory };
    } catch (error) {
      console.error('Error generating random task:', error);
      return { task: "Error task", duration: '30', category: "General" };
    }
  };

  // Show the main modal to add new task (Updated)
  const addNewTask = () => {
    try {
      // Generate random task as before
      const randomTaskInfo = generateRandomTask();
      setRandomTask(randomTaskInfo.task);
      setRandomTaskDuration(randomTaskInfo.duration);
      setRandomTaskCategory(randomTaskInfo.category);

      // Reset selection in state and in the component via ref
      setCustomSelection({ category: null, taskKey: null, intensityKey: null });
      customTaskSelectorRef.current?.reset(); // Call reset method on the component

      setModalType('task'); // Open the main task choice modal
    } catch (error) { console.error('Error preparing to add new task:', error); }
  };

  // Function to add the selected random task to *additional* tasks
  const addRandomTask = async () => {
    try {
      const formattedQuest = `${randomTask} (${randomTaskDuration} min) - ${randomTaskCategory}`;
      // Use imported normalizeCategory
      const categoryKey = normalizeCategory(randomTaskCategory);
      const newTask: AdditionalTask = {
        id: `random-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        text: formattedQuest,
        image: null,
        showImage: false,
        completed: false,
        category: categoryKey === 'general' ? undefined : categoryKey as any,
        color: getCategoryColor(categoryKey || 'general')
      };
      const currentTasks: AdditionalTask[] = content.additionalTasks || [];
      actions.setAdditionalTasks([...currentTasks, newTask]);
      setModalType('none');
    } catch (error) { console.error('Error adding random task:', error); }
  };

  // --- Handler for selection changes from CustomTaskSelector ---
  const handleCustomSelectionChange = useCallback((selection: { category: string | null; taskKey: string | null; intensityKey: string | null }) => {
      setCustomSelection(selection);
  }, []);
  // --- End selection handler ---

  // --- Updated handleAddCustomTask ---
  const handleAddCustomTask = async () => {
      const { category, taskKey, intensityKey } = customSelection; // Use state managed here

      if (!category || !taskKey || !intensityKey) {
        Alert.alert('Selection Incomplete', 'Please select a category, task, and intensity.');
        return;
      }

      // Fetch details from TaskLibrary
      const taskDetail = TypedTaskLibrary[taskKey] as TaskDetails | undefined;
      const intensityDetail = taskDetail?.intensities?.[intensityKey];

      if (!taskDetail || !intensityDetail) {
        Alert.alert('Error', 'Selected task details not found.');
        return;
      }

      // Prepare data for the task addition utility
      const taskName = taskDetail.task;
      const durationText = intensityDetail.duration;
      const durationMatch = durationText.match(/(\d+)\s*minute/);
      const durationMinutes = durationMatch ? durationMatch[1] : '30'; // Default if parse fails
      const formattedTaskText = `${taskName} (${durationText})`;

      // Call the utility (needs modification in taskAdditionUtils.ts)
      await addCustomTask({
          selectedCategory: category, 
          selectedTaskKey: taskKey || '', 
          selectedIntensityKey: intensityKey || '',
          additionalTasks: content.additionalTasks || [],
          setAdditionalTasks: actions.setAdditionalTasks,
          userToken: userData.userToken,
          setModalVisible: () => setModalType('none')
      });

       // Reset selections after adding (handled by addNewTask on next open)
       // Or reset immediately if preferred:
       // setCustomSelection({ category: null, taskKey: null, intensityKey: null });
       // customTaskSelectorRef.current?.reset();
  };
  // --- End Updated handleAddCustomTask ---

  // Modal controls (Updated)
  const closeAllModals = () => {
      setModalType('none');
      // No need to manage selectionModalType here anymore
  }

  // --- Celebration Modal ---
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedTaskText, setCompletedTaskText] = useState('');
  const [completedCategory, setCompletedCategory] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const showCelebrationModal = (taskText: string, category: string) => {
    setCompletedTaskText(taskText); setCompletedCategory(category); setShowCelebration(true);
    fadeAnim.setValue(0); scaleAnim.setValue(0.5);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
    ]).start();
  };
  const getCelebrationColor = (category: string) => getCategoryColor(category);
  const closeCelebration = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setShowCelebration(false));
  };
  // --- End Celebration Modal ---

  // --- Task Completion/Cancellation ---
  const handleTaskComplete = (index: number) => {
    const taskItem = content.dailyTasks?.[index]; // Use optional chaining
    if (typeof taskItem !== 'object' || taskItem === null || taskItem.status !== 'default') { console.log("handleTaskComplete: Invalid or processed", index); return; }
    const taskText = taskItem.text; const category = taskItem.category || 'general';
    let duration = 30; const durationMatch = taskText.match(/\((\d+)\s*min\)/);
    if (durationMatch?.[1]) duration = parseInt(durationMatch[1], 10);
    const day = content.accountAge;
    const originalTaskId = taskItem.id; // Get original task ID
    if (day <= 0 || !userData.userToken) { console.error("Cannot save completion: Invalid age/token."); return; }
    const record: Omit<TaskCompletionRecord, 'id'> = {
      day,
      task_name: taskText.split('(')[0].trim(),
      category: category.toLowerCase(),
      duration,
      is_daily: 1,
      completed_at: Date.now(),
      original_task_id: originalTaskId // Pass the original ID
    };
    storageService.saveTaskCompletionRecord(userData.userToken, record)
      .then(saved => { if (saved) { console.log(`Record saved (ID: ${saved.id})`); DeviceEventEmitter.emit('taskCompleted', { category }); showCelebrationModal(taskText, category); actions.updateTaskStatus(index, 'completed'); } else { console.error('Failed save.'); }})
      .catch(err => { console.error('Error saving:', err); });
  };
  const handleTaskCancel = (index: number) => {
    const taskItem = content.dailyTasks?.[index];
    if (typeof taskItem !== 'object' || taskItem === null || taskItem.status !== 'default') { console.log("handleTaskCancel: Invalid or processed", index); return; }
    Alert.alert("Cancel Task", `Cancel: ${taskItem.text}?`, [{ text: "No", style: "cancel" }, { text: "Yes", onPress: () => actions.updateTaskStatus(index, 'canceled') }]);
  };
  const handleAdditionalTaskComplete = (index: number) => {
    const currentTasks: AdditionalTask[] = content.additionalTasks || [];
    if (index < 0 || index >= currentTasks.length) return;
    const task = currentTasks[index]; if (!task) return;
    const category = task.category || 'general'; let duration = 30;
    const match = task.text.match(/\((\d+)\s*min\)/); if (match?.[1]) duration = parseInt(match[1], 10);
    const day = content.accountAge;
    const originalTaskId = task.id; // Get original task ID
    if (day <= 0 || !userData.userToken) { console.error("Cannot save add. completion: Invalid age/token."); return; }
    const record: Omit<TaskCompletionRecord, 'id'> = {
      day,
      task_name: task.text.split('(')[0].trim(),
      category: category.toLowerCase(),
      duration,
      is_daily: 0,
      completed_at: Date.now(),
      original_task_id: originalTaskId // Pass the original ID
    };
    storageService.saveTaskCompletionRecord(userData.userToken, record)
      .then(saved => { if (saved) { console.log(`Add. record saved (ID: ${saved.id})`); DeviceEventEmitter.emit('taskCompleted', { category }); showCelebrationModal(task.text, category); actions.setAdditionalTasks(currentTasks.filter((_, i) => i !== index)); } else { console.error('Failed save add.'); }})
      .catch(err => { console.error('Error saving add.:', err); });
  };
  const handleAdditionalTaskCancel = (index: number) => {
    const currentTasks: AdditionalTask[] = content.additionalTasks || [];
    if (index < 0 || index >= currentTasks.length) return;
    const task = currentTasks[index]; if (!task) return;
    Alert.alert("Cancel Task", `Cancel: ${task.text}?`, [{ text: "No", style: "cancel" }, { text: "Yes", onPress: () => actions.setAdditionalTasks(currentTasks.filter((_, i) => i !== index)) }]);
  };
  // --- End Task Completion/Cancellation ---

  // --- Add Ref for Timer Display ---
  const timerDisplayRef = useRef<TimerDisplayRef>(null);
  // --- End Add Ref ---

  // --- NEW: Timer Start Trigger (Called by Task Components) ---
  const triggerTimerStart = useCallback((taskItem: Task | AdditionalTask, isDaily: boolean) => {
      timerDisplayRef.current?.startTimer(taskItem, isDaily);
  }, []); // Empty dependency array as ref doesn't change
  // --- End NEW Timer Start Trigger ---

  // --- NEW: Callbacks for TimerDisplay ---
  const handleTimerComplete = useCallback((taskItem: Task | AdditionalTask, isDaily: boolean, elapsedSeconds: number) => {
      console.log(`Homepage: Timer finished for task ID ${taskItem.id}, elapsed: ${elapsedSeconds}s`);

      // Find the index based on task ID and type
      let taskIndex = -1;
      if (isDaily) {
          taskIndex = content.dailyTasks?.findIndex(t => t.id === taskItem.id) ?? -1;
          if (taskIndex !== -1) {
              handleTaskComplete(taskIndex); // Call existing completion logic
          } else {
              console.error("Homepage: Daily task not found on timer completion:", taskItem.id);
          }
      } else {
          taskIndex = content.additionalTasks?.findIndex(t => t.id === taskItem.id) ?? -1;
          if (taskIndex !== -1) {
              handleAdditionalTaskComplete(taskIndex); // Call existing completion logic
          } else {
              console.error("Homepage: Additional task not found on timer completion:", taskItem.id);
          }
      }
       // Optionally: Update duration in storage using elapsedSeconds if needed here
       // storageService.updateTaskDuration(...)
  }, [content.dailyTasks, content.additionalTasks, handleTaskComplete, handleAdditionalTaskComplete]); // Add dependencies

  const handleTimerDiscard = useCallback((taskItem: Task | AdditionalTask, isDaily: boolean) => {
      console.log(`Homepage: Timer discarded for task ID ${taskItem.id}`);
      // No action needed here usually, as TimerDisplay hides itself.
      // You could add logic here if discarding needs to affect task state somehow.
  }, []);
  // --- End NEW Callbacks ---

  // --- Secret Day Adjustment Logic ---
  const [isDayAdjustModalVisible, setIsDayAdjustModalVisible] = useState(false);
  const quoteLongPressTimer = useRef<NodeJS.Timeout | null>(null);
  const handleQuotePressIn = () => {
      if (quoteLongPressTimer.current) clearTimeout(quoteLongPressTimer.current);
      quoteLongPressTimer.current = setTimeout(() => { setIsDayAdjustModalVisible(true); quoteLongPressTimer.current = null; }, 5000);
  };
  const handleQuotePressOut = () => { if (quoteLongPressTimer.current) { clearTimeout(quoteLongPressTimer.current); quoteLongPressTimer.current = null; } };
  const handleAdjustDay = async (adjustment: 'increase' | 'decrease') => {
       if (!userData.userToken) { Alert.alert("Error", "User token not found."); setIsDayAdjustModalVisible(false); return; }
        setIsDayAdjustModalVisible(false);
       if (adjustment === 'increase') { await actions.increaseAccountAge(); Alert.alert("Age Increased"); }
       else { await actions.decreaseAccountAge(); Alert.alert("Age Decreased"); }
  };
  // --- End Secret Day Adjustment Logic ---

  // Add listener for task state updates
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('taskStateUpdated', () => {
      console.log('HomepageScreen: Received taskStateUpdated event, refreshing data.');
      actions.refreshData(); // Refresh data to reflect changes
    });

    return () => {
      subscription.remove(); // Clean up listener on unmount
    };
  }, [actions.refreshData]); // Add dependency

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: theme.background }]} keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20} >
      <View style={styles.innerContainer}>
        {/* Render TimerDisplay unconditionally and pass ref/callbacks */}
        <TimerDisplay
          ref={timerDisplayRef}
          theme={theme}
          onTimerFinish={handleTimerComplete}
          onTimerDiscard={handleTimerDiscard}
        />

        {/* ScrollView */}
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={true} scrollEnabled={true} style={styles.scrollView} refreshControl={ <RefreshControl refreshing={false} onRefresh={actions.refreshData} colors={[theme.accent]} tintColor={theme.accent} /> } >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPressIn={handleQuotePressIn} onPressOut={handleQuotePressOut} style={styles.quotePressable} disabled={!userData.userToken} >
              <DailyQuote quote={content.dailyQuote} author={content.dailyQuoteAuthor} origin={content.dailyQuoteOrigin} theme={theme} />
            </Pressable>
            <View style={styles.headerButtons}>
              <ProfileSection profileImage={userData.profileImage} userHandle={userData.userHandle} theme={theme} />
            </View>
          </View>
          <View style={styles.spacerView} />
          {/* Content Container */}
          <View style={styles.contentContainer}>
            {/* Weekly Trial */}
            <View style={styles.weeklyTrialContainer}>
              <WeeklyTrialSection weeklyTrial={content.weeklyTrial} theme={theme} category={weeklyTrialCategory as any} />
            </View>
            {/* Daily Tasks - Update long press handler */}
            <View style={styles.dailyTasksContainer}>
              <DailyTaskInput
                tasks={content.dailyTasks || []}
                theme={theme}
                onTaskComplete={handleTaskComplete}
                onTaskCancel={handleTaskCancel}
                // Pass the new trigger function
                onTaskLongPress={(index, taskItem) => triggerTimerStart(taskItem as Task, true)}
              />
            </View>
          </View>
          {/* Additional Tasks - Update long press handler */}
          <View style={styles.sectionContainer}>
            <AdditionalTaskDisplay
              tasks={content.additionalTasks || []}
              theme={theme}
              onTaskComplete={handleAdditionalTaskComplete}
              onTaskCancel={handleAdditionalTaskCancel}
              // Pass the new trigger function
              onTaskLongPress={(index, taskItem) => triggerTimerStart(taskItem as AdditionalTask, false)}
            />
          </View>
          <View style={styles.keyboardSpace} />
        </ScrollView>

        {/* Modals */}
        {/* Task Choice Modal (Updated "Create Custom Task" part) */}
         <Modal animationType="slide" transparent={true} visible={modalType === 'task'} onRequestClose={closeAllModals}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                 <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.boxBackground }]}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Your Task</Text>
                    
                    {/* Random Task Option (Keep as is) */}
                    <View style={[styles.taskOptionContainer, { backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }]}>
                      <Text style={[styles.taskOptionTitle, { color: theme.text }]}>Suggested Task:</Text>
                            <Text style={[styles.taskOptionText, { color: theme.text }]}>{randomTask} ({randomTaskDuration}) - {randomTaskCategory}</Text>
                            <TouchableOpacity style={[styles.taskOptionButton, { backgroundColor: theme.accent }]} onPress={addRandomTask}><Text style={styles.taskOptionButtonText}>Use This Task</Text></TouchableOpacity>
                    </View>

                    <View style={[styles.modalDivider, { backgroundColor: theme.mode === 'dark' ? '#555' : '#ddd' }]} />
                    
                    {/* --- Custom Task Selection UI via Component --- */}
                    <View style={styles.taskOptionContainer}>
                      <Text style={[styles.taskOptionTitle, { color: theme.text }]}>Create Custom Task:</Text>

                      {/* Render the new component */}
                      <CustomTaskSelector
                          ref={customTaskSelectorRef} // Assign ref
                          theme={theme}
                          onSelectionChange={handleCustomSelectionChange}
                      />

                      {/* Add Custom Task Button (conditionally enabled based on state) */}
                      <TouchableOpacity
                          style={[
                              styles.taskOptionButton,
                              { backgroundColor: theme.accent, marginTop: 20 },
                              (!customSelection.category || !customSelection.taskKey || !customSelection.intensityKey) && styles.disabledButton // Disable if not all selected
                          ]}
                          onPress={handleAddCustomTask}
                          disabled={!customSelection.category || !customSelection.taskKey || !customSelection.intensityKey}
                      >
                          <Text style={styles.taskOptionButtonText}>Add Custom Task</Text>
                      </TouchableOpacity>
                    </View>
                    {/* --- End Custom Task Selection UI --- */}

                    {/* Cancel button */}
                    <TouchableOpacity style={styles.cancelButton} onPress={closeAllModals}>
                        <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
             </TouchableWithoutFeedback>
         </Modal>

        {/* Day Adjustment Modal */}
        <Modal animationType="fade" transparent={true} visible={isDayAdjustModalVisible} onRequestClose={() => setIsDayAdjustModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.boxBackground }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Adjust Day (DEV)</Text>
                    <Text style={[styles.modalText, { color: theme.text, marginBottom: 20 }]}>Current Account Age: {content.accountAge}</Text>
                    <Text style={[styles.modalText, { color: theme.text, marginBottom: 20, textAlign: 'center' }]}>Adjust internal creation date?</Text>
                     <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.accent }]} onPress={() => handleAdjustDay('increase')}><Text style={styles.modalButtonText}>Add 1 Day (Age +1)</Text></TouchableOpacity>
                     <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ff9800' }]} onPress={() => handleAdjustDay('decrease')}><Text style={styles.modalButtonText}>Subtract 1 Day (Age -1)</Text></TouchableOpacity>
                     <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.mode === 'dark' ? '#555' : '#ccc', marginTop: 15 }]} onPress={() => setIsDayAdjustModalVisible(false)}><Text style={[styles.modalButtonText, { color: theme.mode === 'dark' ? '#fff' : '#000'}]}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Celebration Modal - Updated Structure */}
        <Modal animationType="none" transparent={true} visible={showCelebration} onRequestClose={closeCelebration}>
             <Animated.View style={[styles.celebrationModalOverlay, { opacity: fadeAnim }]}>
                <Animated.View style={[styles.celebrationModalContent, { backgroundColor: theme.boxBackground, transform: [{ scale: scaleAnim }] }]}>
                    {/* Title Name */}
                    <Text style={[styles.CongratulationText, { color: theme.text }]}>You've completed a task Hero</Text>
                    {/* Add Image */}
                    <Image
                       source={require('../../assets/images/task_done_aftermath_ill.png')} // Adjust path if needed
                       style={styles.celebrationImage}
                       resizeMode="cover"
                    />
                    {/* Task Name */}
                    <Text style={[styles.celebrationTaskText, { color: theme.text }]}>{completedTaskText}</Text>
                    {/* Quote */}
                    <Text style={[styles.celebrationQuote, { color: theme.text }]}>
                        "You have to work hard in the dark to shine in the light."
                    </Text>
                    <Text style={[styles.celebrationQuoteAuthor, { color: theme.subtext || '#888' }]}>
                        - Kobe Bryant
                    </Text>
                    {/* Continue Button */}
                    <TouchableOpacity style={[styles.celebrationButton, { backgroundColor: theme.accent }]} onPress={closeCelebration}>
                        <Text style={styles.celebrationButtonText}>Continue</Text>
                    </TouchableOpacity>
                </Animated.View>
             </Animated.View>
        </Modal>

        {/* Bottom Navigation */}
        <BottomNavigation theme={theme} onAddTaskPress={addNewTask} />
      </View>
    </KeyboardAvoidingView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, paddingHorizontal: 5, paddingTop: 0, position: 'relative' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 5, marginLeft: 12 },
  headerButtons: { alignItems: 'center', marginRight: 25 },
  content: { paddingTop: 0, paddingBottom: 80, flexGrow: 1 },
  spacerView: { height: 5 },
  keyboardSpace: { height: 100 },
  scrollView: { flex: 1, width: '100%' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  modalContent: { width: width * 0.9, maxHeight: '90%', borderRadius: 15, padding: 20, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  taskOptionContainer: { width: '100%', padding: 15, borderRadius: 10, marginBottom: 20 },
  taskOptionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  taskOptionText: { fontSize: 16, marginBottom: 15, textAlign: 'left', lineHeight: 22 },
  taskOptionButton: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', width: '100%' },
  taskOptionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { marginTop: 10, padding: 12 },
  cancelButtonText: { fontSize: 16, fontWeight: '500' },
  modalDivider: { height: 1, width: '90%', marginVertical: 20 },
  sectionContainer: { marginBottom: 15 },
  contentContainer: { marginBottom: 15 },
  weeklyTrialContainer: { marginBottom: 15 },
  dailyTasksContainer: { width: '100%', minHeight: 150 },
  quotePressable: { flex: 1, marginRight: 10 },
  modalText: { fontSize: 16, marginBottom: 15, textAlign: 'center', lineHeight: 22 },
  modalButton: { width: '85%', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  modalButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  celebrationModalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.75)' },
  celebrationModalContent: { width: width * 0.85, borderRadius: 15, paddingVertical: 30, paddingHorizontal: 20, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  celebrationImage: {
    width: 200, // Adjust size as needed
    height: 200, // Adjust size as needed
    marginBottom: 25,
  },
  CongratulationText: {
    fontSize: 20, // Keep or adjust
    fontWeight: 'bold', // Make task name bold maybe
    textAlign: 'center',
    marginBottom: 20, // Spacing before quote
    paddingHorizontal: 10
},
  celebrationTaskText: {
      fontSize: 17, // Keep or adjust
      fontWeight: 'bold', // Make task name bold maybe
      textAlign: 'center',
      marginBottom: 20, // Spacing before quote
      paddingHorizontal: 10
  },
  celebrationQuote: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
    paddingHorizontal: 15,
    lineHeight: 22,
  },
  celebrationQuoteAuthor: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 30, // Spacing before button
  },
  celebrationButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, alignItems: 'center', width: '70%', alignSelf: 'center' },
  celebrationButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  disabledButton: {
      opacity: 0.5,
  },
});

export default HomepageScreen;