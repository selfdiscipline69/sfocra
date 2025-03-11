import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';

export default function PerformanceScreen() {
  const router = useRouter();
  
  // Add back button handler
  const handleBack = () => {
    router.push('/(tabs)/homepage');
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: 'black',
            height: 100,
          },
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
          },
          headerTitle: "Performance",
          // Updated back button to match settings.tsx
          headerRight: () => (
            <TouchableOpacity
              style={styles.topRightBackButton}
              onPress={handleBack}
            >
              <Text style={styles.topRightBackText}>Back</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.container}>
        <Text style={styles.text}>Performance Page - Graphs & Analytics</Text>
        
        {/* Bottom Navigation Icons */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/performance')}>
            <Text style={styles.icon}>📈</Text>
          </TouchableOpacity>
          
          {/* Home button with text instead of emoji */}
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => router.push('/(tabs)/homepage')}
          >
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/settings')}
            accessibilityLabel="Settings"
          >
            <Text style={styles.icon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
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
    borderColor: 'gray',
    backgroundColor: 'black',
  },
  icon: {
    fontSize: 24,
    color: 'white',
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
  // Updated styles to match settings.tsx
  topRightBackButton: {
    backgroundColor: 'transparent',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  topRightBackText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export const unstable_settings = {
  // This ensures the tab bar is displayed correctly
  bottomTabs: {
    tabBarStyle: { display: 'flex' },
  },
};