import React from 'react';
import { 
  View, Text, Modal, StyleSheet, TouchableOpacity, 
  TextInput, ScrollView, TouchableWithoutFeedback 
} from 'react-native';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
  randomTask: string;
  randomTaskDuration: number;
  randomTaskCategory: string;
  customTask: string;
  customTaskDuration: string;
  customTaskCategory: string;
  customTaskTime: string;
  setCustomTask: (text: string) => void;
  setCustomTaskDuration: (duration: string) => void;
  setCustomTaskCategory: (category: string) => void;
  setCustomTaskTime: (time: string) => void;
  onAddRandomTask: () => void;
  onAddCustomTask: () => void;
}

const AddTaskModal = ({
  visible,
  onClose,
  theme,
  randomTask,
  randomTaskDuration,
  randomTaskCategory,
  customTask,
  customTaskDuration,
  customTaskCategory,
  customTaskTime,
  setCustomTask,
  setCustomTaskDuration,
  setCustomTaskCategory,
  setCustomTaskTime,
  onAddRandomTask,
  onAddCustomTask
}: AddTaskModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: theme.boxBackground }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add a New Task</Text>
              
              {/* Random Task Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Random Task</Text>
                <View style={[styles.randomTaskBox, { backgroundColor: theme.mode === 'dark' ? 'rgba(60, 60, 60, 0.5)' : '#f5f5f5' }]}>
                  <Text style={[styles.randomTaskText, { color: theme.text }]}>{randomTask}</Text>
                  <Text style={[styles.randomTaskDetails, { color: theme.subtext }]}>
                    Duration: {randomTaskDuration} min | Category: {randomTaskCategory}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[styles.addButton, styles.randomButton]} 
                  onPress={onAddRandomTask}
                >
                  <Text style={styles.addButtonText}>Use Random Task</Text>
                </TouchableOpacity>
              </View>
              
              {/* Custom Task Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Custom Task</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                  placeholder="Enter your task here"
                  placeholderTextColor={theme.placeholder}
                  value={customTask}
                  onChangeText={setCustomTask}
                />
                
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.smallInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                    placeholder="Duration (min)"
                    placeholderTextColor={theme.placeholder}
                    keyboardType="numeric"
                    value={customTaskDuration}
                    onChangeText={setCustomTaskDuration}
                  />
                  
                  <TextInput
                    style={[styles.smallInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                    placeholder="Category"
                    placeholderTextColor={theme.placeholder}
                    value={customTaskCategory}
                    onChangeText={setCustomTaskCategory}
                  />
                </View>
                
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                  placeholder="Time (optional, e.g., '3:30 PM')"
                  placeholderTextColor={theme.placeholder}
                  value={customTaskTime}
                  onChangeText={setCustomTaskTime}
                />
                
                <TouchableOpacity 
                  style={[styles.addButton, styles.customButton]} 
                  onPress={onAddCustomTask}
                >
                  <Text style={styles.addButtonText}>Add Custom Task</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    maxHeight: '80%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  randomTaskBox: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  randomTaskText: {
    fontSize: 16,
    marginBottom: 5,
  },
  randomTaskDetails: {
    fontSize: 12,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  smallInput: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
  },
  addButton: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  randomButton: {
    backgroundColor: 'rgba(255, 50, 50, 0.8)',
  },
  customButton: {
    backgroundColor: 'rgba(50, 150, 255, 0.8)',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    padding: 12,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'gray',
    fontSize: 14,
  },
});

export default AddTaskModal;