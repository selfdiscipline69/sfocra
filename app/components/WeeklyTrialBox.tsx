import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

interface WeeklyTrialBoxProps {
  children?: React.ReactNode;
  title: string;
}

const WeeklyTrialBox: React.FC<WeeklyTrialBoxProps> = ({ title, children }) => {
  return (
    <LinearGradient
      colors={["#4A4A4A", "#1E1E1E"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.boxContainer}
    >
      {/* Single unified content area with title at the top */}
      <View style={styles.unifiedContainer}>
        {/* Title */}
        <Text style={styles.title}>{title}</Text>
        
        {/* Content directly below title with consistent spacing */}
        <View style={styles.childrenContainer}>
          {children}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  boxContainer: {
    width: "100%",
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  unifiedContainer: {
    padding: 15,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 12, // Add spacing between title and content
  },
  childrenContainer: {
    marginTop: 5, // Small top margin for spacing from title
  },
});

export default WeeklyTrialBox;
