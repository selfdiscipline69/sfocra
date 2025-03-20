import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BarChart from './BarChart';

interface WeeklyHabitSectionProps {
  habitData: {
    day: string;
    completed: number;
    total: number;
  }[];
  theme: any;
}

const WeeklyHabitSection = ({ habitData, theme }: WeeklyHabitSectionProps) => {
  // Calculate total completed and total tasks
  const totalCompleted = habitData.reduce((sum, item) => sum + item.completed, 0);
  const totalTasks = habitData.reduce((sum, item) => sum + item.total, 0);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.boxBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>Weekly Habit Completion</Text>
      
      <BarChart data={habitData} />
      
      <Text style={[styles.summaryText, { color: theme.subtext }]}>
        {totalCompleted} of {totalTasks} tasks completed
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
  summaryText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'right',
    marginTop: 10,
  },
});

export default WeeklyHabitSection;
