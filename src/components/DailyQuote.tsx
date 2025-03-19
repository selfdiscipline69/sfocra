import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface DailyQuoteProps {
  quote: string;
  theme: any; // Replace with proper theme type if available
}

const DailyQuote = ({ quote, theme }: DailyQuoteProps) => {
  return (
    <Text style={[styles.quoteText, { color: theme.text }]}>
      {quote}
    </Text>
  );
};

const styles = StyleSheet.create({
  quoteText: {
    fontSize: 14,
    marginRight: 10,
    width: 240, // Adjust based on your needs
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default DailyQuote;
