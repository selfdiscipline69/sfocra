import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import PieChart from './PieChart';

interface TimeSpentSectionProps {
  categoryData: {
    category: string;
    minutes: number;
    color: string;
  }[];
  theme: any;
}

const TimeSpentSection = ({ categoryData, theme }: TimeSpentSectionProps) => {
  const totalMinutes = categoryData.reduce((sum, item) => sum + item.minutes, 0);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.boxBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>Time Spent by Category</Text>
      
      <View style={styles.pieChartContainer}>
        <PieChart 
          data={categoryData} 
          size={Dimensions.get('window').width * 0.6}
        />
      </View>
      
      <View style={styles.legendContainer}>
        {categoryData.map((item, index) => {
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
        })}
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
});

export default TimeSpentSection;
