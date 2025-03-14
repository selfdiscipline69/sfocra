import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Define the dashboard data type
interface DashboardData {
  xpData: {
    currentXP: number;
    level: number;
    nextLevelXP: number;
    previousLevelXP: number;
  };
  habitData: {
    day: string;
    completed: number;
    total: number;
  }[];
  categoryData: {
    category: string;
    minutes: number;
    color: string;
  }[];
}

// Mock data function directly in this file
const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    xpData: {
      currentXP: 750,
      level: 5,
      nextLevelXP: 1000,
      previousLevelXP: 500
    },
    habitData: [
      { day: 'Mon', completed: 3, total: 5 },
      { day: 'Tue', completed: 5, total: 5 },
      { day: 'Wed', completed: 4, total: 5 },
      { day: 'Thu', completed: 2, total: 5 },
      { day: 'Fri', completed: 5, total: 5 },
      { day: 'Sat', completed: 3, total: 5 },
      { day: 'Sun', completed: 4, total: 5 },
    ],
    categoryData: [
      { category: 'Fitness', minutes: 120, color: '#FF5252' },
      { category: 'Learning', minutes: 90, color: '#4CAF50' },
      { category: 'Mindfulness', minutes: 45, color: '#2196F3' },
      { category: 'Social', minutes: 60, color: '#FFC107' },
      { category: 'Creativity', minutes: 30, color: '#9C27B0' },
    ]
  };
};

// Simple Pie Chart Component - Updated with theme-aware center circle
const PieChart = ({ data, size = 200 }) => {
  const { theme } = useTheme();
  const total = data.reduce((sum, item) => sum + item.minutes, 0);
  let startAngle = 0;
  
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <View style={{ 
        width: size, 
        height: size, 
        borderRadius: size/2, 
        overflow: 'hidden',
        position: 'relative'
      }}>
        {data.map((item, index) => {
          const sweepAngle = (item.minutes / total) * 360;
          const endAngle = startAngle + sweepAngle;
          
          // Create a wedge shape using absolute positioning and rotation
          const result = (
            <View key={index} style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transform: [
                { rotate: `${startAngle}deg` }
              ]
            }}>
              <View style={{
                width: '50%',
                height: '100%',
                position: 'absolute',
                left: '50%',
                backgroundColor: item.color,
                transform: sweepAngle > 180 ? [
                  { rotate: '180deg' }
                ] : [
                  { rotate: `${sweepAngle}deg` }
                ],
                transformOrigin: 'left center'
              }} />
              {sweepAngle > 180 && (
                <View style={{
                  width: '50%',
                  height: '100%',
                  position: 'absolute',
                  left: 0,
                  backgroundColor: item.color,
                  transform: [
                    { rotate: `${sweepAngle - 180}deg` }
                  ],
                  transformOrigin: 'right center'
                }} />
              )}
            </View>
          );
          
          startAngle = endAngle;
          return result;
        })}
      </View>
      {/* Optional center circle for donut effect - Now uses theme background color */}
      <View style={{
        position: 'absolute',
        top: size/4,
        left: size/4,
        width: size/2,
        height: size/2,
        borderRadius: size/4,
        backgroundColor: theme.boxBackground, // Use theme background instead of hardcoded white
      }} />
    </View>
  );
};

