import React, { useState, useEffect, useRef } from 'react';
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
  onDiscard?: () => void;
  elapsedSeconds?: number;
  theme?: any;
}

const TimerDisplay = ({
  isRunning,
  taskName,
  startTime,
  onStop,
  timerStopped = false,
  onFinish,
  onResume,
  onDiscard,
  elapsedSeconds = 0,
  theme: propTheme
}: TimerDisplayProps) => {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

  const [displaySeconds, setDisplaySeconds] = useState(elapsedSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isRunning && startTime && !timerStopped) {
      const initialOffset = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setDisplaySeconds(elapsedSeconds + initialOffset);

      intervalRef.current = setInterval(() => {
        const currentTotalElapsed = elapsedSeconds + Math.floor((Date.now() - startTime.getTime()) / 1000);
        setDisplaySeconds(currentTotalElapsed);
      }, 1000);

    } else {
      setDisplaySeconds(elapsedSeconds);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, startTime, timerStopped, elapsedSeconds]);

  if (!timerStopped && !isRunning) return null;

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.card,
      }
    ]}>
      <View style={styles.timerContent}>
        <Text style={[styles.timerLabel, { color: theme.text }]}>
          {timerStopped ? 'Timer Stopped' : 'Timer Active'}
        </Text>
        <Text style={[styles.taskName, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">
          {taskName || 'Task'}
        </Text>
        <Text style={[styles.time, { color: timerStopped ? theme.accentSecondary || '#e74c3c' : theme.accent }]}>
          {formatTime(displaySeconds)}
        </Text>
        {isRunning && startTime && !timerStopped && (
          <Text style={[styles.startTime, { color: theme.subtext }]}>
            Started: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'/*, hour12: false*/ })}
          </Text>
        )}
      </View>
      
      {timerStopped ? (
        <View style={styles.buttonContainerPaused}>
          <TouchableOpacity
            style={[styles.actionButton, styles.resumeButton]}
            onPress={onResume}
          >
            <Ionicons name="play-circle" size={18} color="white" />
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.discardButton]}
            onPress={onDiscard}
          >
            <Ionicons name="close-circle" size={18} color="white" />
            <Text style={styles.buttonText}>Discard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.finishButton]}
            onPress={onFinish}
          >
            <Ionicons name="checkmark-circle" size={18} color="white" />
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        isRunning && (
          <TouchableOpacity
            style={[styles.actionButton, styles.stopButton]}
            onPress={onStop}
          >
            <Ionicons name="stop-circle" size={18} color="white" />
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    width: '95%',
    alignSelf: 'center',
  },
  timerContent: {
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    opacity: 0.8,
    marginBottom: 4,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    marginVertical: 2,
    letterSpacing: 1,
  },
  startTime: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  buttonContainerPaused: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 25,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 90,
    marginHorizontal: 5,
  },
  stopButton: {
    backgroundColor: '#e74c3c',
    alignSelf: 'center',
    paddingHorizontal: 25,
    marginTop: 10,
  },
  resumeButton: {
    backgroundColor: '#27ae60',
  },
  discardButton: {
    backgroundColor: '#8e8e93',
  },
  finishButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default TimerDisplay; 