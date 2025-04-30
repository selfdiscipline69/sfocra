import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { formatTime } from '../utils/timeUtils';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Task } from './DailyTaskInput'; // Import necessary types
import { AdditionalTask } from '../types/UserTypes';

// --- Type for the internal timer state ---
interface TimerData {
  taskIndex: number; // Index might not be needed if we pass full task object
  taskItem: Task | AdditionalTask; // Store the full task object
  isDaily: boolean;
  taskName: string;
  isActive: boolean;
  originalStartTime: Date;
  pauseStartTime: Date | null;
  totalPauseDuration: number;
  timerStopped: boolean;
}

// --- Props for TimerDisplay ---
interface TimerDisplayProps {
  theme: any;
  // Callback when timer finishes (passes the task item and final duration)
  onTimerFinish: (taskItem: Task | AdditionalTask, isDaily: boolean, elapsedSeconds: number) => void;
  // Callback when timer is discarded
  onTimerDiscard: (taskItem: Task | AdditionalTask, isDaily: boolean) => void;
}

// --- Ref Handle Interface ---
export interface TimerDisplayRef {
  startTimer: (taskItem: Task | AdditionalTask, isDaily: boolean) => void;
}

// --- TimerDisplay Component using forwardRef ---
const TimerDisplay = forwardRef<TimerDisplayRef, TimerDisplayProps>(
  ({ theme: propTheme, onTimerFinish, onTimerDiscard }, ref) => {
    const { theme: contextTheme } = useTheme();
    const theme = propTheme || contextTheme;

    // --- Internal State ---
    const [isVisible, setIsVisible] = useState(false);
    const [timerData, setTimerData] = useState<TimerData | null>(null);
    const [displaySeconds, setDisplaySeconds] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    // --- End Internal State ---

    // --- Method to Start the Timer (Exposed via Ref) ---
    useImperativeHandle(ref, () => ({
      startTimer: (taskItem: Task | AdditionalTask, isDaily: boolean) => {
        if (isVisible) { // Prevent starting if already visible/active
          Alert.alert("Timer Active", "Another timer is already running or paused.");
          return;
        }

        const taskText = taskItem.text;
        if (!taskText) {
            console.error("Cannot start timer: Task text is empty.");
            return;
        }
        const taskName = taskText.includes('(') ? taskText.split('(')[0].trim() : taskText;

        console.log(`Starting timer for: ${taskName}`);
        setTimerData({
          taskIndex: -1, // Index might not be needed anymore
          taskItem: taskItem,
          isDaily: isDaily,
          taskName: taskName,
          isActive: true,
          originalStartTime: new Date(),
          pauseStartTime: null,
          totalPauseDuration: 0,
          timerStopped: false,
        });
        setIsVisible(true);
      },
    }));
    // --- End Start Timer Method ---

    // --- Internal Timer Control Logic ---
    const handleStop = () => {
      if (!timerData || !timerData.isActive) return;
      setTimerData(prev => prev ? {
        ...prev,
        isActive: false,
        timerStopped: true,
        pauseStartTime: new Date(),
      } : null);
    };

    const handleResume = () => {
      if (!timerData || timerData.isActive || !timerData.pauseStartTime) return;
      const currentPauseDuration = Date.now() - timerData.pauseStartTime.getTime();
      setTimerData(prev => prev ? {
        ...prev,
        isActive: true,
        timerStopped: false,
        pauseStartTime: null,
        totalPauseDuration: prev.totalPauseDuration + currentPauseDuration,
      } : null);
    };

    const handleDiscard = () => {
      console.log("Discarding timer internally");
      if (timerData) {
        onTimerDiscard(timerData.taskItem, timerData.isDaily); // Notify parent
      }
      setIsVisible(false);
      setTimerData(null);
      setDisplaySeconds(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const handleFinish = () => {
      if (!timerData) return;

      // Calculate final elapsed time
      let finalElapsedSeconds = 0;
      const now = Date.now();
      const startTime = timerData.originalStartTime.getTime();
      const pauseStart = timerData.pauseStartTime?.getTime();

      if (timerData.isActive) {
        finalElapsedSeconds = Math.floor((now - startTime - timerData.totalPauseDuration) / 1000);
      } else if (pauseStart) {
        finalElapsedSeconds = Math.floor((pauseStart - startTime - timerData.totalPauseDuration) / 1000);
      }
      finalElapsedSeconds = Math.max(0, finalElapsedSeconds);

      console.log(`Finishing timer internally for ${timerData.taskName}, Elapsed: ${finalElapsedSeconds}s`);

      // Notify parent *before* clearing state
      onTimerFinish(timerData.taskItem, timerData.isDaily, finalElapsedSeconds);

      // Clean up internal state
      setIsVisible(false);
      setTimerData(null);
      setDisplaySeconds(0);
       if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // --- End Internal Timer Control Logic ---

    // --- useEffect for Time Calculation ---
    useEffect(() => {
      const calculateElapsed = (): number => {
        if (!timerData) return 0; // No data, no time

        let elapsedMs = 0;
        const now = Date.now();
        const startTime = timerData.originalStartTime.getTime();
        const pauseStart = timerData.pauseStartTime?.getTime();

        if (timerData.isActive && !pauseStart) {
          elapsedMs = now - startTime - timerData.totalPauseDuration;
        } else if (!timerData.isActive && pauseStart) {
          elapsedMs = pauseStart - startTime - timerData.totalPauseDuration;
        } else {
           // This case might occur briefly during state transitions or if timerData is somehow invalid
           // If paused, time shouldn't advance, calculate based on when pause started.
           if(pauseStart){
               elapsedMs = pauseStart - startTime - timerData.totalPauseDuration;
           } else {
               // Default to 0 if state is inconsistent
               elapsedMs = 0;
           }
        }
        return Math.max(0, Math.floor(elapsedMs / 1000));
      };

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (isVisible && timerData) {
          setDisplaySeconds(calculateElapsed()); // Set initial display

          // Only run interval if timer is active (running)
          if (timerData.isActive && !timerData.pauseStartTime) {
              intervalRef.current = setInterval(() => {
                  setDisplaySeconds(calculateElapsed());
              }, 1000);
          }
      } else {
          // Ensure display is 0 if not visible or no data
          setDisplaySeconds(0);
      }


      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
      // Dependencies now based on internal state affecting calculation
    }, [isVisible, timerData]);
    // --- End useEffect ---

    // --- Render Logic ---
    if (!isVisible || !timerData) {
      return null; // Don't render if not visible or no data
    }

    return (
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <View style={styles.timerContent}>
          <Text style={[styles.timerLabel, { color: theme.text }]}>
            {timerData.timerStopped ? 'Timer Stopped' : 'Timer Active'}
          </Text>
          <Text style={[styles.taskName, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">
            {timerData.taskName || 'Task'}
          </Text>
          <Text style={[styles.time, { color: timerData.timerStopped ? theme.accentSecondary || '#e74c3c' : theme.accent }]}>
            {formatTime(displaySeconds)}
          </Text>
          {timerData.originalStartTime && (
            <Text style={[styles.startTime, { color: theme.subtext }]}>
              Started: {timerData.originalStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'/*, hour12: false*/ })}
            </Text>
          )}
        </View>
        
        {timerData.timerStopped ? (
          <View style={styles.buttonContainerPaused}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resumeButton]}
              onPress={handleResume}
            >
              <Ionicons name="play-circle" size={18} color="white" />
              <Text style={styles.buttonText}>Resume</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.discardButton]}
              onPress={handleDiscard}
            >
              <Ionicons name="close-circle" size={18} color="white" />
              <Text style={styles.buttonText}>Discard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.finishButton]}
              onPress={handleFinish}
            >
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text style={styles.buttonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        ) : (
          timerData.isActive && (
            <TouchableOpacity
              style={[styles.actionButton, styles.stopButton]}
              onPress={handleStop}
            >
              <Ionicons name="stop-circle" size={18} color="white" />
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    );
  }
);

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