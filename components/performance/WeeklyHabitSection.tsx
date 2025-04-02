import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BarChart from './BarChart';
import * as storageService from '../../src/utils/StorageUtils';

interface WeeklyHabitSectionProps {
  theme: any;
  userToken: string;
  refreshKey?: number;
}

const WeeklyHabitSection = ({ theme, userToken, refreshKey = 0 }: WeeklyHabitSectionProps) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [habitData, setHabitData] = useState<{
    day: string;
    completed: number;
    total: number;
    isCurrentDay: boolean; // Keep track of the current day
  }[]>(
    dayNames.map(day => ({
      day,
      completed: 0,
      total: 2, // Daily tasks target
      isCurrentDay: false,
    }))
  );

  const [totalCompleted_daily, setTotalCompletedDaily] = useState<number>(0);

  useEffect(() => {
    console.log('WeeklyHabitSection: Refreshing habit data, key:', refreshKey);
    const fetchCompletionData = async () => {
      if (!userToken) return;

      try {
        const records = await storageService.getTaskCompletionRecords(userToken);
        const dailyTasks = records.filter(record => record.is_daily === 1);

        const today = new Date();
        const todayDayIndex = today.getDay(); // 0 = Sun, 1 = Mon, ...

        // Calculate the start of the 7-day window (Sunday of the current week)
        // Adjust logic to go back to the most recent Sunday
        const startOfWindow = new Date(today);
        startOfWindow.setDate(today.getDate() - todayDayIndex); // Go back to Sunday
        startOfWindow.setHours(0, 0, 0, 0); // Start of that Sunday

        // End of window is end of today
        const endOfWindow = new Date(today);
        endOfWindow.setHours(23, 59, 59, 999);

        console.log(`WeeklyHabitSection: Fetching data from ${startOfWindow.toISOString()} to ${endOfWindow.toISOString()}`);

        // Initialize daily counts for the 7 days of the week
        const weeklyCounts: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        let totalCompletedInWindow = 0;

        dailyTasks.forEach(task => {
          const taskDate = new Date(task.completed_at);

          // Check if the task was completed within the current week's window
          if (taskDate >= startOfWindow && taskDate <= endOfWindow) {
            const dayIndex = taskDate.getDay(); // 0 = Sun, 1 = Mon, ...
            weeklyCounts[dayIndex]++;
            totalCompletedInWindow++;
          }
        });

        console.log('WeeklyHabitSection: Daily task counts this week:', weeklyCounts);

        // Create habitData format expected by BarChart
        const formattedData = dayNames.map((day, index) => ({
          day,
          completed: weeklyCounts[index] || 0,
          total: 2, // Daily task goal
          isCurrentDay: index === todayDayIndex, // Mark the current day
        }));

        setHabitData(formattedData);
        setTotalCompletedDaily(totalCompletedInWindow);
        console.log('WeeklyHabitSection: Total completed daily tasks this week:', totalCompletedInWindow);

      } catch (error) {
        console.error('WeeklyHabitSection: Error fetching task completion data:', error);
        // Reset on error
        setHabitData(
          dayNames.map((day, index) => ({
            day,
            completed: 0,
            total: 2,
            isCurrentDay: index === new Date().getDay(),
          }))
        );
        setTotalCompletedDaily(0);
      }
    };

    fetchCompletionData();
  }, [userToken, refreshKey]); // Depend on refreshKey

  // Calculate total possible tasks this week (up to today)
  // const totalPossibleTasks = (new Date().getDay() + 1) * 2; // 2 tasks per day up to today
  const totalTasksForWeek = 14; // Fixed total for the week bar chart comparison

  return (
    <View style={[styles.container, { backgroundColor: theme.boxBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>Weekly Habit Completion</Text>
      <Text style={[styles.description, { color: theme.subtext }]}>
        Your daily task completions for the current week
      </Text>

      {/* BarChart now receives correctly calculated data per day */}
      <BarChart data={habitData} />

      <Text style={[styles.summaryText, { color: theme.subtext }]}>
        {totalCompleted_daily} of {totalTasksForWeek} daily tasks completed this week
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
