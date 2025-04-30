import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import TaskLibrary from '../../../assets/TaskLibrary.json'; // Adjust path if necessary
import { useTheme } from '../../context/ThemeContext'; // Or pass theme as prop

const { width } = Dimensions.get('window');

// Define types for TaskLibrary structure (copied from HomepageScreen)
type TaskDetails = {
  task: string;
  category: string;
  intensities: { [key: string]: { duration: string } };
};

type TaskLibraryType = {
  task_category: { [key: string]: string[] };
  [key: string]: TaskDetails | { [key: string]: string[] }; // Index signature for tasks
};

// --- Helper Type for FlatList Items ---
type TaskItem = { key: string; name: string };
type IntensityItem = { key: string; duration: string };
// --- End Helper Type ---

const TypedTaskLibrary = TaskLibrary as TaskLibraryType;

interface CustomTaskSelectorProps {
  theme: any; // Pass theme down
  onSelectionChange: (selection: { category: string | null; taskKey: string | null; intensityKey: string | null }) => void;
}

export interface CustomTaskSelectorRef {
  reset: () => void;
}

const CustomTaskSelector = forwardRef<CustomTaskSelectorRef, CustomTaskSelectorProps>(
  ({ theme, onSelectionChange }, ref) => {
    // --- State for Custom Task Selection ---
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTaskKey, setSelectedTaskKey] = useState<string | null>(null);
    const [selectedIntensityKey, setSelectedIntensityKey] = useState<string | null>(null);

    const [availableTasks, setAvailableTasks] = useState<TaskItem[]>([]); // Use helper type
    const [availableIntensities, setAvailableIntensities] = useState<IntensityItem[]>([]); // Use helper type

    // State to control which selection modal is open
    const [selectionModalType, setSelectionModalType] = useState<'none' | 'category' | 'task' | 'intensity'>('none');

    const taskCategories = Object.keys(TypedTaskLibrary.task_category || {});

    // --- Reset Logic ---
    const resetSelection = () => {
        setSelectedCategory(null);
        setSelectedTaskKey(null);
        setSelectedIntensityKey(null);
        setAvailableTasks([]);
        setAvailableIntensities([]);
        setSelectionModalType('none');
        onSelectionChange({ category: null, taskKey: null, intensityKey: null }); // Notify parent of reset
    };

    // Expose reset function via ref
    useImperativeHandle(ref, () => ({
        reset: resetSelection,
    }));

    // Notify parent on selection change
    useEffect(() => {
        onSelectionChange({
            category: selectedCategory,
            taskKey: selectedTaskKey,
            intensityKey: selectedIntensityKey
        });
    }, [selectedCategory, selectedTaskKey, selectedIntensityKey, onSelectionChange]);


    // --- Selection Handlers ---
    const handleSelectCategory = (category: string) => {
      setSelectedCategory(category);
      setSelectedTaskKey(null); // Reset task and intensity when category changes
      setSelectedIntensityKey(null);

      // Populate available tasks
      const taskKeys = TypedTaskLibrary.task_category?.[category] || [];
      const tasks = taskKeys
        .map(key => {
            const taskDetail = TypedTaskLibrary[key] as TaskDetails | undefined;
            return taskDetail ? { key: key, name: taskDetail.task } : null;
        })
        .filter((task): task is TaskItem => task !== null); // Use helper type
      setAvailableTasks(tasks);
      setAvailableIntensities([]); // Clear intensities

      setSelectionModalType('none'); // Close category selection modal
    };

    const handleSelectTask = (taskKey: string) => {
      setSelectedTaskKey(taskKey);
      setSelectedIntensityKey(null); // Reset intensity when task changes

      // Populate available intensities
      const taskDetail = TypedTaskLibrary[taskKey] as TaskDetails | undefined;
      const intensities = taskDetail?.intensities
        ? Object.entries(taskDetail.intensities).map(([key, value]) => ({ key, duration: value.duration }))
        : [];
      setAvailableIntensities(intensities);

      setSelectionModalType('none'); // Close task selection modal
    };

    const handleSelectIntensity = (intensityKey: string) => {
      setSelectedIntensityKey(intensityKey);
      setSelectionModalType('none'); // Close intensity selection modal
    };

    const openSelectionModal = (type: 'category' | 'task' | 'intensity') => setSelectionModalType(type);
    const closeSelectionModal = () => setSelectionModalType('none');

    // Helper to get task name safely
    const getTaskName = (key: string | null): string => {
        if (!key) return '...';
        const taskDetail = TypedTaskLibrary[key] as TaskDetails | undefined;
        return taskDetail?.task || '...';
    }

    // Helper to get intensity duration safely
    const getIntensityDuration = (taskKey: string | null, intensityKey: string | null): string => {
        if (!taskKey || !intensityKey) return '...';
        const taskDetail = TypedTaskLibrary[taskKey] as TaskDetails | undefined;
        return taskDetail?.intensities?.[intensityKey]?.duration || '...';
    }

    // --- Render Item Functions for FlatLists ---
    const renderCategoryItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={[styles.modalItemButton, { backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }]}
            onPress={() => handleSelectCategory(item)}
        >
            <Text style={[styles.modalItemButtonText, { color: theme.text }]}>{item}</Text>
        </TouchableOpacity>
    );

    const renderTaskItem = ({ item }: { item: TaskItem }) => (
        <TouchableOpacity
            key={item.key}
            style={[styles.modalItemButton, { backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }]}
            onPress={() => handleSelectTask(item.key)}
        >
            <Text style={[styles.modalItemButtonText, { color: theme.text }]}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderIntensityItem = ({ item }: { item: IntensityItem }) => (
         <TouchableOpacity
            key={item.key}
            style={[styles.modalItemButton, { backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }]}
            onPress={() => handleSelectIntensity(item.key)}
         >
            <Text style={[styles.modalItemButtonText, { color: theme.text }]}>{item.duration}</Text>
         </TouchableOpacity>
    );
    // --- End Render Item Functions ---


    return (
      <View style={styles.container}>
        {/* Category Button */}
        <TouchableOpacity
          style={[
            styles.selectionButton,
            { backgroundColor: theme.mode === 'dark' ? '#444' : '#f5f5f5', borderColor: theme.mode === 'dark' ? '#555' : '#ddd' }
          ]}
          onPress={() => openSelectionModal('category')}
        >
          <Text style={[styles.selectionButtonText, { color: selectedCategory ? theme.text : (theme.mode === 'dark' ? '#aaa' : '#888') }]}>
            {selectedCategory ? `Category: ${selectedCategory}` : 'Select Category'}
          </Text>
        </TouchableOpacity>

        {/* Task Button */}
        <TouchableOpacity
          style={[
            styles.selectionButton,
            { backgroundColor: theme.mode === 'dark' ? '#444' : '#f5f5f5', borderColor: theme.mode === 'dark' ? '#555' : '#ddd' },
            !selectedCategory && styles.disabledButton // Disable if category not selected
          ]}
          onPress={() => openSelectionModal('task')}
          disabled={!selectedCategory}
        >
          <Text style={[styles.selectionButtonText, { color: selectedTaskKey ? theme.text : (theme.mode === 'dark' ? '#aaa' : '#888') }]}>
            {selectedTaskKey ? `Task: ${getTaskName(selectedTaskKey)}` : 'Select Task'}
          </Text>
        </TouchableOpacity>

        {/* Intensity Button */}
        <TouchableOpacity
          style={[
            styles.selectionButton,
            { backgroundColor: theme.mode === 'dark' ? '#444' : '#f5f5f5', borderColor: theme.mode === 'dark' ? '#555' : '#ddd' },
            !selectedTaskKey && styles.disabledButton // Disable if task not selected
          ]}
          onPress={() => openSelectionModal('intensity')}
          disabled={!selectedTaskKey}
        >
          <Text style={[styles.selectionButtonText, { color: selectedIntensityKey ? theme.text : (theme.mode === 'dark' ? '#aaa' : '#888') }]}>
            {selectedIntensityKey ? `Intensity: ${getIntensityDuration(selectedTaskKey, selectedIntensityKey)}` : 'Select Intensity'}
          </Text>
        </TouchableOpacity>

        {/* --- Selection Modals --- */}
        {/* Category Selection Modal */}
        <Modal animationType="fade" transparent={true} visible={selectionModalType === 'category'} onRequestClose={closeSelectionModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.boxBackground }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Category</Text>
              {/* Use FlatList for Categories */}
              <FlatList
                  data={taskCategories}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item: string) => item} // Explicitly type item as string
                  style={styles.flatListContainer} // Added style for fixed height
                  contentContainerStyle={{ paddingBottom: 10 }} // Add padding if needed
              />
              <TouchableOpacity style={styles.cancelButton} onPress={closeSelectionModal}>
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Task Selection Modal */}
        <Modal animationType="fade" transparent={true} visible={selectionModalType === 'task'} onRequestClose={closeSelectionModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.boxBackground }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Task</Text>
              {/* Use FlatList for Tasks */}
              {availableTasks.length > 0 ? (
                <FlatList
                    data={availableTasks}
                    renderItem={renderTaskItem}
                    keyExtractor={(item: TaskItem) => item.key} // Explicitly type item as TaskItem
                    style={styles.flatListContainer} // Added style for fixed height
                    contentContainerStyle={{ paddingBottom: 10 }}
                />
              ) : (
                <Text style={[styles.noItemsText, { color: theme.text }]}>
                    No tasks available for this category.
                </Text>
              )}
              <TouchableOpacity style={styles.cancelButton} onPress={closeSelectionModal}>
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Intensity Selection Modal */}
        <Modal animationType="fade" transparent={true} visible={selectionModalType === 'intensity'} onRequestClose={closeSelectionModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.boxBackground }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Intensity</Text>
              {/* Use FlatList for Intensities */}
              {availableIntensities.length > 0 ? (
                <FlatList
                    data={availableIntensities}
                    renderItem={renderIntensityItem}
                    keyExtractor={(item: IntensityItem) => item.key} // Explicitly type item as IntensityItem
                    style={styles.flatListContainer} // Added style for fixed height
                    contentContainerStyle={{ paddingBottom: 10 }}
                />
              ) : (
                <Text style={[styles.noItemsText, { color: theme.text }]}>
                  No intensity options for this task.
                </Text>
              )}
              <TouchableOpacity style={styles.cancelButton} onPress={closeSelectionModal}>
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectionButton: {
    width: '100%',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'flex-start', // Align text to the left
  },
  selectionButtonText: {
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Modal Styles (copied and slightly adjusted from HomepageScreen)
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%', // Adjusted maxHeight for the overall modal box
    borderRadius: 15,
    paddingTop: 20, // Keep top padding
    paddingBottom: 10, // Reduce bottom padding before cancel button
    paddingHorizontal: 15, // Adjust horizontal padding if needed
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15, // Reduced margin
    textAlign: 'center'
  },
  // --- Style for the FlatList Container ---
  flatListContainer: {
    width: '100%', // Take full width within modal content padding
    maxHeight: 450, // Set a fixed max height for the scrollable area (adjust as needed)
    marginBottom: 15, // Add margin before the cancel button
  },
  // --- End FlatList Style ---
  modalItemButton: { // Renamed from categoryButton for clarity
    width: '100%',
    paddingVertical: 14, // Adjust padding if needed
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10, // Spacing between items
    alignItems: 'center'
  },
  modalItemButtonText: { // Renamed from categoryButtonText
    fontSize: 16,
    fontWeight: '500'
  },
  cancelButton: {
    marginTop: 5, // Reduced margin
    padding: 12
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500'
  },
  // Style for placeholder text when list is empty
  noItemsText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    fontStyle: 'italic',
  },
});

export default CustomTaskSelector;
