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
  timerStopped?: boolean;
  onFinish?: () => void;
  onResume?: () => void;
  elapsedSeconds?: number;
}

const TimerDisplay = ({ 
  isRunning, 
  taskName, 
  startTime, 
  onStop,
  timerStopped = false,
  onFinish,
  onResume,
  elapsedSeconds = 0
}: TimerDisplayProps) => {
  const [elapsedTime, setElapsedTime] = useState(elapsedSeconds);
  const { theme } = useTheme(); // Get the current theme

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && startTime && !timerStopped) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, timerStopped]);

  // Update local state when elapsedSeconds prop changes
  useEffect(() => {
    setElapsedTime(elapsedSeconds);
  }, [elapsedSeconds]);

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
        <Text style={[styles.timerLabel, { color: theme.text }]}>
          {timerStopped ? 'Timer Stopped' : 'Timer Active'}
        </Text>
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
      
      {timerStopped ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#27ae60' }]}
            onPress={onResume}
          >
            <Ionicons name="play-circle" size={16} color="white" />
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#e74c3c' }]}
            onPress={onFinish}
          >
            <Ionicons name="checkmark-circle" size={16} color="white" />
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#e74c3c' }]}
          onPress={onStop}
        >
          <Ionicons name="stop-circle" size={16} color="white" />
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: 16,
    margin: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  timerContent: {
    alignItems: 'center',
    marginBottom: 12,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  time: {
    fontSize: 32,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    marginVertical: 2,
  },
  startTime: {
    fontSize: 12,
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default TimerDisplay; 