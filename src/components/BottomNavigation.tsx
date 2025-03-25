import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

interface BottomNavigationProps {
  theme: any; // Replace with proper theme type if available
  onAddTaskPress: () => void;
}

const BottomNavigation = ({ theme, onAddTaskPress }: BottomNavigationProps) => {
  const router = useRouter();
  
  const handleAddTaskPress = () => {
    onAddTaskPress();
  };

  return (
    <View style={[styles.bottomNav, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <TouchableOpacity 
        onPress={() => router.push('/(tabs)/performance')}
        style={styles.navButton}
      >
        <FontAwesome5 name="chart-line" size={22} color={theme.text} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.homeButton}
        onPress={handleAddTaskPress}
      >
        <Text style={styles.homeButtonText}>Add Task</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => router.push('/(tabs)/settings')}
        style={styles.navButton}
      >
        <Ionicons name="settings-outline" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderTopWidth: 1,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  homeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default BottomNavigation;
