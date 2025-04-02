import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface DailyQuoteProps {
  quote: string;
  author: string;
  origin?: string | null;
  theme: any;
}

const DailyQuote = ({ quote, author, origin, theme }: DailyQuoteProps) => {
  const displayText = `"${quote}"\n- ${author}${origin ? `, ${origin}` : ''}`;

  return (
    <Text style={[styles.quoteText, { color: theme.text }]}>
      {displayText}
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
