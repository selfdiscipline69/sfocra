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
  Pressable,
  Image,
  Animated
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom hooks
import useHomepageData from '../hooks/useHomepageData';
import { useTheme } from '../context/ThemeContext';
import { storageService, normalizeCategory } from '../utils/StorageUtils';

// Components
import ProfileSection from '../components/ProfileSection';
import DailyQuote from '../components/DailyQuote';
import WeeklyTrialSection from '../components/WeeklyTrialSection';
import DailyTaskInput from '../components/DailyTaskInput';
import AdditionalTaskDisplay from '../components/AdditionalTaskDisplay';
import BottomNavigation from '../components/BottomNavigation';
import TimerDisplay from '../components/TimerDisplay';

// Task Addition Utilities
import { addCustomTask } from '../utils/taskAdditionUtils';
import questsData from '../../assets/Quest.json';
import { themes } from '../context/ThemeContext';
import { Task } from '../components/DailyTaskInput';
import { AdditionalTask } from '../types/UserTypes';

const { width } = Dimensions.get('window');

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
  
  // Task Addition State
  const [modalType, setModalType] = useState<'none' | 'task' | 'category'>('none');
  const [randomTask, setRandomTask] = useState<string>('');
  const [customTask, setCustomTask] = useState<string>('');
  const [randomTaskDuration, setRandomTaskDuration] = useState<string>('30');
  const [customTaskDuration, setCustomTaskDuration] = useState<string>('30');
  const [randomTaskCategory, setRandomTaskCategory] = useState<string>('General');
  const [customTaskCategory, setCustomTaskCategory] = useState<string>('Select');
  const [customTaskTime, setCustomTaskTime] = useState<string>('');
  
  // Define available categories for modal
  const taskCategories = ["Fitness", "Learning", "Mindfulness", "Social", "Creativity"];
  
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
      if (!randomTaskObj) { return { task: "Task not found", duration: '0', category: "General" }; }

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

  // Function to add the custom task
  const handleAddCustomTask = async () => {
    if (customTaskCategory === "Select") { Alert.alert('Category Required', 'Please select a category.'); return; }
    if (!customTask.trim()) { Alert.alert('Task Required', 'Please enter a description.'); return; }

    await addCustomTask({ 
        customTask, customTaskTime, customTaskDuration, customTaskCategory,
        additionalTasks: content.additionalTasks || [],
        setAdditionalTasks: actions.setAdditionalTasks,
        userToken: userData.userToken,
        setModalVisible: () => setModalType('none') 
    });
  };

  // Modal controls
  const openCategoryModal = () => setModalType('category');
  const selectCategory = (category: string) => { setCustomTaskCategory(category); setModalType('task'); };
  const closeAllModals = () => setModalType('none');

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
    if (day <= 0 || !userData.userToken) { console.error("Cannot save completion: Invalid age/token."); return; }
    const record = { day, task_name: taskText.split('(')[0].trim(), category: category.toLowerCase(), duration, is_daily: 1, completed_at: Date.now() };
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
    const day = content.accountAge; if (day <= 0 || !userData.userToken) { console.error("Cannot save add. completion: Invalid age/token."); return; }
    const record = { day, task_name: task.text.split('(')[0].trim(), category: category.toLowerCase(), duration, is_daily: 0, completed_at: Date.now() };
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

  // --- Timer Logic ---
  const [activeTimer, setActiveTimer] = useState<{ taskIndex: number; isDaily: boolean; taskName: string; taskId?: string | number; isActive: boolean; startTime: Date | null; timerStopped: boolean; elapsedSeconds: number; } | null>(null);
  const handleTaskLongPress = (index: number, taskItem: Task | AdditionalTask) => {
      if (activeTimer?.isActive) { Alert.alert("Active Timer", "Stop current timer first."); return; }
      let taskText: string, taskId: string | number | undefined, isDaily: boolean;
      if (typeof taskItem === 'object' && taskItem !== null && 'status' in taskItem) { taskText = taskItem.text; taskId = taskItem.id; isDaily = true; }
      else if (typeof taskItem === 'object' && taskItem !== null && 'completed' in taskItem) { taskText = taskItem.text; taskId = taskItem.id; isDaily = false; }
      else { console.error("Invalid task item for long press:", taskItem); return; }
      if (!taskText) return;
    const taskName = taskText.includes('(') ? taskText.split('(')[0].trim() : taskText;
      setActiveTimer({ taskIndex: index, isDaily, taskName, taskId, isActive: true, startTime: new Date(), timerStopped: false, elapsedSeconds: 0 });
  };
  const handleStopTimer = () => {
    if (!activeTimer || !activeTimer.startTime) return;
    const elapsed = activeTimer.isActive ? Math.floor((Date.now() - activeTimer.startTime.getTime()) / 1000) : 0;
    setActiveTimer(prev => prev ? { ...prev, isActive: false, timerStopped: true, elapsedSeconds: prev.elapsedSeconds + elapsed, startTime: null } : null);
  };
  const handleResumeTimer = () => {
    if (!activeTimer || activeTimer.isActive) return;
    const adjustedStartTime = new Date(Date.now() - (activeTimer.elapsedSeconds * 1000));
    setActiveTimer(prev => prev ? { ...prev, isActive: true, timerStopped: false, startTime: adjustedStartTime } : null);
  };
  const handleDiscardTimer = () => {
      console.log("Discarding timer");
      setActiveTimer(null); // Simply remove the timer state
  };
  const handleFinishTimer = () => {
    if (!activeTimer) return;
    let finalElapsedSeconds = activeTimer.elapsedSeconds;
    if (activeTimer.isActive && activeTimer.startTime) {
        finalElapsedSeconds += Math.floor((Date.now() - activeTimer.startTime.getTime()) / 1000);
    }
    const { taskIndex, isDaily, taskId, taskName } = activeTimer;
    console.log(`Finishing timer: ${isDaily ? 'Daily' : 'Add.'} idx ${taskIndex}, ID ${taskId}, Name: ${taskName}, Elapsed: ${finalElapsedSeconds}s`);
    setActiveTimer(null); // Reset timer state first
    if (isDaily) {
        const taskItem = content.dailyTasks?.[taskIndex];
        if (typeof taskItem === 'object' && taskItem !== null && (taskItem.id === taskId || !taskId)) { handleTaskComplete(taskIndex); }
        else { console.error(`Daily task mismatch on finish: idx ${taskIndex}, ID ${taskId}`); }
    } else {
        const currentTasks: AdditionalTask[] = content.additionalTasks || [];
        if (taskIndex < currentTasks.length) {
             const taskItem = currentTasks[taskIndex];
             if (taskItem && (taskItem.id === taskId || !taskId)) { handleAdditionalTaskComplete(taskIndex); }
             else { console.error(`Add. task mismatch on finish: idx ${taskIndex}, ID ${taskId}`); }
        } else { console.error(`Invalid add. task index on finish: ${taskIndex}`); }
    }
  };
  // --- End Timer Logic ---

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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: theme.background }]} keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20} >
      <View style={styles.innerContainer}>
        {/* Active Timer Display - Add onDiscard */}
        {activeTimer && (
          <TimerDisplay
            isRunning={activeTimer.isActive}
            taskName={activeTimer.taskName}
            startTime={activeTimer.startTime || undefined}
            onStop={handleStopTimer}
            timerStopped={activeTimer.timerStopped}
            onFinish={handleFinishTimer}
            onResume={handleResumeTimer}
            onDiscard={handleDiscardTimer}
            elapsedSeconds={activeTimer.elapsedSeconds}
            theme={theme}
          />
        )}

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
            {/* Daily Tasks */}
            <View style={styles.dailyTasksContainer}>
              <DailyTaskInput tasks={content.dailyTasks || []} theme={theme} onTaskComplete={handleTaskComplete} onTaskCancel={handleTaskCancel} onTaskLongPress={(index, taskItem) => handleTaskLongPress(index, taskItem as Task)} />
            </View>
          </View>
          {/* Additional Tasks */}
          <View style={styles.sectionContainer}>
            <AdditionalTaskDisplay tasks={content.additionalTasks || []} theme={theme} onTaskComplete={handleAdditionalTaskComplete} onTaskCancel={handleAdditionalTaskCancel} onTaskLongPress={(index, taskItem) => handleTaskLongPress(index, taskItem as AdditionalTask)} />
          </View>
          <View style={styles.keyboardSpace} />
        </ScrollView>

        {/* Modals */}
        {/* Task Choice Modal */}
         <Modal animationType="slide" transparent={true} visible={modalType === 'task'} onRequestClose={closeAllModals}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                 <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.boxBackground }]}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Your Task</Text>
                    {/* Random Task Option */}
                    <View style={[styles.taskOptionContainer, { backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }]}>
                      <Text style={[styles.taskOptionTitle, { color: theme.text }]}>Suggested Task:</Text>
                            <Text style={[styles.taskOptionText, { color: theme.text }]}>{randomTask} ({randomTaskDuration}) - {randomTaskCategory}</Text>
                            <TouchableOpacity style={[styles.taskOptionButton, { backgroundColor: theme.accent }]} onPress={addRandomTask}><Text style={styles.taskOptionButtonText}>Use This Task</Text></TouchableOpacity>
                    </View>
                    <View style={[styles.modalDivider, { backgroundColor: theme.mode === 'dark' ? '#555' : '#ddd' }]} />
                    {/* Custom Task Option */}
                    <View style={styles.taskOptionContainer}>
                      <Text style={[styles.taskOptionTitle, { color: theme.text }]}>Create Custom Task:</Text>
                           <TextInput style={[styles.taskOptionInput, { backgroundColor: theme.mode === 'dark' ? '#444' : '#f5f5f5', color: theme.text, borderColor: theme.mode === 'dark' ? '#555' : '#ddd', borderWidth: 1 }]} placeholder="Enter your task" placeholderTextColor={theme.mode === 'dark' ? '#aaa' : '#888'} value={customTask} onChangeText={setCustomTask} />
                      <View style={styles.taskDetailsRow}>
                        <View style={styles.taskDetailItem}>
                          <Text style={[styles.taskDetailLabel, { color: theme.text }]}>Duration (min)</Text>
                                   <TextInput style={[styles.taskDetailInput, { backgroundColor: theme.mode === 'dark' ? '#444' : '#f5f5f5', color: theme.text, borderColor: theme.mode === 'dark' ? '#555' : '#ddd', borderWidth: 1 }]} placeholder="30" placeholderTextColor={theme.mode === 'dark' ? '#aaa' : '#888'} keyboardType="numeric" value={customTaskDuration} onChangeText={setCustomTaskDuration} />
                        </View>
                        <View style={styles.taskDetailItem}>
                          <Text style={[styles.taskDetailLabel, { color: theme.text }]}>Category</Text>
                                   <TouchableOpacity onPress={openCategoryModal} style={[styles.taskDetailInput, { backgroundColor: theme.mode === 'dark' ? '#444' : '#f5f5f5', borderColor: theme.mode === 'dark' ? '#555' : '#ddd', borderWidth: 1, justifyContent: 'center', alignItems: 'flex-start', paddingHorizontal: 12, height: 45 }]}>
                                       <Text style={{ color: customTaskCategory === "Select" ? (theme.mode === 'dark' ? '#aaa' : '#888') : theme.text }}>{customTaskCategory}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                             <View style={[styles.taskDetailItem, { width: '100%', marginBottom: 10 }]}>
                        <Text style={[styles.taskDetailLabel, { color: theme.text }]}>Time (optional)</Text>
                               <TextInput style={[styles.taskDetailInput, { backgroundColor: theme.mode === 'dark' ? '#444' : '#f5f5f5', color: theme.text, borderColor: theme.mode === 'dark' ? '#555' : '#ddd', borderWidth: 1 }]} placeholder="e.g., 3:30 PM" placeholderTextColor={theme.mode === 'dark' ? '#aaa' : '#888'} value={customTaskTime} onChangeText={setCustomTaskTime} />
                      </View>
                            <TouchableOpacity style={[styles.taskOptionButton, { backgroundColor: theme.accent, marginTop: 10 }]} onPress={handleAddCustomTask}><Text style={styles.taskOptionButtonText}>Add Custom Task</Text></TouchableOpacity>
                    </View>
                       {/* Fix: Move Cancel button inside TouchableWithoutFeedback */}
                       <TouchableOpacity style={styles.cancelButton} onPress={closeAllModals}><Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text></TouchableOpacity>
                </View>
            </View>
             </TouchableWithoutFeedback>
         </Modal>

          {/* Category Selection Modal */}
        <Modal animationType="fade" transparent={true} visible={modalType === 'category'} onRequestClose={() => setModalType('task')}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.boxBackground }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Select Category</Text>
                    {taskCategories.map((category, index) => ( <TouchableOpacity key={index} style={[styles.categoryButton, { backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }]} onPress={() => selectCategory(category)}> <Text style={[styles.categoryButtonText, { color: theme.text }]}>{category}</Text> </TouchableOpacity> ))}
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setModalType('task')}><Text style={[styles.cancelButtonText, { color: theme.text }]}>Back</Text></TouchableOpacity>
              </View>
            </View>
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
  taskOptionInput: { width: '100%', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, height: 50, borderWidth: 1 },
  taskDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15 },
  taskDetailItem: { width: '48%' },
  taskDetailLabel: { fontSize: 14, marginBottom: 6, fontWeight: '500' },
  taskDetailInput: { borderRadius: 8, height: 45, paddingHorizontal: 12, borderWidth: 1, justifyContent: 'center' },
  taskOptionButton: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', width: '100%' },
  taskOptionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { marginTop: 10, padding: 12 },
  cancelButtonText: { fontSize: 16, fontWeight: '500' },
  modalDivider: { height: 1, width: '90%', marginVertical: 20 },
  categoryButton: { width: '100%', padding: 15, borderRadius: 8, marginBottom: 12, alignItems: 'center' },
  categoryButtonText: { fontSize: 16, fontWeight: '500' },
  sectionContainer: { marginBottom: 15 },
  contentContainer: { marginBottom: 15 },
  weeklyTrialContainer: { marginBottom: 15 },
  dailyTasksContainer: { width: '100%', minHeight: 150 },
  quotePressable: { flex: 1, marginRight: 10 },
  modalText: { fontSize: 16, marginBottom: 15, textAlign: 'center', lineHeight: 22 },
  modalButton: { width: '85%', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  modalButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  celebrationModalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.75)' }, // Darker overlay maybe
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
  celebrationButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, alignItems: 'center', width: '70%', alignSelf: 'center' }, // Make button slightly smaller?
  celebrationButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default HomepageScreen;