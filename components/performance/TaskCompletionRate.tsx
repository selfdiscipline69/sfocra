import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import PieChart from './PieChart';
import { getCategoryColor } from '../../src/components/performance/CategoryColorUtils';

interface CompletedTaskData {
  category: string;
  count: number; // Changed from minutes
  timestamp: number;
}

interface CategoryData {
  category: string;
  count: number; // Changed from minutes
  color: string;
}

interface TaskCompletionRateProps {
  categoryData: CategoryData[];
  theme: any;
  onRefresh?: () => void;
}

const TaskCompletionRate = ({ categoryData, theme, onRefresh }: TaskCompletionRateProps) => {
  // Calculate total tasks
  const totalTasks = categoryData.reduce((sum, item) => sum + item.count, 0);
  
  // Changed to only check for zero tasks
  const emptyData = totalTasks <= 0;
  
  // Data to display in chart
  const displayData = emptyData 
    ? [{ category: 'No data', count: 100, color: '#E0E0E0' }] 
    : categoryData;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.boxBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>Task Completion Rate</Text>
      
      <View style={styles.pieChartContainer}>
        <PieChart 
          data={displayData}
          size={Dimensions.get('window').width * 0.6}
        />
      </View>
      
      <View style={styles.legendContainer}>
        {!emptyData ? (
          categoryData.map((item, index) => {
            const percentage = Math.round((item.count / totalTasks) * 100);
            
            return (
              <View key={index} style={styles.legendItem}>
                <View 
                  style={[styles.legendColor, { backgroundColor: item.color }]} 
                />
                <Text style={[styles.legendText, { color: theme.subtext }]}>
                  {item.category}: {percentage}% ({item.count} tasks)
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={[styles.noDataText, { color: theme.subtext }]}>
            Complete tasks to see your completion distribution
          </Text>
        )}
      </View>
      
      <Text style={[styles.totalTimeText, { color: theme.subtext }]}>
        Total: {totalTasks > 0 ? totalTasks : 0} completed tasks
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  legendContainer: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
  totalTimeText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 10,
  },
});

export default TaskCompletionRate;
