import React from 'react';
import { Text, StyleSheet } from 'react-native';
import WeeklyTrialBox from './WeeklyTrialBox';

interface WeeklyTrialSectionProps {
  weeklyTrial: string | null;
  theme: any; // Replace with proper theme type if available
}

const WeeklyTrialSection = ({ weeklyTrial, theme }: WeeklyTrialSectionProps) => {
  return (
    <WeeklyTrialBox title="Weekly Trial">
      {weeklyTrial ? (
        <Text style={[
          styles.trialText, 
          { color: theme.mode === 'dark' ? 'white' : 'black' }
        ]}>
          {weeklyTrial}
        </Text>
      ) : (
        <Text style={[
          styles.noTrialText, 
          { color: theme.mode === 'dark' ? 'white' : 'black' }
        ]}>
          No quest available
        </Text>
      )}
    </WeeklyTrialBox>
  );
};

const styles = StyleSheet.create({
  trialText: {
    fontSize: 14,
    marginVertical: 1,
    lineHeight: 18,
  },
  noTrialText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default WeeklyTrialSection;