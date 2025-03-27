import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatTime } from '../utils/timeUtils';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface TimerDisplayProps {
  isRunning: boolean;
  taskName?: string;
  startTime?: Date;
  onStop?: () => void;
}

const TimerDisplay = ({ isRunning, taskName, startTime, onStop }: TimerDisplayProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const { theme } = useTheme(); // Get the current theme

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  if (!isRunning) return null;

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderWidth: 1 
      }
    ]}>
      <View style={styles.timerContent}>
        <Text style={[styles.taskName, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">
          {taskName || 'Task'}
        </Text>
        <Text style={[styles.time, { color: theme.accent }]}>{formatTime(elapsedTime)}</Text>
        {startTime && (
          <Text style={[styles.startTime, { color: theme.subtext }]}>
            Started: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </Text>
        )}
      </View>
      <TouchableOpacity 
        style={[styles.stopButton, { backgroundColor: theme.accent }]} 
        onPress={onStop}
      >
        <Ionicons name="stop-circle" size={16} color="white" />
        <Text style={styles.stopText}>Stop</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: 12,
    margin: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  timerContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  time: {
    fontSize: 20,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginVertical: 2,
  },
  startTime: {
    fontSize: 12,
    marginTop: 2,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  stopText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default TimerDisplay; 