import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BarChart from './BarChart';
import * as storageService from '../../src/utils/StorageUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WeeklyHabitSectionProps {
  theme: any;
  userToken: string;
  refreshKey?: number;
}

// Helper function to calculate account day for a given date
const calculateAccountDay = (targetDate: Date, creationTimestamp: number): number => {
  const startOfTargetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
  const creationDate = new Date(creationTimestamp);
  const startOfCreationDay = new Date(creationDate.getFullYear(), creationDate.getMonth(), creationDate.getDate()).getTime();

  // Dates before account creation don't correspond to an account day
  if (startOfTargetDay < startOfCreationDay) {
    return 0;
  }

  const diffTime = startOfTargetDay - startOfCreationDay;
  // Day 1 is the first day
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays); // Ensure minimum day is 1
};

const WeeklyHabitSection = ({ theme, userToken, refreshKey = 0 }: WeeklyHabitSectionProps) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [habitData, setHabitData] = useState<{
    day: string;
    completed: number;
    total: number;
    isCurrentDay: boolean;
  }[]>(
    // Initial empty state
    dayNames.map((day, index) => ({
      day,
      completed: 0,
      total: 2,
      isCurrentDay: index === new Date().getDay(),
    }))
  );

  const [totalCompletedThisWeek, setTotalCompletedThisWeek] = useState<number>(0);

  useEffect(() => {
    console.log('WeeklyHabitSection: Refreshing habit data, key:', refreshKey);
    const fetchCompletionData = async () => {
      if (!userToken) {
          // Reset if no token
          setHabitData(dayNames.map((day, index) => ({ day, completed: 0, total: 2, isCurrentDay: index === new Date().getDay() })));
          setTotalCompletedThisWeek(0);
          return;
      }

      try {
        // 1. Fetch necessary data
        const creationDateKey = `@account_creation_date_${userToken}`;
        const creationDateStr = await AsyncStorage.getItem(creationDateKey);
        if (!creationDateStr) {
          console.error("WeeklyHabitSection: Account creation date not found.");
           // Attempt to get age to potentially create the date
           await storageService.getAccountAge(userToken);
           // Re-try fetching after potential creation
           const retryCreationDateStr = await AsyncStorage.getItem(creationDateKey);
           if (!retryCreationDateStr) {
             console.error("WeeklyHabitSection: Still couldn't get creation date.");
             // Handle error state - show empty chart?
              setHabitData(dayNames.map((day, index) => ({ day, completed: 0, total: 2, isCurrentDay: index === new Date().getDay() })));
              setTotalCompletedThisWeek(0);
              return;
           }
           // Use the newly fetched/created date if retry worked (logic continues below)
           creationDateStr = retryCreationDateStr;
        }
        const creationTimestamp = parseInt(creationDateStr, 10);


        const allRecords = await storageService.getTaskCompletionRecords(userToken);
        const dailyRecords = allRecords.filter(record => record.is_daily === 1);

        // 2. Prepare data structure for the last 7 days
        const today = new Date();
        const todayDayIndex = today.getDay(); // 0 = Sun, 1 = Mon, ...
        const weeklyCompletionCounts: { [dayOfWeekIndex: number]: number } = {};
        const processedDates: { dayOfWeekIndex: number; date: Date; accountDay: number }[] = [];

        // 3. Iterate through the last 7 calendar days
        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(today);
          currentDate.setDate(today.getDate() - i);
          currentDate.setHours(0, 0, 0, 0); // Normalize to start of the day

          const dayOfWeekIndex = currentDate.getDay();
          const accountDayForCurrentDate = calculateAccountDay(currentDate, creationTimestamp);

          // Skip if this calendar day was before account creation
          if (accountDayForCurrentDate <= 0) {
            weeklyCompletionCounts[dayOfWeekIndex] = 0; // Ensure count is 0 for days before creation
            processedDates.push({ dayOfWeekIndex, date: currentDate, accountDay: 0 });
            continue;
          }

          // 4. Count completed daily tasks for the corresponding *account day*
          const completedTasksOnAccountDay = dailyRecords.filter(
            record => record.day === accountDayForCurrentDate
          );

          // Cap completion count at 2
          const completedCount = Math.min(completedTasksOnAccountDay.length, 2);
          weeklyCompletionCounts[dayOfWeekIndex] = completedCount;
          processedDates.push({ dayOfWeekIndex, date: currentDate, accountDay: accountDayForCurrentDate });
        }

         // Ensure dates are processed relative to today correctly (most recent first)
        processedDates.sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort descending by date

        console.log('WeeklyHabitSection: Processed Dates & Account Days:', processedDates.map(d => ({ date: d.date.toLocaleDateString(), accDay: d.accountDay, dow: d.dayOfWeekIndex, count: weeklyCompletionCounts[d.dayOfWeekIndex] })));


        // 5. Format data for the BarChart (Sun=0 to Sat=6 order)
        const formattedData = dayNames.map((day, index) => {
          const completedCount = weeklyCompletionCounts[index] ?? 0; // Get count for this day index (Sun, Mon...)
          const isCurrentDay = index === todayDayIndex; // Check if it's today

          return {
            day,
            completed: completedCount,
            total: 2, // Daily task goal is always 2
            isCurrentDay: isCurrentDay,
          };
        });

        setHabitData(formattedData);

        // 6. Calculate total completed in the displayed 7-day window
        const totalCompleted = Object.values(weeklyCompletionCounts).reduce((sum, count) => sum + count, 0);
        setTotalCompletedThisWeek(totalCompleted);

        console.log('WeeklyHabitSection: Formatted Data for Chart:', formattedData);
        console.log('WeeklyHabitSection: Total completed in last 7 days:', totalCompleted);

      } catch (error) {
        console.error('WeeklyHabitSection: Error fetching/processing habit data:', error);
        // Reset on error
        setHabitData(
          dayNames.map((day, index) => ({
            day,
            completed: 0,
            total: 2,
            isCurrentDay: index === new Date().getDay(),
          }))
        );
        setTotalCompletedThisWeek(0);
      }
    };

    fetchCompletionData();
  }, [userToken, refreshKey]); // Depend on userToken and refreshKey

  // Total possible tasks for the 7-day period shown
  const totalTasksForWeek = 14; // Fixed total for the 7-day bar chart comparison

  return (
    <View style={[styles.container, { backgroundColor: theme.boxBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>Daily Task Completion (Last 7 Days)</Text>
      <Text style={[styles.description, { color: theme.subtext }]}>
        Your daily task completions over the most recent 7 days.
      </Text>

      {/* BarChart now receives correctly calculated data per day */}
      <BarChart data={habitData} />

      <Text style={[styles.summaryText, { color: theme.subtext }]}>
        {totalCompletedThisWeek} of {totalTasksForWeek} daily tasks completed in the last 7 days
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
