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
import { Portal } from 'react-native-portalize';

const { width } = Dimensions.get('window');

// Define TypeScript interfaces for task types
interface TaskItem {
  text: string;
  image: string | null;
  completed: boolean;
  showImage: boolean;
}

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
      
      setRandomTask(randomQuest.task || "Task");
      setRandomTaskDuration(randomQuest.duration || '30');
      setRandomTaskCategory(randomQuest.category || "General");
      
      return {
        task: randomQuest.task || "Task",
        duration: randomQuest.duration || '30',
        category: randomQuest.category || "General"
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
      const newTask: TaskItem = {
        text: formattedQuest,
        image: null,
        completed: false,
        showImage: false
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
      setModalType
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
    setModalType('none');
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
              style={[styles.addTaskButton, { backgroundColor: theme.mode === 'dark' ? '#444' : '#ccc' }]}
              onPress={addNewTask}
            >
              <Text style={[styles.addTaskText, { color: theme.text }]}>+ Add New Task</Text>
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
                      <View style={styles.taskOptionContainer}>
                        <Text style={[styles.taskOptionTitle, { color: theme.text }]}>Suggested Task:</Text>
                        <Text style={[styles.taskOptionText, { color: theme.text }]}>
                          {randomTask} ({randomTaskDuration}) - {randomTaskCategory}
                        </Text>
                        <TouchableOpacity 
                          style={styles.taskOptionButton}
                          onPress={addRandomTask}
                        >
                          <Text style={styles.taskOptionButtonText}>Use This Task</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.modalDivider} />
                      
                      {/* Custom Task Option */}
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
                          <View style={[styles.taskDetailItem, { flex: 1 }]}>
                            <TextInput
                              style={[styles.taskDetailInput, { color: theme.text }]}
                              keyboardType="numeric"
                              placeholder="Duration (minutes, km, etc.)"
                              placeholderTextColor="#999" 
                              //value={customTaskDuration}
                              onChangeText={setCustomTaskDuration}
                            />
                          </View>
                          
                          {/* Add Category Selection Button */}
                          <TouchableOpacity 
                            style={[
                              styles.categoryButton, 
                              { 
                                backgroundColor: theme.mode === 'dark' ? '#333' : '#eee',
                                borderColor: 'blue',
                                borderWidth: 2,  // Make it clearly visible
                              }
                            ]}
                            onPress={() => {
                              console.log('Category button pressed');
                              openCategoryModal();
                            }}
                          >
                            <Text style={[styles.categoryButtonText, { color: theme.text }]}>
                              {customTaskCategory} ▼
                            </Text>
                          </TouchableOpacity>
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
                        onPress={() => setModalType('none')}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            )}
            
            {modalType === 'category' && (
              <TouchableWithoutFeedback onPress={() => setModalType('none')}>
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                }}>
                  <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
                    <View 
                      style={{
                        width: width * 0.8,
                        backgroundColor: theme.boxBackground,
                        borderRadius: 15,
                        padding: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                      }}
                    >
                      {/* Category dropdown content */}
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 20 }}>
                        Select Category
                      </Text>
                      
                      {taskCategories.map((category) => (
                        <TouchableOpacity 
                          key={category}
                          style={{
                            width: '100%',
                            paddingVertical: 12,
                            paddingHorizontal: 15,
                            borderRadius: 8,
                            marginBottom: 8,
                            backgroundColor: customTaskCategory === category ? '#2196F3' : 'transparent',
                          }}
                          onPress={() => selectCategory(category)}
                        >
                          <Text style={{
                            fontSize: 16,
                            textAlign: 'center',
                            color: customTaskCategory === category ? 'white' : theme.text,
                            fontWeight: customTaskCategory === category ? 'bold' : 'normal',
                          }}>
                            {category}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      
                      <TouchableOpacity
                        style={{
                          marginTop: 10,
                          padding: 12,
                          backgroundColor: '#555',
                          borderRadius: 8,
                          width: '100%',
                          alignItems: 'center',
                        }}
                        onPress={() => setModalType('none')}
                      >
                        <Text style={{ color: 'white', fontSize: 14 }}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            )}
          </Modal>

          <BottomNavigation theme={theme} activeScreen="homepage" />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AddTaskScreen;