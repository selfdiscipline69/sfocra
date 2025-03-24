import React from 'react';
import { Text, StyleSheet } from 'react-native';
import WeeklyTrialBox, { useBoxTextColor } from './WeeklyTrialBox';

interface WeeklyTrialSectionProps {
  weeklyTrial: string | null;
  theme: any; // Replace with proper theme type if available
  category?: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity';
}

const WeeklyTrialContent = ({ weeklyTrial }: { weeklyTrial: string | null }) => {
  // Use the text color from the box context
  const textColor = useBoxTextColor();
  
  return weeklyTrial ? (
    <Text style={[
      styles.trialText, 
      { color: textColor }
    ]}>
      {weeklyTrial}
    </Text>
  ) : (
    <Text style={[
      styles.noTrialText, 
      { color: textColor }
    ]}>
      No quest available
    </Text>
  );
};

const WeeklyTrialSection = ({ weeklyTrial, theme, category }: WeeklyTrialSectionProps) => {
  return (
    <WeeklyTrialBox title="Weekly Trial" category={category}>
      <WeeklyTrialContent weeklyTrial={weeklyTrial} />
    </WeeklyTrialBox>
  );
};

const styles = StyleSheet.create({
  trialText: {
    fontSize: 14,
    marginVertical: 1,
    lineHeight: 18,
    textAlign: 'left',
  },
  noTrialText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'left',
  },
});

export default WeeklyTrialSection;