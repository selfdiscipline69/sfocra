import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import WeeklyTrialBox, { useBoxTextColor } from './WeeklyTrialBox';

interface WeeklyTrialSectionProps {
  weeklyTrial: {
    title: string;
    description: string;
    weeklyTrialSummary: string;
  } | null;
  theme: any; // Replace with proper theme type if available
  category?: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity';
}

const WeeklyTrialContent = ({ weeklyTrial }: { weeklyTrial: WeeklyTrialSectionProps['weeklyTrial'] }) => {
  // Use the text color from the box context
  const textColor = useBoxTextColor();
  
  return weeklyTrial ? (
    <View>
      <Text style={[styles.trialDescription, { color: textColor, opacity: 0.8 }]}>
        {weeklyTrial.description}
      </Text>
      <Text style={[styles.trialFocus, { color: textColor, fontWeight: 'bold', marginTop: 8 }]}>
        This Week's Focus:
      </Text>
      <Text style={[styles.trialText, { color: textColor }]}>
        {weeklyTrial.weeklyTrialSummary}
      </Text>
    </View>
  ) : (
    <Text style={[styles.noTrialText, { color: textColor }]}>
      No quest available
    </Text>
  );
};

const WeeklyTrialSection = ({ weeklyTrial, theme, category }: WeeklyTrialSectionProps) => {
  return (
    <WeeklyTrialBox title="Weekly Challenge" category={category}>
      <WeeklyTrialContent weeklyTrial={weeklyTrial} />
    </WeeklyTrialBox>
  );
};

const styles = StyleSheet.create({
  trialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'left',
  },
  trialDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
    textAlign: 'left',
  },
  trialFocus: {
    fontSize: 14,
    marginVertical: 2,
    textAlign: 'left',
  },
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