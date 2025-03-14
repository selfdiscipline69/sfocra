import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from "../context/ThemeContext";

interface WeeklyTrialBoxProps {
  children?: React.ReactNode;
  title: string;
}

const WeeklyTrialBox: React.FC<WeeklyTrialBoxProps> = ({ title, children }) => {
  // Use the theme context to get the current theme
  const { theme } = useTheme();
  
  return (
    <LinearGradient
      colors={theme.gradientColors as string[]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.boxContainer}
    >
      {/* Single unified content area with title at the top */}
      <View style={styles.unifiedContainer}>
        {/* Title */}
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        
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
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 12,
  },
  childrenContainer: {
    marginTop: 5,
  },
});

export default WeeklyTrialBox;
