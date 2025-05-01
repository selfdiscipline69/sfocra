import AsyncStorage from '@react-native-async-storage/async-storage';
// Assuming TaskCompletionRecord is defined in types, adjust if necessary
import { TaskCompletionRecord } from '../utils/StorageUtils'; 

// Function to get all task completion records
export const getTaskCompletionRecords = async (
  userToken: string
): Promise<TaskCompletionRecord[]> => {
  if (!userToken) return []; // Return empty if no token
  try {
    const recordsJSON = await AsyncStorage.getItem(`@task_completion_records_${userToken}`);
    const records = recordsJSON ? JSON.parse(recordsJSON) : [];
    // Validate structure
    if (Array.isArray(records)) {
        return records.filter((r): r is TaskCompletionRecord =>
            r && typeof r === 'object' &&
            typeof r.id === 'number' &&
            typeof r.day === 'number' &&
            typeof r.task_name === 'string' &&
            typeof r.category === 'string' &&
            typeof r.duration === 'number' &&
            typeof r.is_daily === 'number' &&
            typeof r.completed_at === 'number' &&
            // original_task_id is optional string
            (typeof r.original_task_id === 'string' || typeof r.original_task_id === 'undefined')
        );
    }
    return [];
  } catch (error) {
    console.error('Error getting task completion records:', error);
    return [];
  }
};

// Function to save a task completion record
export const saveTaskCompletionRecord = async (
  userToken: string,
  record: Omit<TaskCompletionRecord, 'id'> // Omit ID as we'll generate it
): Promise<TaskCompletionRecord | null> => {
  if (!userToken) {
     console.error("Cannot save completion record: No user token.");
     return null;
  }
  if (record.day <= 0) {
      console.error("Cannot save completion record: Invalid day (accountAge).", record.day);
      return null;
  }

  try {
    // Get existing records
    const existingRecords = await getTaskCompletionRecords(userToken);

    // Generate new ID (increment from the last record or start at 1)
    const newId = existingRecords.length > 0
      ? Math.max(0, ...existingRecords.map(r => r.id || 0)) + 1 // Ensure IDs are numbers, default to 0 if missing
      : 1;

    // Create complete record with ID and potential original_task_id
    const completeRecord: TaskCompletionRecord = {
      id: newId,
      day: record.day,
      task_name: record.task_name,
      category: record.category,
      duration: record.duration,
      is_daily: record.is_daily,
      completed_at: record.completed_at,
      original_task_id: record.original_task_id, // Include the original ID
    };

    // Add to existing records
    const updatedRecords = [...existingRecords, completeRecord];

    // Save to AsyncStorage
    await AsyncStorage.setItem(
      `@task_completion_records_${userToken}`,
      JSON.stringify(updatedRecords)
    );

    return completeRecord;
  } catch (error) {
    console.error('Error saving task completion record:', error);
    return null;
  }
};

// Function to update a task's duration in completion records
export const updateTaskDuration = async (
  userToken: string,
  taskId: number, // Record ID
  newDuration: number
): Promise<boolean> => {
   if (!userToken || typeof taskId !== 'number' || typeof newDuration !== 'number' || newDuration < 0) return false;
  try {
    const records = await getTaskCompletionRecords(userToken);
    const taskIndex = records.findIndex(record => record.id === taskId);
    if (taskIndex === -1) { console.error(`Completion record ID ${taskId} not found`); return false; }

    records[taskIndex].duration = newDuration;

    await AsyncStorage.setItem(`@task_completion_records_${userToken}`, JSON.stringify(records));
    return true;
  } catch (error) {
    console.error('Error updating task duration:', error);
    return false;
  }
};

// Function to remove a task completion record
export const removeTaskCompletionRecord = async (
  userToken: string,
  taskId: number // Record ID
): Promise<TaskCompletionRecord | null> => {
  if (!userToken || typeof taskId !== 'number') return null;
  try {
    const records = await getTaskCompletionRecords(userToken);
    const taskIndex = records.findIndex(record => record.id === taskId);
    if (taskIndex === -1) { console.error(`Completion record ID ${taskId} not found`); return null; }

    const removedTask = records[taskIndex]; // Capture the full record
    const updatedRecords = [...records.slice(0, taskIndex), ...records.slice(taskIndex + 1)];

    await AsyncStorage.setItem(`@task_completion_records_${userToken}`, JSON.stringify(updatedRecords));
    console.log(`Removed task completion record ID: ${taskId}`);
    return removedTask; // Return the removed record
  } catch (error) {
    console.error('Error removing task completion record:', error);
    return null;
  }
}; 