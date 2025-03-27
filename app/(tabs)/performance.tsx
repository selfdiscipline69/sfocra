import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  Alert,
  DeviceEventEmitter
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import * as storageService from '../../src/utils/StorageUtils';

// Import components
import XPLevelTracker from '../../components/performance/XPLevelTracker';
import WeeklyHabitSection from '../../components/performance/WeeklyHabitSection';
import TaskCompletionRate from '../../components/performance/TaskCompletionRate';
import ProgressSummary from '../../components/performance/ProgressSummary';
import LoadingErrorStates from '../../components/performance/LoadingErrorStates';
import BottomNavigation from '../../components/BottomNavigation';
import { getCategoryColor, CATEGORIES } from '../../src/components/performance/CategoryColorUtils';

// Updated interface to include task tracking with count instead of minutes
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
    isCurrentDay: boolean;
  }[];
  categoryData: {
    category: string;
    count: number; // Changed from minutes to count
    color: string;
  }[];
}

// Utility function to process completed tasks data
const processCompletedTasksData = (completedTasks: any[]): {
  category: string;
  count: number; // Changed from minutes to count
  color: string;
}[] => {
  if (!completedTasks || !Array.isArray(completedTasks) || completedTasks.length === 0) {
    // Return default empty state
    return [{
      category: 'No data',
      count: 100,
      color: '#E0E0E0'
    }];
  }
  
  // Group by category and count tasks (not minutes)
  const categoryMap: Record<string, number> = {};
  
  completedTasks.forEach(task => {
    const category = task.category || 'general';
    
    if (categoryMap[category]) {
      categoryMap[category] += 1; // Count tasks, not minutes
    } else {
      categoryMap[category] = 1;
    }
  });
  
  // Convert to array format expected by chart
  return Object.entries(categoryMap).map(([category, count]) => {
    return {
      category: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter
      count,
      color: getCategoryColor(category)
    };
  });
};

// Updated fetchDashboardData function with proper XP calculation
const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get the user token
  const userData = await storageService.getUserData();
  const userToken = userData.userToken;
  
  // Get current day name
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayName = dayNames[new Date().getDay()];
  
  // If no user token, return mock data
  if (!userToken) {
    return getMockDashboardData(currentDayName);
  }
  
  // Load completion records to calculate XP
  const completionRecords = await storageService.getTaskCompletionRecords(userToken);
  
  // Calculate XP based on task completion records
  let totalXP = 0;
  let dailyTasksCompleted = 0;
  let additionalTasksCompleted = 0;
  
  completionRecords.forEach(record => {
    if (record.is_daily === 1) {
      dailyTasksCompleted++;
      totalXP += 500; // Daily tasks are worth 500 XP
    } else {
      additionalTasksCompleted++;
      totalXP += 250; // Additional tasks are worth 250 XP
    }
  });
  
  // Calculate level based on XP (rounded down)
  const level = Math.floor(totalXP / 1000);
  
  // Calculate previous and next level XP thresholds
  const previousLevelXP = level * 1000;
  const nextLevelXP = (level + 1) * 1000;
  
  // Load completed tasks for category data
  const completedTasks = await storageService.getCompletedTasks(userToken);
  const categoryData = processCompletedTasksData(completedTasks);
  
  console.log(`XP Calculation: ${dailyTasksCompleted} daily tasks (${dailyTasksCompleted * 500} XP) + ${additionalTasksCompleted} additional tasks (${additionalTasksCompleted * 250} XP) = ${totalXP} total XP (Level ${level})`);
  
  return {
    xpData: {
      currentXP: totalXP,
      level: level,
      nextLevelXP: nextLevelXP,
      previousLevelXP: previousLevelXP
    },
    habitData: [
      { day: 'Mon', completed: 3, total: 5, isCurrentDay: currentDayName === 'Mon' },
      { day: 'Tue', completed: 5, total: 5, isCurrentDay: currentDayName === 'Tue' },
      { day: 'Wed', completed: 4, total: 5, isCurrentDay: currentDayName === 'Wed' },
      { day: 'Thu', completed: 2, total: 5, isCurrentDay: currentDayName === 'Thu' },
      { day: 'Fri', completed: 5, total: 5, isCurrentDay: currentDayName === 'Fri' },
      { day: 'Sat', completed: 3, total: 5, isCurrentDay: currentDayName === 'Sat' },
      { day: 'Sun', completed: 4, total: 5, isCurrentDay: currentDayName === 'Sun' },
    ],
    categoryData: categoryData
  };
};

