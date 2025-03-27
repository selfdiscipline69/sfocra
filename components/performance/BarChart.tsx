import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { getCompletionColor } from '../../src/components/performance/CategoryColorUtils';

interface BarChartProps {
  data: { 
    day: string; 
    completed: number; 
    total: number;
    isCurrentDay?: boolean;
  }[];
}

const BarChart = ({ data }: BarChartProps) => {
  const { theme } = useTheme();
  const maxValue = Math.max(...data.map(item => item.total), 2); // only consider 2 daily tasks
  
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
          
          // Determine if this is the current day
          const isCurrentDay = item.isCurrentDay === true;
          
          // Special color logic for current day
          let barColor;
          if (isCurrentDay) {
            // Red if 0 tasks completed
            if (item.completed === 0) {
              barColor = '#FF4444';  // Bright red
            } 
            // Bright green if 1-2 tasks completed
            else {
              barColor = '#44DD44';  // Bright green
            }
          } else {
            // Use regular completion color for other days
            barColor = getCompletionColor(item.completed, item.total);
          }
          
          // Apply different opacity for current day vs other days
          const opacity = isCurrentDay ? 1 : theme.mode === 'dark' ? 0.5 : 0.7;
          
          return (
            <View key={index} style={styles.barGroup}>
              <View style={styles.barWrapper}>
                {/* Background bar showing total */}
                <View style={[styles.barBackground, { 
                  backgroundColor: theme.mode === 'dark' ? '#444' : '#e0e0e0', 
                  height: `${(item.total / maxValue) * 100}%`,
                  opacity: opacity
                }]} />
                
                {/* Foreground bar showing completed */}
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: `${heightPercentage}%`, 
                      backgroundColor: barColor,
                      opacity: opacity,
                      // Highlight the current day with a border if any tasks were completed
                      borderWidth: isCurrentDay && item.completed > 0 ? 2 : 0,
                      borderColor: isCurrentDay && item.completed > 0 ? '#FFFFFF' : 'transparent'
                    }
                  ]}
                />
                
              </View>
              <Text style={[
                styles.barLabel, 
                { 
                  color: isCurrentDay ? theme.text : theme.subtext,
                  fontWeight: isCurrentDay ? 'bold' : 'normal'
                }
              ]}>{item.day}</Text>
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
  completionLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#FFFFFF', // White line
    zIndex: 10, // Ensure it's above the bar
  },
});

export default BarChart;
