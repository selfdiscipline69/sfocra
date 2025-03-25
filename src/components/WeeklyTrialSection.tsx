import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface WeeklyTrialSectionProps {
  weeklyTrial: string | null;
  theme: any;
  category?: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity';
}

interface WeeklyTrialActivity {
  text: string;
  completed: boolean;
}

const WeeklyTrialSection = ({ weeklyTrial, theme, category }: WeeklyTrialSectionProps) => {
  // Parse the weekly trial into individual activities
  const [activities, setActivities] = useState<WeeklyTrialActivity[]>([]);
  const [userToken, setUserToken] = useState<string | null>(null);
  
  // Get user token
  useEffect(() => {
    const fetchUserToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    };
    fetchUserToken();
  }, []);
  
  // Load activities and their completion status
  useEffect(() => {
    if (!weeklyTrial) {
      setActivities([]);
      return;
    }
    
    // Split by double newline to get separate activities
    const activityTexts = weeklyTrial.split('\n\n')
      .map(activity => activity.trim())
      .filter(Boolean);
    
    // Load saved completion status
    const loadCompletionStatus = async () => {
      try {
        if (!userToken) return;
        
        const savedStatusKey = `weeklyTrialActivities_${userToken}`;
        const savedStatus = await AsyncStorage.getItem(savedStatusKey);
        
        if (savedStatus) {
          const parsedStatus = JSON.parse(savedStatus);
          
          // Match saved status with current activities by text content
          const newActivities = activityTexts.map(text => {
            const existingActivity = parsedStatus.find((a: WeeklyTrialActivity) => a.text === text);
            return {
              text,
              completed: existingActivity ? existingActivity.completed : false,
            };
          });
          
          setActivities(newActivities);
        } else {
          // Initialize all as not completed
          setActivities(activityTexts.map(text => ({ 
            text, 
            completed: false 
          })));
        }
      } catch (error) {
        console.error('Error loading weekly trial status:', error);
        // Initialize all as not completed as fallback
        setActivities(activityTexts.map(text => ({ 
          text, 
          completed: false 
        })));
      }
    };
    
    loadCompletionStatus();
  }, [weeklyTrial, userToken]);
  
  // Calculate progress percentage
  const progressPercentage = React.useMemo(() => {
    if (activities.length === 0) return 0;
    const completedCount = activities.filter(a => a.completed).length;
    return (completedCount / activities.length) * 100;
  }, [activities]);

  // Toggle completion status of an activity
  const toggleActivity = async (index: number) => {
    try {
      // Update state
      const newActivities = [...activities];
      newActivities[index].completed = !newActivities[index].completed;
      setActivities(newActivities);
      
      // Save to AsyncStorage
      if (userToken) {
        const savedStatusKey = `weeklyTrialActivities_${userToken}`;
        await AsyncStorage.setItem(savedStatusKey, JSON.stringify(newActivities));
      }
    } catch (error) {
      console.error('Error saving weekly trial status:', error);
    }
  };

  // Get color for activity marker based on activity content
  const getActivityColor = (activity: string): string => {
    const lowerActivity = activity.toLowerCase();
    if (lowerActivity.includes('fitness')) return theme.categoryColors.fitness;
    if (lowerActivity.includes('learning')) return theme.categoryColors.learning;
    if (lowerActivity.includes('social')) return theme.categoryColors.social;
    if (lowerActivity.includes('mind')) return theme.categoryColors.mindfulness;
    return theme.categoryColors.creativity; // default
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.boxBackground }]}>
      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>Weekly Trial</Text>
      
      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: theme.mode === 'dark' ? '#333333' : '#e0e0e0' }]}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${progressPercentage}%`, backgroundColor: theme.categoryColors.learning }
          ]} 
        />
      </View>
      
      {/* Activities */}
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.activityContainer, 
              { 
                backgroundColor: theme.mode === 'dark' ? '#333333' : '#E4E4E4',
                borderColor: theme.border,
                borderWidth: 1,
              }
            ]}
            onPress={() => toggleActivity(index)}
          >
            <View style={[styles.activityMarker, { backgroundColor: getActivityColor(activity.text) }]} />
            <Text style={[styles.activityText, { color: theme.text }]}>{activity.text}</Text>
            <View style={[
              styles.checkContainer, 
              { borderColor: theme.mode === 'dark' ? '#666666' : '#c7c7cc' },
              activity.completed ? [styles.checkedContainer, { backgroundColor: theme.categoryColors.learning }] : {}
            ]}>
              {activity.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={[styles.noTrialText, { color: theme.subtext }]}>No quests available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 10,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 0,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  activityMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedContainer: {
    borderColor: 'transparent',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noTrialText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
  }
});

export default WeeklyTrialSection;