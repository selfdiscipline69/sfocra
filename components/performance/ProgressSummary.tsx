import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressSummaryProps {
  theme: any;
}

const ProgressSummary = ({ theme }: ProgressSummaryProps) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Your Progress</Text>
      <Text style={[styles.text, { color: theme.subtext }]}>
        You're making great strides in your journey! Keep up the good work to reach your next level.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ProgressSummary;
