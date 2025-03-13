import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from "../context/ThemeContext";

interface WeeklyTrialBoxProps {
  title: string;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
}

const WeeklyTrialBox: React.FC<WeeklyTrialBoxProps> = ({ title, children, rightElement }) => {
  const { theme } = useTheme();
  
  return (
    <LinearGradient
      colors={['#333', '#222']}
      style={styles.container}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {rightElement}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    width: '100%',
  },
});

export default WeeklyTrialBox;