// For fallback, provide mock data with level 0 as default
const getMockDashboardData = (currentDayName: string): DashboardData => {
  return {
    xpData: {
      currentXP: 0,
      level: 0,
      nextLevelXP: 1000,
      previousLevelXP: 0
    },
    habitData: [
      { day: 'Mon', completed: 3, total: 5, isCurrentDay: currentDayName === 'Mon' },
      { day: 'Tue', completed: 5, total: 5, isCurrentDay: currentDayName === 'Tue' },
      { day: 'Wed', completed: 4, total: 5, isCurrentDay: currentDayName === 'Wed' },
      { day: 'Thu', completed: 2, total: 5, isCurrentDay: currentDayName === 'Thu' },
      { day: 'Fri', completed: 5, total: 5, isCurrentDay: currentDayName === 'Fri' },
      { day: 'Sat', completed: 3, total: 5, isCurrentDay: currentDayName === 'Sat' },
      { day: 'Sun', completed: 4, total: 5, isCurrentDay: currentDayName === 'Sun' },
    ],
    categoryData: [
      { category: 'Fitness', count: 12, color: getCategoryColor('fitness') },
      { category: 'Learning', count: 9, color: getCategoryColor('learning') },
      { category: 'Mindfulness', count: 5, color: getCategoryColor('mindfulness') },
      { category: 'Social', count: 6, color: getCategoryColor('social') },
      { category: 'Creativity', count: 3, color: getCategoryColor('creativity') },
    ]
  };
};

// Add a new Account Age display component
const AccountAgeDisplay = ({ days, theme }: { days: number, theme: any }) => {
  return (
    <View style={[styles.accountAgeContainer, { backgroundColor: theme.boxBackground }]}>
      <Text style={[styles.accountAgeTitle, { color: theme.text }]}>Your Journey</Text>
      <Text style={[styles.accountAgeDays, { color: theme.accent }]}>
        Day {days}
      </Text>
      <Text style={[styles.accountAgeSubtext, { color: theme.subtext }]}>
        since starting your development path
      </Text>
    </View>
  );
};

// Add this function near the top, after the imports
const getDaysSinceAccountCreation = async (userToken: string): Promise<number> => {
  try {
    // For now, just return a static value until you implement the real function
    return 1; // Day 1
  } catch (error) {
    console.error('Error getting days since account creation:', error);
    return 1;
  }
};

export default function PerformanceScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);
  const [accountAge, setAccountAge] = useState<number>(1); // Default to day 1
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [userToken, setUserToken] = useState<string>('');
  
  // Load the user token at component initialization
  useEffect(() => {
    const loadUserData = async () => {
      const userData = await storageService.getUserData();
      setUserToken(userData.userToken || '');
    };
    
    loadUserData();
  }, []);
  
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
  
  // Then modify the useEffect that loads account age
  useEffect(() => {
    const loadAccountAge = async () => {
      const userData = await storageService.getUserData();
      if (userData.userToken) {
        // Use our local function instead of the one from storageService
        const days = await getDaysSinceAccountCreation(userData.userToken);
        setAccountAge(days);
      }
    };
    
    loadAccountAge();
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
  
  // Add this function to update the refresh key
  const refreshAllComponents = () => {
    setRefreshKey(prev => prev + 1);
    loadDashboardData();
  };
  
  // Use useFocusEffect to refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Refresh all components when screen comes into focus
      refreshAllComponents();
      return () => {
        // Clean up if needed
      };
    }, [])
  );
  
  // Update onRefresh to also update the refresh key
  const onRefresh = async () => {
    setRefreshing(true);
    refreshAllComponents();
    setRefreshing(false);
  };
  
  // Add to the top of the component
  useEffect(() => {
    // Set up event listener for task completion
    const subscription = DeviceEventEmitter.addListener('taskCompleted', () => {
      console.log('Task completed event received, refreshing performance data');
      refreshAllComponents();
    });
    
    return () => {
      // Clean up the subscription
      subscription.remove();
    };
  }, []);
  
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
        {/* Account Age Display */}
        <AccountAgeDisplay days={accountAge} theme={theme} />
        
        <XPLevelTracker xpData={dashboardData.xpData} theme={theme} />
        <WeeklyHabitSection 
          theme={theme} 
          userToken={userToken}
          refreshKey={refreshKey} 
        />
        <TaskCompletionRate categoryData={dashboardData.categoryData} theme={theme} />
        <ProgressSummary 
          theme={theme} 
          userToken={userToken}
          refreshKey={refreshKey} 
        />
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
        <BottomNavigation 
          theme={theme} 
          onAddTaskPress={() => {}}
        />
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
  accountAgeContainer: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  accountAgeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  accountAgeDays: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  accountAgeSubtext: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },

});

export const unstable_settings = {
  bottomTabs: {
    tabBarStyle: { display: 'flex' },
  },
};