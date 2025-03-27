import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryPie } from 'victory-native';
import { CategoryData } from '../types/DashboardTypes';
import { useTheme } from '../context/ThemeContext';

interface CategoryBreakdownChartProps {
  data: CategoryData[];
}

// Add type for VictoryPie innerRadius param
interface LabelRadiusProps {
  innerRadius: number;
}

const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  // Map data to format expected by VictoryPie
  const chartData = data.map(item => ({
    x: item.category || item.x,
    y: item.minutes || item.y,
    fill: item.color
  }));
  
  // Calculate total minutes for percentage display
  const totalMinutes = data.reduce((sum, item) => sum + (item.minutes || item.y), 0);

  // Skip rendering if no data or all zeros
  if (data.length === 0 || totalMinutes === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.subtext }]}>
          No task data available
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.boxBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>Time Spent by Category</Text>
      
      <View style={styles.chartContainer}>
        <VictoryPie
          width={screenWidth - 40}
          height={220}
          data={chartData}
          colorScale={data.map(item => item.color || '#ccc')}
          innerRadius={40}
          labelRadius={({ innerRadius }: LabelRadiusProps) => (innerRadius + 40) as number}
          style={{
            labels: {
              fill: theme.text,
              fontSize: 12,
              fontWeight: 'bold'
            }
          }}
          animate={{ duration: 1000 }}
          labelComponent={<></>} // Hide labels on pie
        />
      </View>
      
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View 
              style={[styles.legendColor, { backgroundColor: item.color || '#ccc' }]} 
            />
            <Text style={[styles.legendText, { color: theme.subtext }]}>
              {item.category || item.x}: {Math.round(((item.minutes || item.y) / totalMinutes) * 100)}%
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
  }
});

export default CategoryBreakdownChart;
