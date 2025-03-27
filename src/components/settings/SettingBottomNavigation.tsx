import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BottomNavigationProps {
  theme: any;
  activeScreen: 'performance' | 'homepage' | 'settings';
}

const BottomNavigation = ({ theme, activeScreen }: BottomNavigationProps) => {
  const router = useRouter();
  
  return (
    <View style={[styles.bottomNav, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <TouchableOpacity 
        onPress={() => router.push({
          pathname: '/(tabs)/performance'
        })}
        style={[
          styles.navButton,
          activeScreen === 'performance' && styles.activeNavButton
        ]}
      >
        <FontAwesome5 name="chart-line" size={22} color={theme.text} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.homeButton} 
        onPress={() => router.push({
          pathname: '/(tabs)/homepage'
        })}
      >
        <Text style={styles.homeButtonText}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => router.push({
          pathname: '/(tabs)/settings'
        })}
        style={[
          styles.navButton,
          activeScreen === 'settings' && styles.activeNavButton
        ]}
      >
        <Ionicons name="settings" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
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
  activeNavButton: {
    opacity: 0.9,
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
