import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';

interface LoadingErrorStatesProps {
  isLoading: boolean;
  error: boolean;
  theme: any;
  onRetry: () => void;
}

const LoadingErrorStates = ({ isLoading, error, theme, onRetry }: LoadingErrorStatesProps) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.text, { color: theme.text }]}>Loading dashboard data...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: theme.text }]}>Failed to load dashboard data.</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.accent }]}
          onPress={onRetry}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // If neither loading nor error, return null
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LoadingErrorStates;
