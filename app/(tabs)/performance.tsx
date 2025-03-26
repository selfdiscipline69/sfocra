import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import * as storageService from '../../src/utils/StorageUtils';

// Import components
import XPLevelTracker from '../../components/performance/XPLevelTracker';
import WeeklyHabitSection from '../../components/performance/WeeklyHabitSection';
import TimeSpentSection from '../../components/performance/TimeSpentSection';
import ProgressSummary from '../../components/performance/ProgressSummary';
import LoadingErrorStates from '../../components/performance/LoadingErrorStates';
import BottomNavigation from '../../components/BottomNavigation';

// Updated interface to include task tracking
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

// Utility function to process completed tasks data
const processCompletedTasksData = (completedTasks: any[]): {
  category: string;
  minutes: number;
  color: string;
}[] => {
  if (!completedTasks || !Array.isArray(completedTasks) || completedTasks.length === 0) {
    // Return default empty state
    return [{
      category: 'No data',
      minutes: 100,
      color: '#E0E0E0'
    }];
  }
  
  // Group by category and sum minutes
  const categoryMap: Record<string, number> = {};
  
  completedTasks.forEach(task => {
    const category = task.category || 'general';
    const minutes = task.minutes || 30;
    
    if (categoryMap[category]) {
      categoryMap[category] += minutes;
    } else {
      categoryMap[category] = minutes;
    }
  });
  
  // Convert to array format expected by chart
  return Object.entries(categoryMap).map(([category, minutes]) => {
    // Assign color based on category
    let color;
    switch(category.toLowerCase()) {
      case 'fitness': color = '#FF5252'; break;
      case 'learning': color = '#4CAF50'; break;
      case 'knowledge': color = '#4CAF50'; break; // Same as learning
      case 'mindfulness': color = '#2196F3'; break;
      case 'social': color = '#FFC107'; break;
      case 'creativity': color = '#9C27B0'; break;
      default: color = '#607D8B'; break; // Default gray
    }
    
    return {
      category: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter
      minutes,
      color
    };
  });
};

// Updated fetchDashboardData to load real completed tasks
const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get the user token
  const userData = await storageService.getUserData();
  const userToken = userData.userToken;
  
  // If no user token, return mock data
  if (!userToken) {
    return getMockDashboardData();
  }
  
  // Load completed tasks
  const completedTasks = await storageService.getCompletedTasks(userToken);
  const categoryData = processCompletedTasksData(completedTasks);
  
  // Return combination of mock data and real category data
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
    categoryData: categoryData
  };
};

// For fallback, provide mock data
const getMockDashboardData = (): DashboardData => {
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
  
  // Use useFocusEffect to reload data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reload data when the screen comes into focus
      loadDashboardData();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );
  
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
  
  // Render dashboard content
  const renderDashboardContent = () => {
    if (!dashboardData) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>No data available.</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.accent }]}
            onPress={loadDashboardData}
          >
            <Text style={styles.retryText}>Load Data</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
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
        <XPLevelTracker xpData={dashboardData.xpData} theme={theme} />
        <WeeklyHabitSection habitData={dashboardData.habitData} theme={theme} />
        <TimeSpentSection categoryData={dashboardData.categoryData} theme={theme} />
        <ProgressSummary theme={theme} />
      </ScrollView>
    );
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
        }} 
      />
      
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Show loading/error states when appropriate (and not during refreshing) */}
        {!refreshing && (
          <LoadingErrorStates 
            isLoading={isLoading} 
            error={error} 
            theme={theme} 
            onRetry={loadDashboardData} 
          />
        )}
        
        {/* Show dashboard content when not loading and no error */}
        {!isLoading && !error && renderDashboardContent()}
        
        {/* Bottom Navigation using shared component */}
        <BottomNavigation theme={theme} activeScreen="performance" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
});

export const unstable_settings = {
  bottomTabs: {
    tabBarStyle: { display: 'flex' },
  },
};