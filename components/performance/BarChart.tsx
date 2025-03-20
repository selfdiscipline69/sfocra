import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';

interface BarChartProps {
  data: { 
    day: string; 
    completed: number; 
    total: number 
  }[];
}

const BarChart = ({ data }: BarChartProps) => {
  const { theme } = useTheme();
  const maxValue = Math.max(...data.map(item => item.total), 5); // Use at least 5 as max for scale
  
  // Get bar color based on completion percentage
  const getBarColor = (completed: number, total: number) => {
    const percentage = (completed / total) * 100;
    if (percentage >= 80) return '#4CAF50'; // Green for 80%+
    if (percentage >= 50) return '#FFC107'; // Yellow for 50-80%
    return '#FF5252'; // Red for under 50%
  };
  
  return (
    <View style={styles.barChartContainer}>
      {/* Y-axis labels */}
      <View style={styles.yAxisContainer}>
        <Text style={[styles.axisLabel, { color: theme.subtext }]}>{maxValue}</Text>
        <Text style={[styles.axisLabel, { color: theme.subtext }]}>{Math.round(maxValue/2)}</Text>
        <Text style={[styles.axisLabel, { color: theme.subtext }]}>0</Text>
      </View>
      
      {/* Bars and X-axis */}
      <View style={styles.barsContainer}>
        {data.map((item, index) => {
          // Calculate height percentage based on value and max
          const heightPercentage = (item.completed / maxValue) * 100;
          const barColor = getBarColor(item.completed, item.total);
          
          return (
            <View key={index} style={styles.barGroup}>
              <View style={styles.barWrapper}>
                {/* Background bar showing total */}
                <View style={[styles.barBackground, { 
                  backgroundColor: theme.mode === 'dark' ? '#444' : '#e0e0e0', 
                  height: `${(item.total / maxValue) * 100}%` 
                }]} />
                
                {/* Foreground bar showing completed */}
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: `${heightPercentage}%`, 
                      backgroundColor: barColor 
                    }
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: theme.subtext }]}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  barChartContainer: {
    flexDirection: 'row',
    height: 180,
    marginTop: 15,
    marginBottom: 5,
    paddingBottom: 20, // Space for x-axis labels
  },
  yAxisContainer: {
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 5,
    marginBottom: 20, // Align with the bottom of bars
  },
  axisLabel: {
    fontSize: 12,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 5,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: 20,
    height: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  barBackground: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  bar: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 5,
  },
});

export default BarChart;
