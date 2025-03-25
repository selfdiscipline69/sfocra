import React, { useState } from 'react';
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
  TextInput
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

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

// Task Addition Utilities
import { addCustomTask } from '../utils/taskAdditionUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import questsData from '../../assets/Quest.json';
import { themes } from '../context/ThemeContext';

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
  const [customTaskCategory, setCustomTaskCategory] = useState<string>('General');
  const [customTaskTime, setCustomTaskTime] = useState<string>('');
  
  // Define available categories
  const taskCategories = ["General", "Fitness", "Knowledge", "Mindfulness", "Social", "Creativity"];
  
  // Determine categories for tasks
  const weeklyTrialCategory = React.useMemo(() => 
    content.weeklyTrial ? getTaskCategory(content.weeklyTrial) : undefined, 
    [content.weeklyTrial]
  );
  
  const dailyTaskCategories = React.useMemo(() => 
    content.dailyTasks.map(task => getTaskCategory(task)),
    [content.dailyTasks]
  );
  
  // Fix the infinite loop by using a ref to track if we've loaded data
  const dataLoadedRef = React.useRef(false);
  
  useFocusEffect(
    React.useCallback(() => {
      // Only reload data if we haven't already or if returning to the screen
      if (!dataLoadedRef.current) {
        console.log("Homepage focused - reloading data");
        actions.refreshData();
        dataLoadedRef.current = true;
      }
      return () => {
        // When screen loses focus, allow data to be reloaded next time
        dataLoadedRef.current = false;
      };
    }, [actions.refreshData]) // Only include the stable refreshData function
  );

  // Generate a random task for the modal
  const generateRandomTask = () => {
    if (questsData.length > 0) {
      const randomIndex = Math.floor(Math.random() * questsData.length);
      const randomQuest = questsData[randomIndex];
      
      // Extract category from the key if it exists, or use a default
      const category = randomQuest.key ? 
        (randomQuest.key.startsWith('1-') ? 'Mindfulness' :
         randomQuest.key.startsWith('2-') ? 'Fitness' :
         randomQuest.key.startsWith('3-') ? 'General' : 'General') : 
        'General';
      
      setRandomTask(randomQuest.task || "Task");
      setRandomTaskDuration(randomQuest.duration || '30');
      setRandomTaskCategory(category);
      
      return {
        task: randomQuest.task || "Task",
        duration: randomQuest.duration || '30',
        category: category
      };
    }
    return {
      task: "New task",
      duration: '30',
      category: "General"
    };
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
      setCustomTaskCategory('General');
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
      
      // Map to a category format our system recognizes
      let categoryKey = randomTaskCategory.toLowerCase();
      if (categoryKey === 'knowledge') categoryKey = 'learning';
      
      const newTask = {
        text: formattedQuest,
        image: null,
        completed: false,
        showImage: false,
        category: categoryKey as any, // Type conversion for compatibility
        color: getCategoryColor(categoryKey)
      };
      
      // Create updated tasks array
      const updatedTasks = [...content.additionalTasks, newTask];
      
      // Use the new function from our hook
      actions.setAdditionalTasks(updatedTasks);
      
      setModalType('none');
    } catch (error) {
      console.error('Error adding random task:', error);
    }
  };

  // Function to add the custom task
  const handleAddCustomTask = async () => {
    await addCustomTask({
      customTask,
      customTaskTime,
      customTaskDuration,
      customTaskCategory,
      additionalTasks: content.additionalTasks,
      setAdditionalTasks: actions.setAdditionalTasks,
      userToken: userData.userToken,
      setModalVisible: () => setModalType('none')
    });
  };

  // Function to open the category selection modal
  const openCategoryModal = () => setModalType('category');
  
  // Function to select a category and close modal
  const selectCategory = (category: string) => {
    setCustomTaskCategory(category);
    setModalType('task');
  };
  
  // Close all modals
  const closeAllModals = () => setModalType('none');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
    >
      <View style={styles.innerContainer}>
        {/* Remove fixed header section and put everything in the ScrollView */}
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true} 
          scrollEnabled={true}
          style={styles.scrollView}
        >
          {/* Header with Profile and Quote */}
          <View style={styles.header}>
            <DailyQuote quote={content.dailyQuote} theme={theme} />
            
            <View style={styles.headerButtons}>
              <ProfileSection 
                profileImage={userData.profileImage} 
                userHandle={userData.userHandle}
                theme={theme}
              />
            </View>
          </View>
          
          <View style={styles.spacerView} />
          
          {/* Weekly Trial Section */}
          <WeeklyTrialSection 
            weeklyTrial={content.weeklyTrial} 
            theme={theme}
            category={weeklyTrialCategory as any}
          />

          {/* Daily Tasks */}
          <DailyTaskInput 
            tasks={content.dailyTasks} 
            onChangeTask={actions.handleTaskChange}
            theme={theme}
            categories={dailyTaskCategories as any}
          />
          
          {/* Additional Tasks */}
          <AdditionalTaskDisplay 
            tasks={content.additionalTasks}
            theme={theme}
          />
          
          
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
                                paddingHorizontal: 12
                              }
                            ]}
                          >
                            <Text style={{ color: theme.text }}>{customTaskCategory}</Text>
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
                        style={[styles.taskOptionButton, { backgroundColor: theme.accent, marginTop: 50 }]}
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
                  onPress={closeAllModals}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Modal>

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
});

export default HomepageScreen;
