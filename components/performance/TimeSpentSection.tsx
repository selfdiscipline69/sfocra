import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import PieChart from './PieChart';
import * as storageService from '../../src/utils/StorageUtils';

interface CompletedTaskData {
  category: string;
  minutes: number;
  timestamp: number;
}

interface CategoryData {
  category: string;
  minutes: number;
  color: string;
}

interface TimeSpentSectionProps {
  categoryData: CategoryData[];
  theme: any;
  onRefresh?: () => void;
}

const TimeSpentSection = ({ categoryData, theme, onRefresh }: TimeSpentSectionProps) => {
  // Fallback to provided data if no completed tasks
  const totalMinutes = categoryData.reduce((sum, item) => sum + item.minutes, 0);
  
  // Category color mapping
  const getCategoryColor = (category: string): string => {
    switch(category.toLowerCase()) {
      case 'fitness': return '#FF5252';
      case 'learning': return '#4CAF50';
      case 'knowledge': return '#4CAF50'; // Map to same as learning
      case 'mindfulness': return '#2196F3';
      case 'social': return '#FFC107';
      case 'creativity': return '#9C27B0';
      default: return '#607D8B'; // Default gray
    }
  };
  
  // If there's no data, show a placeholder chart
  const emptyOrHasData = totalMinutes > 0;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.boxBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>Time Spent by Category</Text>
      
      <View style={styles.pieChartContainer}>
        <PieChart 
          data={emptyOrHasData ? categoryData : [{ category: 'No data', minutes: 100, color: '#E0E0E0' }]}
          size={Dimensions.get('window').width * 0.6}
        />
      </View>
      
      <View style={styles.legendContainer}>
        {emptyOrHasData ? (
          categoryData.map((item, index) => {
            const percentage = Math.round((item.minutes / totalMinutes) * 100);
            
            return (
              <View key={index} style={styles.legendItem}>
                <View 
                  style={[styles.legendColor, { backgroundColor: item.color }]} 
                />
                <Text style={[styles.legendText, { color: theme.subtext }]}>
                  {item.category}: {percentage}% ({item.minutes} min)
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={[styles.noDataText, { color: theme.subtext }]}>
            Complete tasks to see your time distribution
          </Text>
        )}
      </View>
      
      <Text style={[styles.totalTimeText, { color: theme.subtext }]}>
        Total: {totalMinutes} minutes
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

export default TimeSpentSection;
