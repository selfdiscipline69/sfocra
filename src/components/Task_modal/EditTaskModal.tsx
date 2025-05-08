import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  Switch, // For the recurrence toggle
} from 'react-native';
import { TaskData } from '../../types/UserTypes'; // Assuming TaskData is in UserTypes
import TaskLibrary from '../../../assets/TaskLibrary.json'; // Adjust path if necessary
import { themes } from '../../context/ThemeContext'; // Or pass theme as prop
import CustomTaskSelector, { CustomTaskSelectorRef } from '../addTask/CustomTaskSelector'; // For task/intensity selection
import RecurrenceSelector from './RecurrenceSelector'; // Import the new component
import TimeSelector from './TimeSelector'; // Import the TimeSelector component

const { width, height } = Dimensions.get('window');

// Define types for TaskLibrary structure (consistent with other files)
type TaskDetails = {
  task: string;
  category: string;
  intensities: { [key: string]: { duration: string } };
};

type TaskLibraryType = {
  task_category: { [key: string]: string[] };
  [key: string]: TaskDetails | { [key: string]: string[] };
};
const TypedTaskLibrary = TaskLibrary as TaskLibraryType;

interface EditTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  taskToEdit: TaskData | null;
  onSave: (updatedTask: TaskData) => void;
  theme: any; // Replace with proper theme type
}

// Helper to get task name from TaskLibrary
const getTaskNameFromLibrary = (taskKey: string): string => {
  const taskDetail = TypedTaskLibrary[taskKey] as TaskDetails | undefined;
  return taskDetail?.task || 'Unknown Task';
};

// Helper to get intensity duration from TaskLibrary
const getIntensityDurationFromLibrary = (taskKey: string, intensityKey: string): string => {
  const taskDetail = TypedTaskLibrary[taskKey] as TaskDetails | undefined;
  return taskDetail?.intensities?.[intensityKey]?.duration || 'Unknown Intensity';
};


