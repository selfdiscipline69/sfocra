import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';

// Import components
import XPLevelTracker from '../../src/components/performance/XPLevelTracker';
import WeeklyHabitSection from '../../src/components/performance/WeeklyHabitSection';
import TimeSpentSection from '../../src/components/performance/TimeSpentSection';
import ProgressSummary from '../../src/components/performance/ProgressSummary';
import LoadingErrorStates from '../../src/components/performance/LoadingErrorStates';
import BottomNavigation from '../../src/components/settings/SettingBottomNavigation';

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
});

export const unstable_settings = {
  bottomTabs: {
    tabBarStyle: { display: 'flex' },
  },
};