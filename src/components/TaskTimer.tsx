import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  AppState,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatTime } from '../utils/timeUtils';

// Interface for props
interface TaskTimerProps {
  taskName: string;
  isActive: boolean;
  onStop: () => void;
}

const TaskTimer: React.FC<TaskTimerProps> = ({ taskName, isActive, onStop }) => {
  const [seconds, setSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const { theme } = useTheme();

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: string) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active' && isActive) {
        // App came back to foreground - recalculate seconds based on startTime
        if (startTime) {
          const now = new Date();
          const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          setSeconds(elapsedSeconds);
        }
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState, isActive, startTime]);

  // Start or stop the timer based on isActive prop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      // If timer just started, set the start time
      if (!startTime) {
        const now = new Date();
        setStartTime(now);
      }
      
      // Start the interval
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1;
          
          // Update notification every 15 seconds
          if (newSeconds % 15 === 0) {
            scheduleImmediateNotification(taskName, formatTime(newSeconds));
          }
          
          return newSeconds;
        });
      }, 1000);
    } else {
      // If timer stopped, clear the time
      setSeconds(0);
      setStartTime(null);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, taskName, startTime]);

  // Set up notifications
  useEffect(() => {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    
    // Request permissions
    Notifications.requestPermissionsAsync();
    
    // Clean up notification on unmount if timer is active
    return () => {
      if (isActive) {
        Notifications.dismissAllNotificationsAsync();
      }
    };
  }, [isActive]);

  // Function to schedule an immediate notification
  const scheduleImmediateNotification = async (task: string, time: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Working on: ${task}`,
        body: `Time elapsed: ${time}`,
        data: { taskName: task },
      },
      trigger: null, // Immediately show notification
    });
  };

  // Stop timer when stop button is pressed
  const handleStop = () => {
    onStop();
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderWidth: 1
      }
    ]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Task Timer</Text>
        <Text style={[styles.taskName, { color: theme.accent }]}>{taskName}</Text>
        <View style={styles.timerWrapper}>
          <Text style={[styles.timer, { color: theme.text }]}>{formatTime(seconds)}</Text>
          <View style={[styles.timerProgress, { backgroundColor: theme.accent + '30' }]}>
            <View 
              style={[
                styles.timerProgressFill, 
                { 
                  width: `${Math.min(100, (seconds / 60) * 10)}%`,
                  backgroundColor: theme.accent
                }
              ]} 
            />
          </View>
        </View>
        
        {startTime && (
          <Text style={[styles.startTime, { color: theme.subtext }]}>
            Started: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </Text>
        )}
        
        <TouchableOpacity 
          style={[styles.stopButton, { backgroundColor: theme.accent }]}
          onPress={handleStop}
        >
          <Ionicons name="stop-circle" size={18} color="white" />
          <Text style={styles.stopButtonText}>Stop Timer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  content: {
    padding: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  timerWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  timer: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
  },
  timerProgress: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  timerProgressFill: {
    height: '100%',
  },
  startTime: {
    fontSize: 14,
    marginBottom: 15,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  stopButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default TaskTimer; 