const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isVisible,
  onClose,
  taskToEdit,
  onSave,
  theme,
}) => {
  // Form state
  const [category, setCategory] = useState<string>('');
  const [taskName, setTaskName] = useState<string>('');
  const [intensity, setIntensity] = useState<string>('');
  const [isRecurrent, setIsRecurrent] = useState<boolean>(false);
  const [recurrentFrequency, setRecurrentFrequency] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [startTime, setStartTime] = useState<string>('00:00'); // HH:MM format
  const [note, setNote] = useState<string>('');

  // For Task/Intensity selection
  const [isTaskSelectorVisible, setIsTaskSelectorVisible] = useState<boolean>(false);
  const customTaskSelectorRef = React.useRef<CustomTaskSelectorRef>(null);
  const [currentTaskKey, setCurrentTaskKey] = useState<string | null>(null);
  const [currentIntensityKey, setCurrentIntensityKey] = useState<string | null>(null);

  // Populate form when taskToEdit changes
  useEffect(() => {
    if (taskToEdit) {
      setCategory(taskToEdit.category || 'general'); // Default to general if not set
      setTaskName(taskToEdit.taskName);
      setIntensity(taskToEdit.intensity);
      setIsRecurrent(taskToEdit.is_Recurrent || false);
      setRecurrentFrequency(taskToEdit.Recurrent_frequency || [0, 0, 0, 0, 0, 0, 0]);
      setStartTime(taskToEdit.start_time || '00:00');
      setNote(taskToEdit.note || '');

      // Attempt to find taskKey and intensityKey if they exist in TaskLibrary
      // This is a simplified approach; a more robust method would be needed if taskName/intensity
      // don't perfectly match TaskLibrary structure or if taskToEdit already has taskKey/intensityKey
      const foundTaskKey = Object.keys(TypedTaskLibrary).find(key => {
        const entry = TypedTaskLibrary[key] as TaskDetails;
        return entry.task === taskToEdit.taskName && entry.category === (taskToEdit.category || 'general');
      });
      setCurrentTaskKey(foundTaskKey || null);

      if (foundTaskKey) {
        const taskDetail = TypedTaskLibrary[foundTaskKey] as TaskDetails;
        const foundIntensityKey = Object.keys(taskDetail.intensities || {}).find(
          intKey => taskDetail.intensities[intKey].duration === taskToEdit.intensity
        );
        setCurrentIntensityKey(foundIntensityKey || null);
      } else {
        setCurrentIntensityKey(null);
      }


    } else {
      // Reset form if no task to edit (e.g., modal closed then opened for new task - though this modal is for edit)
      setCategory('general');
      setTaskName('');
      setIntensity('');
      setIsRecurrent(false);
      setRecurrentFrequency([0, 0, 0, 0, 0, 0, 0]);
      setStartTime('00:00');
      setNote('');
      setCurrentTaskKey(null);
      setCurrentIntensityKey(null);
    }
  }, [taskToEdit]);

  const handleSave = () => {
    if (!taskToEdit) return;
    if (!category || !taskName || !intensity) {
      Alert.alert('Validation Error', 'Category, Task Name, and Intensity are required.');
      return;
    }

    const updatedTask: TaskData = {
      ...taskToEdit,
      category,
      taskName,
      intensity,
      is_Recurrent: isRecurrent,
      Recurrent_frequency: recurrentFrequency,
      start_time: startTime,
      note,
      // XP and other fields like id, is_daily, status, completed_at, day should be preserved from taskToEdit
    };
    onSave(updatedTask);
    onClose(); // Close modal after saving
  };

  const handleRecurrenceFrequencyChange = (newFrequency: number[]) => {
    setRecurrentFrequency(newFrequency);
  };

  const handleCustomTaskSelectionChange = (selection: { category: string | null; taskKey: string | null; intensityKey: string | null }) => {
    if (selection.category) {
        // If the task is additional, allow category change. Otherwise, category is fixed.
        if (!taskToEdit?.is_daily) {
            setCategory(selection.category);
        }
    }
    if (selection.taskKey) {
      setTaskName(getTaskNameFromLibrary(selection.taskKey));
      setCurrentTaskKey(selection.taskKey); // Keep track of the key
    }
    if (selection.taskKey && selection.intensityKey) {
      setIntensity(getIntensityDurationFromLibrary(selection.taskKey, selection.intensityKey));
      setCurrentIntensityKey(selection.intensityKey); // Keep track of the key
    }
  };

  // Memoize available categories for the category picker
  const availableCategories = useMemo(() => Object.keys(TypedTaskLibrary.task_category || {}), []);

  const handleTimeChange = (newTime: string) => {
    setStartTime(newTime);
  };

  if (!taskToEdit) {
    return null; // Don't render if no task is provided
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.backgroundAlt || theme.boxBackground }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Task</Text>
          
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
            {/* Category Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Category</Text>
              {taskToEdit.is_daily ? (
                <Text style={[styles.input, { color: theme.text, lineHeight: 40 }]}>{category}</Text>
              ) : (
                 // Basic Picker for additional tasks (replace with a nicer one if needed)
                <TouchableOpacity onPress={() => Alert.alert("Category Picker", "Implement a category picker here")} style={[styles.input, { justifyContent: 'center', borderColor: theme.border }]}>
                    <Text style={{ color: theme.text }}>{category}</Text>
                </TouchableOpacity>
                // Or a proper picker component
              )}
            </View>

            {/* TaskName & Intensity Selector Button */}
            <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Task & Intensity</Text>
                <TouchableOpacity
                    style={[styles.input, styles.selectorButton, { borderColor: theme.border }]}
                    onPress={() => setIsTaskSelectorVisible(true)}
                >
                    <Text style={[styles.selectorButtonText, { color: theme.text }]} numberOfLines={1}>
                        {taskName || 'Select Task'} ({intensity || 'Select Intensity'})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Recurrence */}
            <View style={styles.formGroup}>
              <View style={styles.recurrenceHeader}>
                <Text style={[styles.label, { color: theme.text }]}>Recurrent</Text>
                <Switch
                  trackColor={{ false: theme.mode === 'dark' ? "#767577" : "#E9E9EA" , true: theme.accentFaded || "#81b0ff" }}
                  thumbColor={isRecurrent ? theme.accent : (theme.mode === 'dark' ? "#f4f3f4" : "#f4f3f4")}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={setIsRecurrent}
                  value={isRecurrent}
                />
              </View>
              {isRecurrent && (
                <RecurrenceSelector
                  theme={theme}
                  currentFrequency={recurrentFrequency}
                  onFrequencyChange={handleRecurrenceFrequencyChange}
                />
              )}
            </View>

            {/* Start Time */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Start Time</Text>
              <TimeSelector
                theme={theme}
                initialTime={startTime}
                onTimeChange={handleTimeChange}
              />
            </View>

            {/* Note */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Note</Text>
              <TextInput
                style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note..."
                placeholderTextColor={theme.subtext}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.mode === 'dark' ? '#555' : '#ccc' }]} onPress={onClose}>
              <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleSave}>
              <Text style={[styles.buttonText, { color: theme.buttonText || '#fff' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal for CustomTaskSelector */}
      {isTaskSelectorVisible && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={isTaskSelectorVisible}
            onRequestClose={() => setIsTaskSelectorVisible(false)}
          >
            <View style={styles.modalOverlay}>
                <View style={[styles.taskSelectorModalContent, { backgroundColor: theme.boxBackground }]}>
                    <CustomTaskSelector
                        ref={customTaskSelectorRef}
                        theme={theme}
                        onSelectionChange={handleCustomTaskSelectionChange}
                        // We need to pass initial values to CustomTaskSelector if we want it to pre-select
                        // This requires CustomTaskSelector to accept initialCategory, initialTaskKey, initialIntensityKey
                        // For now, it will reset on open, user reselects.
                    />
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.accent, marginTop: 20, width: '80%'}]}
                        onPress={() => setIsTaskSelectorVisible(false)}
                    >
                        <Text style={[styles.buttonText, {color: theme.buttonText || '#fff'}]}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
          </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: width * 0.95,
    maxHeight: height * 0.85,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    width: '100%',
    marginBottom: 10,
  },
  scrollContentContainer: {
    paddingBottom: 20, // Ensures space for the last element before buttons
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 44, // Ensure decent tap target height
  },
  selectorButton: {
    justifyContent: 'center',
  },
  selectorButtonText: {
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top', // For Android
  },
  recurrenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Styles for the Task Selector Modal
  taskSelectorModalContent: {
      width: width * 0.9,
      maxHeight: height * 0.7,
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
  },
});

export default EditTaskModal;