// Custom Bar Chart Component
const BarChart = ({ data }: { data: { day: string; completed: number; total: number }[] }) => {
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
                <View style={[styles.barBackground, { backgroundColor: theme.mode === 'dark' ? '#444' : '#e0e0e0', height: `${(item.total / maxValue) * 100}%` }]} />
                
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

export default function PerformanceScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);
  
  // Load data on initial render
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  // Function to load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(false);
      
      // Use the locally defined function
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };
  
  // Back button handler
  const handleBack = () => {
    router.push('/(tabs)/homepage');
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTitleStyle: {
            fontSize: 20,
            color: theme.text,
          },
          headerTitle: "Performance Dashboard",
          headerRight: () => (
            <TouchableOpacity
              style={styles.topRightBackButton}
              onPress={handleBack}
            >
              <Text style={[styles.topRightBackText, { color: theme.text }]}>Back</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.text }]}>Loading dashboard data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.text }]}>Failed to load dashboard data.</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.accent }]}
              onPress={loadDashboardData}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : dashboardData ? (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={[theme.accent]}
                tintColor={theme.accent}
              />
            }
          >
            {/* XP & Level Tracker */}
            <View style={[styles.placeholderBox, { backgroundColor: theme.boxBackground }]}>
              <Text style={[styles.placeholderTitle, { color: theme.text }]}>XP & Level</Text>
              <Text style={[styles.placeholderText, { color: theme.subtext }]}>
                Level {dashboardData.xpData.level} • {dashboardData.xpData.currentXP}/{dashboardData.xpData.nextLevelXP} XP
              </Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${((dashboardData.xpData.currentXP - dashboardData.xpData.previousLevelXP) / 
                              (dashboardData.xpData.nextLevelXP - dashboardData.xpData.previousLevelXP)) * 100}%`,
                      backgroundColor: theme.accent 
                    }
                  ]} 
                />
              </View>
            </View>
            
            {/* Weekly Habit Completion - Now with bar chart! */}
            <View style={[styles.placeholderBox, { backgroundColor: theme.boxBackground }]}>
              <Text style={[styles.placeholderTitle, { color: theme.text }]}>Weekly Habit Completion</Text>
              
              {/* Add the custom bar chart */}
              <BarChart data={dashboardData.habitData} />
              
              <Text style={[styles.summaryText, { color: theme.subtext, textAlign: 'right', marginTop: 10 }]}>
                {dashboardData.habitData.reduce((sum, item) => sum + item.completed, 0)} of {dashboardData.habitData.reduce((sum, item) => sum + item.total, 0)} tasks completed
              </Text>
            </View>
            
            {/* Time Spent by Category - Now with Pie Chart */}
            <View style={[styles.placeholderBox, { backgroundColor: theme.boxBackground }]}>
              <Text style={[styles.placeholderTitle, { color: theme.text }]}>Time Spent by Category</Text>
              
              {/* Pie Chart Visualization */}
              <View style={styles.pieChartContainer}>
                <PieChart 
                  data={dashboardData.categoryData} 
                  size={Dimensions.get('window').width * 0.6}
                />
              </View>
              
              {/* Legend below pie chart */}
              <View style={styles.legendContainer}>
                {dashboardData.categoryData.map((item, index) => {
                  const totalMinutes = dashboardData.categoryData.reduce((sum, item) => sum + item.minutes, 0);
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
                Total: {dashboardData.categoryData.reduce((sum, item) => sum + item.minutes, 0)} minutes
              </Text>
            </View>
            
            <View style={styles.dashboardSummary}>
              <Text style={[styles.summaryTitle, { color: theme.text }]}>Your Progress</Text>
              <Text style={[styles.summaryText, { color: theme.subtext }]}>
                You're making great strides in your journey! Keep up the good work to reach your next level.
              </Text>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.text }]}>No data available.</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.accent }]}
              onPress={loadDashboardData}
            >
              <Text style={styles.retryText}>Load Data</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Bottom Navigation Icons */}
        <View style={[styles.bottomNav, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/performance')}
            style={[styles.navButton, styles.activeNavButton]}
          >
            <FontAwesome5 name="chart-line" size={22} color={theme.text} />
          </TouchableOpacity>
          
          {/* Home button */}
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => router.push('/(tabs)/homepage')}
          >
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/settings')}
            style={styles.navButton}
          >
            <Ionicons name="settings-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // ...existing styles...
  
  placeholderBox: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 14,
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#444',
    borderRadius: 5,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
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
  
  // Existing styles are preserved
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Give space for bottom nav
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dashboardSummary: {
    marginTop: 16,
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  topRightBackButton: {
    backgroundColor: 'transparent',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  topRightBackText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderTopWidth: 1,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  activeNavButton: {
    opacity: 0.9,
  },
  homeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  totalTimeText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'right',
    fontStyle: 'italic',
  },
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
  summaryText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export const unstable_settings = {
  bottomTabs: {
    tabBarStyle: { display: 'flex' },
  },
};