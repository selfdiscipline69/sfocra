import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import * as storageService from '../../src/utils/StorageUtils';

interface ProgressSummaryProps {
  theme: any;
  userToken: string;
  refreshKey?: number; // Add refresh key to trigger updates
}

const CompletedTasks = ({ theme, userToken, refreshKey = 0 }: ProgressSummaryProps) => {
  const [loading, setLoading] = useState(true);
  const [completionRecords, setCompletionRecords] = useState<storageService.TaskCompletionRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  
  // Add refreshKey to dependencies to force a refresh
  useEffect(() => {
    console.log('Refreshing completion records, key:', refreshKey);
    const fetchCompletionRecords = async () => {
      if (!userToken) {
        setLoading(false);
        return;
      }
      
      try {
        const records = await storageService.getTaskCompletionRecords(userToken);
        // Sort by most recent first
        records.sort((a, b) => b.completed_at - a.completed_at);
        setCompletionRecords(records);
        console.log('Updated task completion with records:', records.length);
      } catch (error) {
        console.error('Error fetching task completion records:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompletionRecords();
  }, [userToken, refreshKey]); // Add refreshKey to dependencies
  
  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  // Get category color based on category name
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      work: '#3498db',
      health: '#2ecc71',
      learning: '#9b59b6',
      personal: '#e74c3c',
      fitness: '#1abc9c',
      social: '#f39c12',
      family: '#e67e22',
      default: theme.accent
    };
    
    return colors[category.toLowerCase()] || colors.default;
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
            {filteredRecords.map((record, index) => (
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
                  </View>
                )}
              </TouchableOpacity>
            ))}
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
