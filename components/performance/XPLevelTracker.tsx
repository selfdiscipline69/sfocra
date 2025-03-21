import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface XPLevelTrackerProps {
  xpData: {
    currentXP: number;
    level: number;
    nextLevelXP: number;
    previousLevelXP: number;
  };
  theme: any;
}

const XPLevelTracker = ({ xpData, theme }: XPLevelTrackerProps) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.boxBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>XP & Level</Text>
      <Text style={[styles.infoText, { color: theme.subtext }]}>
        Level {xpData.level} • {xpData.currentXP}/{xpData.nextLevelXP} XP
      </Text>
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${((xpData.currentXP - xpData.previousLevelXP) / 
                      (xpData.nextLevelXP - xpData.previousLevelXP)) * 100}%`,
              backgroundColor: theme.accent 
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoText: {
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
});

export default XPLevelTracker;
