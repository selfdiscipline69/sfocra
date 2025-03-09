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
  Alert
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import questsData from '../../assets/Quest.json';

const { width } = Dimensions.get('window');

export default function AddTaskScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [weeklyTrial, setWeeklyTrial] = useState({
    text: '',
    image: null,
    completed: false,
    showImage: false
  });
  const [additionalTasks, setAdditionalTasks] = useState([]);
  const [userToken, setUserToken] = useState('');
  const [visibleImages, setVisibleImages] = useState({
    weekly: false,
    daily: {},
    additional: {}
  });

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
      setUserToken(token);

      if (token) {
        // Load weekly trial - first try from our saved tasks
        const savedWeeklyTrial = await AsyncStorage.getItem(`weeklyTrial_${token}`);
        
        if (savedWeeklyTrial) {
          // We have a saved weekly trial with image
          setWeeklyTrial(JSON.parse(savedWeeklyTrial));
        } else {
          // Try to get from homepage's weekly trial
          const weeklyTrialText = await AsyncStorage.getItem('weeklyTrial');
          if (weeklyTrialText) {
            setWeeklyTrial({
              text: weeklyTrialText,
              image: null,
              completed: false,
              showImage: false
            });
          } else {
            // Use fallback if nothing is found
            setWeeklyTrial({
              text: "Working out in the gym (60 min) - Physical",
              image: null,
              completed: false,
              showImage: false
            });
          }
        }

        // Load daily tasks
        const savedDailyTasks = await AsyncStorage.getItem(`dailyTasks_${token}`);
        
        if (savedDailyTasks) {
          setTasks(JSON.parse(savedDailyTasks));
        } else {
          // Try to load from homepage
          const dailyTasksStr = await AsyncStorage.getItem('dailyTasks');
          if (dailyTasksStr) {
            try {
              const parsedTasks = JSON.parse(dailyTasksStr);
              const formattedTasks = Array.isArray(parsedTasks) ? parsedTasks.map(task => ({
                text: task,
                image: null,
                completed: false,
                showImage: false
              })) : [
                { text: "No daily task available", image: null, completed: false, showImage: false },
                { text: "No daily task available", image: null, completed: false, showImage: false }
              ];
              setTasks(formattedTasks);
            } catch (e) {
              console.error('Error parsing daily tasks:', e);
              setTasks([
                { text: "No daily task available", image: null, completed: false, showImage: false },
                { text: "No daily task available", image: null, completed: false, showImage: false }
              ]);
            }
          } else {
            // Initialize with two empty tasks if nothing is found
            setTasks([
              { text: "No daily task available", image: null, completed: false, showImage: false },
              { text: "No daily task available", image: null, completed: false, showImage: false }
            ]);
          }
        }

        // Load additional tasks
        const savedAdditionalTasks = await AsyncStorage.getItem(`additionalTasks_${token}`);
        if (savedAdditionalTasks) {
          setAdditionalTasks(JSON.parse(savedAdditionalTasks));
        }
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
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

  const handleTaskChange = (index, text) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], text };
    setTasks(updatedTasks);
    saveTasks();
  };

  const handleAdditionalTaskChange = (index, text) => {
    const updated = [...additionalTasks];
    updated[index] = { ...updated[index], text };
    setAdditionalTasks(updated);
    saveTasks();
  };

  const handleWeeklyTrialChange = (text) => {
    setWeeklyTrial(prev => ({ ...prev, text }));
    saveTasks();
  };

  const pickImage = async (type, index) => {
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
        } else if (type === 'daily') {
          const updatedTasks = [...tasks];
          updatedTasks[index] = { 
            ...updatedTasks[index], 
            image: selectedImage,
            completed: true,
            showImage: false // Default to hidden
          };
          setTasks(updatedTasks);
        } else if (type === 'additional') {
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

  const toggleImageVisibility = (type, index) => {
    if (type === 'weekly') {
      setWeeklyTrial(prev => ({
        ...prev,
        showImage: !prev.showImage
      }));
    } else if (type === 'daily') {
      const updatedTasks = [...tasks];
      updatedTasks[index] = {
        ...updatedTasks[index],
        showImage: !updatedTasks[index].showImage
      };
      setTasks(updatedTasks);
    } else if (type === 'additional') {
      const updated = [...additionalTasks];
      updated[index] = {
        ...updated[index],
        showImage: !updated[index].showImage
      };
      setAdditionalTasks(updated);
    }
  };

  const addNewTask = () => {
    try {
      // Select random quest from the quests data
      if (questsData.length > 0) {
        const randomIndex = Math.floor(Math.random() * questsData.length);
        const randomQuest = questsData[randomIndex];
        
        const formattedQuest = `${randomQuest.task || "Task"} (${randomQuest.duration_minutes || 30} min) - ${randomQuest.category || "General"}`;
        const newTask = {
          text: formattedQuest,
          image: null,
          completed: false,
          showImage: false
        };
        
        setAdditionalTasks(prev => [...prev, newTask]);
        saveTasks();
      } else {
        // Fallback if no quest data available
        const newTask = {
          text: "New task",
          image: null,
          completed: false,
          showImage: false
        };
        setAdditionalTasks(prev => [...prev, newTask]);
        saveTasks();
      }
    } catch (error) {
      console.error('Error adding new task:', error);
    }
  };

  // Add this function to handle task deletion
  const handleDeleteTask = (index) => {
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
            backgroundColor: 'red',
            height: 100,
          },
          headerTitleStyle: {
            fontSize: 16,
            color: 'white',
          },
          headerTitle: "Track Your Progress",
        }} 
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <Text style={styles.instructionText}>
              Upload photos to mark your journey
            </Text>
            
            <ScrollView 
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Weekly Trial Box */}
              <View style={[
                styles.taskContainer, 
                weeklyTrial.completed ? styles.completedTaskWeekly : styles.weeklyTaskContainer
              ]}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>Weekly Trial</Text>
                  <TouchableOpacity 
                    style={styles.photoButton}
                    onPress={() => pickImage('weekly')}
                  >
                    <Text style={styles.photoButtonText}>➕ Photo</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.taskContent}>
                  <TextInput
                    style={styles.taskInput}
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
                      style={styles.showProofButton}
                      onPress={() => toggleImageVisibility('weekly')}
                    >
                      <Text style={styles.showProofText}>
                        {weeklyTrial.showImage ? 'Hide Picture of Proof' : 'Show Picture of Proof'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Daily Tasks */}
              {tasks.map((task, index) => (
                <View 
                  key={`daily-${index}`} 
                  style={[
                    styles.taskContainer, 
                    task.completed ? styles.completedTaskDaily : styles.dailyTaskContainer
                  ]}
                >
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>Daily Task {index + 1}</Text>
                    <TouchableOpacity 
                      style={styles.photoButton}
                      onPress={() => pickImage('daily', index)}
                    >
                      <Text style={styles.photoButtonText}>➕ Photo</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.taskContent}>
                    <TextInput
                      style={styles.taskInput}
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
                        style={styles.showProofButton}
                        onPress={() => toggleImageVisibility('daily', index)}
                      >
                        <Text style={styles.showProofText}>
                          {task.showImage ? 'Hide Picture of Proof' : 'Show Picture of Proof'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}

              {/* Additional Tasks */}
              {additionalTasks.map((task, index) => (
                <View 
                  key={`additional-${index}`} 
                  style={[
                    styles.taskContainer, 
                    task.completed ? styles.completedTaskDaily : styles.dailyTaskContainer
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
                      <Text style={styles.taskTitle}>Extra Task {index + 1}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.photoButton}
                      onPress={() => pickImage('additional', index)}
                    >
                      <Text style={styles.photoButtonText}>➕ Photo</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.taskContent}>
                    <TextInput
                      style={styles.taskInput}
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
                        style={styles.showProofButton}
                        onPress={() => toggleImageVisibility('additional', index)}
                      >
                        <Text style={styles.showProofText}>
                          {task.showImage ? 'Hide Picture of Proof' : 'Show Picture of Proof'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}

              {/* Add New Task Button */}
              <TouchableOpacity 
                style={styles.addTaskButton}
                onPress={addNewTask}
              >
                <Text style={styles.addTaskText}>+ Add New Extra Task</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Bottom Navigation Icons */}
            <View style={styles.bottomNav}>
              <TouchableOpacity onPress={() => router.push('/(tabs)/performance')}>
                <Text style={styles.icon}>📈</Text>
              </TouchableOpacity>
              
              {/* Home button with text instead of emoji */}
              <TouchableOpacity 
                style={styles.homeButton} 
                onPress={() => router.push('/(tabs)/homepage')}
              >
                <Text style={styles.homeButtonText}>Home</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/settings')}
                accessibilityLabel="Settings"
              >
                <Text style={styles.icon}>⚙️</Text>
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
    backgroundColor: 'black',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 5,
    paddingTop: 10,
  },
  instructionText: {
    color: 'white',
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
});

export const unstable_settings = {
  // This ensures the tab bar is displayed correctly
  bottomTabs: {
    tabBarStyle: { display: 'flex' },
  },
};