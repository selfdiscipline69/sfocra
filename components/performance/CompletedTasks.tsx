import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Dimensions, Alert, DeviceEventEmitter } from 'react-native';
import * as storageService from '../../src/utils/StorageUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCategoryColor } from '../../src/components/performance/CategoryColorUtils';
import { AdditionalTask } from '../../src/types/UserTypes';

interface CompletedTasksProps {
  theme: any;
  userToken: string;
  refreshKey?: number; // Add refresh key to trigger updates
}

const CompletedTasks = ({ theme, userToken, refreshKey = 0 }: CompletedTasksProps) => {
  const [loading, setLoading] = useState(true);
  const [completionRecords, setCompletionRecords] = useState<storageService.TaskCompletionRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  
  // Add refreshKey to dependencies to force a refresh
  useEffect(() => {
    console.log('Refreshing completion records, key:', refreshKey);
    fetchCompletionRecords();
  }, [userToken, refreshKey]); // Add refreshKey to dependencies
  
  const fetchCompletionRecords = async () => {
    if (!userToken) {
      setLoading(false);
      return;
    }
    
    setLoading(true); // Set loading true when fetching
    try {
      const records = await storageService.getTaskCompletionRecords(userToken);
      // Sort by most recent first
      records.sort((a, b) => b.completed_at - a.completed_at);
      setCompletionRecords(records);
      console.log('Updated task completion with records:', records.length);
    } catch (error) {
      console.error('Error fetching task completion records:', error);
      // Keep existing records on error? Or clear them? Let's keep them for now.
      // setCompletionRecords([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format seconds to minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Capitalize first letter of a string
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  // Truncate text to maintain alignment
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  // Get all unique categories
  const getUniqueCategories = () => {
    const categories = completionRecords.map(record => record.category);
    return ['all', ...new Set(categories)];
  };

  // Filter records by category
  const getFilteredRecords = () => {
    if (activeFilter === 'all') return completionRecords;
    return completionRecords.filter(record => record.category === activeFilter);
  };

  // Toggle expanded task view
  const toggleTaskExpansion = (taskId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
    }
  };
  
  // Handle long press to undo task completion - REFACTORED LOGIC
  const handleUndoTaskCompletion = async (recordIdString: string) => {
    const recordId = parseInt(recordIdString, 10);
    if (isNaN(recordId) || !userToken) {
        Alert.alert("Error", "Invalid task record or user.");
        return;
    }

    // Find the record locally first to avoid extra fetches if possible
    const recordToUndo = completionRecords.find(record => record.id === recordId);
    if (!recordToUndo) {
        Alert.alert("Error", "Task record not found locally.");
        // Optionally re-fetch records here if state might be stale
        // await fetchCompletionRecords();
        return;
    }

    Alert.alert(
      "Undo Task Completion",
      `Return "${recordToUndo.task_name}" to your active tasks?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Undo",
          style: "destructive", // Make it red to indicate action
          onPress: async () => {
            setLoading(true); // Indicate processing
            try {
              // 1. Remove the record from storage, getting the removed record details
              const removedRecord = await storageService.removeTaskCompletionRecord(userToken, recordId);

              if (!removedRecord) {
                throw new Error("Failed to remove the task completion record from storage.");
              }

              // 2. Update local state immediately
              setCompletionRecords(prev => prev.filter(record => record.id !== recordId));

              let successMessage = "";
              let taskRestored = false;

              // 3. Check if it was a daily or additional task
              if (removedRecord.is_daily === 0) {
                // --- Restore Additional Task ---
                const currentTasks = await storageService.getAdditionalTasks(userToken);
                const taskText = removedRecord.duration > 0
                  ? `${removedRecord.task_name} (${removedRecord.duration} min)`
                  : removedRecord.task_name;
                const standardCategory = storageService.normalizeCategory(removedRecord.category);

                const restoredTask: AdditionalTask = {
                  // Use original ID if available, otherwise generate a new one
                  id: removedRecord.original_task_id || `restored-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  text: taskText,
                  completed: false,
                  category: standardCategory === 'general' ? undefined : standardCategory as any, // Match AdditionalTask type
                  color: getCategoryColor(standardCategory), // Get color based on category
                  showImage: false, // Default values
                  image: null,      // Default values
                };

                // Avoid adding duplicates if the task somehow already exists (e.g., multiple rapid clicks)
                if (!currentTasks.some(task => task.id === restoredTask.id)) {
                    const updatedTasks = [...currentTasks, restoredTask];
                    await storageService.saveAdditionalTasks(userToken, updatedTasks);
                    successMessage = `Task "${removedRecord.task_name}" restored to Additional Tasks.`;
                    taskRestored = true;
                } else {
                     successMessage = `Task "${removedRecord.task_name}" was already present in Additional Tasks.`;
                }

              } else {
                // --- Restore Daily Task (only if it's from today) ---
                const currentAccountAge = await storageService.getAccountAge(userToken);

                if (removedRecord.day === currentAccountAge) {
                  const dailyState = await storageService.getDailyTasksState(userToken);
                  if (dailyState && dailyState.tasks) {
                    let taskFoundAndUpdated = false;
                    const updatedTasks = dailyState.tasks.map(task => {
                      // Try matching by original_task_id first, then by details as fallback
                      if (task.id && removedRecord.original_task_id && task.id === removedRecord.original_task_id && (task.status === 'completed' || task.status === 'canceled')) {
                        taskFoundAndUpdated = true;
                        return { ...task, status: 'default' as const };
                      }
                      // Fallback: Match by name, category, duration (less reliable)
                       const recordTaskText = removedRecord.duration > 0
                          ? `${removedRecord.task_name} (${removedRecord.duration} min)`
                          : removedRecord.task_name;
                      if (!removedRecord.original_task_id && task.text === recordTaskText && (task.status === 'completed' || task.status === 'canceled')) {
                         // Basic check if category also matches
                         const taskCat = storageService.normalizeCategory(task.category || 'general');
                         const recordCat = storageService.normalizeCategory(removedRecord.category);
                         if(taskCat === recordCat) {
                            console.warn(`Restoring daily task ${task.id || task.text} by text/category match (no original ID)`);
                            taskFoundAndUpdated = true;
                            return { ...task, status: 'default' as const };
                         }
                      }
                      return task;
                    });

                    if (taskFoundAndUpdated) {
                      await storageService.saveDailyTasksState(userToken, { ...dailyState, tasks: updatedTasks });
                      successMessage = `Task "${removedRecord.task_name}" restored to Today's Daily Tasks.`;
                      taskRestored = true;
                    } else {
                      // Task wasn't found in today's list (maybe already removed or ID mismatch?)
                      successMessage = `Task "${removedRecord.task_name}" could not be found in today's active tasks to restore.`;
                       console.warn("Could not find matching daily task to restore status for:", removedRecord);
                    }
                  } else {
                     successMessage = "Could not load today's task list to restore the task.";
                  }
                } else {
                  // Task is from a previous day
                  successMessage = `Task "${removedRecord.task_name}" is from a previous day and was not restored to active tasks.`;
                  taskRestored = false; // Not restored to active list
                }
              }

              // 4. Emit event for HomepageScreen to refresh if a task was actually restored to active
              if (taskRestored) {
                DeviceEventEmitter.emit('taskStateUpdated');
                 console.log("Emitted taskStateUpdated event");
              }

              // 5. Show success/info message
              // Use setTimeout to ensure state updates visually before alert
               setTimeout(() => {
                   Alert.alert("Undo Complete", successMessage);
               }, 100);

            } catch (error) {
              console.error('Error undoing task completion:', error);
              Alert.alert("Error", `Failed to undo task completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
              // Optionally attempt to refetch records if an error occurred during processing
              fetchCompletionRecords();
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const filteredRecords = getFilteredRecords();
  const uniqueCategories = getUniqueCategories();

  return (
    <View style={[styles.container, { backgroundColor: theme.mode === 'dark' ? '#1f1f1f' : '#f8f8f8', borderRadius: 12 }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: theme.text }]}>Completed Tasks</Text>
        <Text style={[styles.taskCount, { color: theme.accent }]}>
          {filteredRecords.length} {filteredRecords.length === 1 ? 'task' : 'tasks'} completed
        </Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={styles.loader} />
      ) : completionRecords.length > 0 ? (
        <>
          {/* Category Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filterContainer}
            contentContainerStyle={{ paddingVertical: 10 }}
          >
            {uniqueCategories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  { 
                    backgroundColor: activeFilter === category 
                      ? (category === 'all' ? theme.accent : getCategoryColor(category)) 
                      : theme.mode === 'dark' ? '#333' : '#e0e0e0',
                    opacity: activeFilter === category ? 1 : 0.7
                  }
                ]}
                onPress={() => setActiveFilter(category)}
              >
                <Text 
                  style={[
                    styles.filterText, 
                    { 
                      color: activeFilter === category 
                        ? 'white' 
                        : theme.text 
                    }
                  ]}
                >
                  {category === 'all' ? 'All' : capitalize(category)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Task List */}
          <ScrollView style={styles.taskListContainer}>
            {filteredRecords.map((record, index) => {
              return (
                <TouchableOpacity
                  key={record.id.toString()}
                  style={[
                    styles.taskCard,
                    { 
                      backgroundColor: theme.mode === 'dark' ? 'rgba(40, 40, 40, 0.7)' : 'rgba(250, 250, 250, 0.7)',
                      borderLeftWidth: 4,
                      borderLeftColor: getCategoryColor(record.category),
                      marginBottom: index === filteredRecords.length - 1 ? 0 : 12
                    }
                  ]}
                  onPress={() => toggleTaskExpansion(record.id.toString())}
                  onLongPress={() => handleUndoTaskCompletion(record.id.toString())}
                  delayLongPress={500}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskHeader}>
                    <View style={styles.taskTitleContainer}>
                      <Text style={[styles.taskTitle, { color: theme.text }]}>
                        {record.task_name}
                      </Text>
                      <View style={styles.taskMeta}>
                        <Text style={[styles.taskMetaText, { color: theme.subtext }]}>
                          Day {record.day} • {record.duration} min
                        </Text>
                        <View style={[styles.taskType, { backgroundColor: record.is_daily ? theme.accent : 'transparent' }]}>
                          <Text style={[styles.taskTypeText, { color: record.is_daily ? 'white' : theme.subtext }]}>
                            {record.is_daily ? 'Daily' : 'Custom'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(record.category) + '22' }]}>
                      <Text style={[styles.categoryText, { color: getCategoryColor(record.category) }]}>
                        {capitalize(record.category)}
                      </Text>
                    </View>
                  </View>
                  
                  {expandedTaskId === record.id.toString() && (
                    <View style={styles.taskExpanded}>
                      <View style={styles.divider} />
                      <View style={styles.expandedDetails}>
                        <Text style={[styles.expandedLabel, { color: theme.subtext }]}>Completed at:</Text>
                        <Text style={[styles.expandedValue, { color: theme.text }]}>{formatDate(record.completed_at)}</Text>
                      </View>
                      <View style={styles.expandedDetails}>
                        <Text style={[styles.expandedLabel, { color: theme.subtext }]}>
                          Long press to move this task back to active tasks
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      ) : (
        <View style={[styles.emptyContainer, { borderColor: theme.mode === 'dark' ? '#444' : '#ddd' }]}>
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            No completed tasks yet. Complete a task to see your achievements here.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 30,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  taskCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  taskListContainer: {
    maxHeight: 500,
  },
  taskCard: {
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskMetaText: {
    fontSize: 13,
    marginRight: 8,
  },
  taskType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taskTypeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskExpanded: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginBottom: 12,
  },
  expandedDetails: {
    marginBottom: 8,
  },
  expandedLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  expandedValue: {
    fontSize: 14,
  },
  loader: {
    marginTop: 20,
    marginBottom: 20,
  },
  emptyContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CompletedTasks; 