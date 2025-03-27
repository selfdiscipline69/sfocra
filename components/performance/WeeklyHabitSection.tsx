import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BarChart from './BarChart';
import * as storageService from '../../src/utils/StorageUtils';

interface WeeklyHabitSectionProps {
  theme: any;
  userToken: string;
  refreshKey?: number; // Add a refresh key to trigger useEffect
}

const WeeklyHabitSection = ({ theme, userToken, refreshKey = 0 }: WeeklyHabitSectionProps) => {
  const [habitData, setHabitData] = useState<{
    day: string;
    completed: number;
    total: number;
  }[]>(
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
      day,
      completed: 0,
      total: 2
    }))
  );
  
  const [totalCompleted_daily, setTotalCompletedDaily] = useState<number>(0);
  
  // Add refreshKey to dependencies to force a refresh
  useEffect(() => {
    console.log('Refreshing habit data, key:', refreshKey);
    const fetchCompletionData = async () => {
      if (!userToken) return;
      
      try {
        // Get task completion records
        const records = await storageService.getTaskCompletionRecords(userToken);
        
        // Filter for daily tasks only (is_daily = 1)
        const dailyTasks = records.filter(record => record.is_daily === 1);
        
        // Get current date and calculate date for 7 days ago
        const currentDate = new Date();
        const last7Days = new Date(currentDate);
        last7Days.setDate(last7Days.getDate() - 6); // 7 days including today
        
        // Map of day names
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Initialize daily counts
        const dailyCounts: Record<string, number> = {};
        dayNames.forEach(day => {
          dailyCounts[day] = 0;
        });
        
        // Count daily task completions for the last 7 days
        dailyTasks.forEach(task => {
          const taskDate = new Date(task.completed_at);
          
          // Only count tasks from the last 7 days
          if (taskDate >= last7Days && taskDate <= currentDate) {
            const dayName = dayNames[taskDate.getDay()];
            
            // Group by day
            if (!dailyCounts[dayName]) {
              dailyCounts[dayName] = 0;
            }
            
            dailyCounts[dayName]++;
          }
        });
        
        // Create habitData format expected by BarChart
        const formattedData = dayNames.map(day => ({
          day,
          completed: dailyCounts[day] || 0,
          total: 2 // Always 2 daily tasks per day
        }));
        
        // Console log for debugging
        console.log('Daily task counts by day:', dailyCounts);
        
        // Add safety check before reducing
        if (dailyCounts && typeof dailyCounts === 'object') {
          const totalCompleted = Object.values(dailyCounts).reduce(
            (sum, count) => sum + count, 0
          );
          setTotalCompletedDaily(totalCompleted);
          console.log('Total completed daily tasks:', totalCompleted);
        } else {
          // Set to 0 if dailyCounts is invalid
          setTotalCompletedDaily(0);
        }
        
        setHabitData(formattedData);
      } catch (error) {
        console.error('Error fetching task completion data:', error);
        // Make sure to set default values on error
        setHabitData(
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
            day,
            completed: 0,
            total: 2
          }))
        );
        setTotalCompletedDaily(0);
      }
    };
    
    fetchCompletionData();
  }, [userToken, refreshKey]); // Add refreshKey to dependencies
  
  // Get current day of week (0-6, where 0 is Sunday)
  const currentDayIndex = new Date().getDay();
  // Map to our data format
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayName = dayNames[currentDayIndex];
  
  // Calculate total tasks - always 14 total tasks (2 per day, 7 days)
  const totalTasks = 14; // Fixed at 14 tasks (2 tasks per day × 7 days)
  
  // Mark current day in the data
  const dataWithCurrentDay = habitData.map(item => ({
    ...item,
    isCurrentDay: item.day === currentDayName
  }));
  
  return (
    <View style={[styles.container, { backgroundColor: theme.boxBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>Weekly Habit Completion</Text>
      <Text style={[styles.description, { color: theme.subtext }]}>
        Tracking your daily task completion streak
      </Text>
      
      <BarChart data={dataWithCurrentDay} />
      
      <Text style={[styles.summaryText, { color: theme.subtext }]}>
        {totalCompleted_daily} of {totalTasks} tasks completed this week
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
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  summaryText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'right',
    marginTop: 10,
  },
});

export default WeeklyHabitSection;
