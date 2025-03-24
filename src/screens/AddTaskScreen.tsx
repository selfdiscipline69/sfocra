import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView,
  Platform, Keyboard, TouchableWithoutFeedback, Modal, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { loadTasksFromStorage } from '../utils/taskLoader';
import questsData from '../../assets/Quest.json';
import { createStyles } from '../styles/addTaskStyles';
import AdditionalTaskDisplay from '../components/AdditionalTaskDisplay';
import BottomNavigation from '../components/settings/SettingBottomNavigation';
import { addCustomTask as addCustomTaskUtil } from '../utils/taskAdditionUtils';
import { TaskItem } from '../types/TaskTypes';
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

const AddTaskScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  // Only keep necessary state
  const [additionalTasks, setAdditionalTasks] = useState<TaskItem[]>([]);
  const [userToken, setUserToken] = useState<string>('');
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
  
  useEffect(() => {
    loadTasks();
  }, []);
  
  const loadTasks = async () => {
    try {
      const loadedData = await loadTasksFromStorage();
      setUserToken(loadedData.userToken);
      setAdditionalTasks(loadedData.additionalTasks);
    } catch (error) {
      console.error('Error in loadTasks:', error);
      setAdditionalTasks([]);
    }
  };

  const saveTasks = async () => {
    try {
      if (userToken) {
        await AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(additionalTasks));
      }
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const handleAdditionalTaskChange = (index: number, text: string) => {
    const updated = [...additionalTasks];
    updated[index] = { ...updated[index], text };
    setAdditionalTasks(updated);
    saveTasks();
  };

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
      
      const newTask: TaskItem = {
        text: formattedQuest,
        image: null,
        completed: false,
        showImage: false,
        category: categoryKey as any, // Type conversion for compatibility
        color: getCategoryColor(categoryKey)
      };
      
      const updatedTasks = [...additionalTasks, newTask];
      setAdditionalTasks(updatedTasks);
      
      if (userToken) {
        await AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks));
      }
      
      setModalType('none');
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
      setModalVisible: () => setModalType('none')
    });
  };

  // handleDeleteTask function to remove an additional task
  const handleDeleteTask = (index: number) => {
    const updatedTasks = [...additionalTasks];
    updatedTasks.splice(index, 1);
    setAdditionalTasks(updatedTasks);
    
    if (userToken) {
      AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks));
    }
  };
  
  // Function to open the category selection modal
  const openCategoryModal = () => setModalType('category');
  
  // Function to select a category and close modal
  const selectCategory = (category: string) => {
    setCustomTaskCategory(category);
    setModalType('task');
  };
  
  // Add this function
  const closeAllModals = () => setModalType('none');

  // Add useEffect to handle app state changes
  useEffect(() => {
    // Close modals on component unmount
    return () => {
      closeAllModals();
    };
  }, []);
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Text style={[styles.instructionText, { color: theme.text }]}>
            Add tasks to your list
          </Text>
          
          <ScrollView 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Additional Tasks */}
            <AdditionalTaskDisplay 
              tasks={additionalTasks}
              theme={theme}
              editable={true}
              onChangeTask={handleAdditionalTaskChange}
              onDeleteTask={handleDeleteTask}
            />

            {/* Add New Task Button */}
            <TouchableOpacity 
              style={[styles.addTaskButton, { backgroundColor: theme.accent }]}
              onPress={addNewTask}
            >
              <Text style={[styles.addTaskText, { color: 'white' }]}>+ Add New Task</Text>
            </TouchableOpacity>
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
                          onPress={addCustomTask}
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

          <BottomNavigation theme={theme} activeScreen="settings" />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AddTaskScreen;