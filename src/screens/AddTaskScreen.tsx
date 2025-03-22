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
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [randomTask, setRandomTask] = useState<string>('');
  const [customTask, setCustomTask] = useState<string>('');
  const [randomTaskDuration, setRandomTaskDuration] = useState<string>('30');
  const [customTaskDuration, setCustomTaskDuration] = useState<string>('30');
  const [randomTaskCategory, setRandomTaskCategory] = useState<string>('General');
  const [customTaskCategory, setCustomTaskCategory] = useState<string>('General');
  const [customTaskTime, setCustomTaskTime] = useState<string>('');

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
      setModalVisible(true);
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
    const updatedTasks = [...additionalTasks];
    updatedTasks.splice(index, 1);
    setAdditionalTasks(updatedTasks);
    
    if (userToken) {
      AsyncStorage.setItem(`additionalTasks_${userToken}`, JSON.stringify(updatedTasks));
    }
  };
  
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
                          <View style={styles.taskDetailItem}>
                            <TextInput
                              style={[styles.taskDetailInput, { color: theme.text }]}
                              keyboardType="numeric"
                              placeholder="Duration (minutes, km, etc.)"
                              placeholderTextColor="#999" 
                              //value={customTaskDuration}
                              onChangeText={setCustomTaskDuration}
                            />
                          </View>
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
                    </>
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