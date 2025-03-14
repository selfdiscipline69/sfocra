import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryPie } from 'victory-native';
import { CategoryData } from '../types/DashboardTypes';
import { useTheme } from '../context/ThemeContext';

interface CategoryBreakdownChartProps {
  data: CategoryData[];
}

const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  // Transform data for Victory
  const pieData = data.map(item => ({
    x: item.category,
    y: item.minutes,
    color: item.color
  }));
  
  const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.boxBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>Time Spent by Category</Text>
      
      <View style={styles.chartContainer}>
        <VictoryPie
          width={screenWidth - 40}
          height={220}
          data={pieData}
          colorScale={data.map(item => item.color)}
          innerRadius={40}
          labelRadius={({ innerRadius }) => (innerRadius + 40) as number}
          style={{
            labels: {
              fill: theme.text,
              fontSize: 12,
              fontWeight: 'bold'
            }
          }}
          animate={{ duration: 1000 }}
        />
      </View>
      
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View 
              style={[styles.legendColor, { backgroundColor: item.color }]} 
            />
            <Text style={[styles.legendText, { color: theme.subtext }]}>
              {item.category}: {Math.round((item.minutes / totalMinutes) * 100)}%
            </Text>
          </View>
        ))}
      </View>
      
      <Text style={[styles.totalTime, { color: theme.subtext }]}>
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
  chartContainer: {
    alignItems: 'center',
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
  totalTime: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'right',
  },
});

export default CategoryBreakdownChart;
