import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import * as storageService from '../../src/utils/StorageUtils';

interface ProgressSummaryProps {
  theme: any;
  userToken: string;
  refreshKey?: number; // Add refresh key to trigger updates
}

const ProgressSummary = ({ theme, userToken, refreshKey = 0 }: ProgressSummaryProps) => {
  const [loading, setLoading] = useState(true);
  const [completionRecords, setCompletionRecords] = useState<storageService.TaskCompletionRecord[]>([]);
  
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
        console.log('Updated progress summary with records:', records.length);
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
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Your Progress</Text>
      <Text style={[styles.text, { color: theme.subtext }]}>
        You're making great strides in your journey! Keep up the good work to reach your next level.
      </Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={styles.loader} />
      ) : completionRecords.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableContainer}>
          <View>
            {/* Table Header */}
            <View style={styles.tableRow}>
              <Text style={[styles.headerCell, styles.dayCell, { color: theme.text, backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }]}>Day</Text>
              <Text style={[styles.headerCell, styles.taskCell, { color: theme.text, backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }]}>Task</Text>
              <Text style={[styles.headerCell, styles.categoryCell, { color: theme.text, backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }]}>Category</Text>
              <Text style={[styles.headerCell, styles.durationCell, { color: theme.text, backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }]}>Duration</Text>
              <Text style={[styles.headerCell, styles.typeCell, { color: theme.text, backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }]}>Type</Text>
              <Text style={[styles.headerCell, styles.dateCell, { color: theme.text, backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' }]}>Completed</Text>
            </View>
            
            {/* Table Rows */}
            {completionRecords.map((record, index) => (
              <View 
                key={record.id} 
                style={[
                  styles.tableRow, 
                  { backgroundColor: index % 2 === 0 ? 
                    (theme.mode === 'dark' ? '#222' : '#f9f9f9') : 
                    (theme.mode === 'dark' ? '#333' : '#ffffff') 
                  }
                ]}
              >
                <Text style={[styles.cell, styles.dayCell, { color: theme.text }]}>{record.day}</Text>
                <Text style={[styles.cell, styles.taskCell, { color: theme.text }]}>{truncateText(record.task_name, 15)}</Text>
                <Text style={[styles.cell, styles.categoryCell, { color: theme.text }]}>{capitalize(record.category)}</Text>
                <Text style={[styles.cell, styles.durationCell, { color: theme.text }]}>{record.duration} min</Text>
                <Text style={[styles.cell, styles.typeCell, { color: theme.text }]}>{record.is_daily ? 'Daily' : 'Custom'}</Text>
                <Text style={[styles.cell, styles.dateCell, { color: theme.text }]}>{formatDate(record.completed_at)}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            Every greatness starts somewhere unnoticed, make the difference and act now. Complete one task to see your progress.
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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  tableContainer: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    padding: 10,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  dayCell: {
    width: 40,
  },
  taskCell: {
    width: 120,
  },
  categoryCell: {
    width: 90,
  },
  durationCell: {
    width: 70,
  },
  typeCell: {
    width: 60,
  },
  dateCell: {
    width: 100,
  },
  cell: {
    padding: 10,
    fontSize: 12,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProgressSummary;
