import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Check the saved theme preference on app load
  useEffect(() => {
    async function checkThemePreference() {
      try {
        const savedTheme = await AsyncStorage.getItem('themePreference');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    }
    
    checkThemePreference();
  }, []);
  
  return (
    <ThemeProvider>
      {/* Set StatusBar to match theme */}
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Welcome Screen (Full-Screen, No Tabs) */}
        <Stack.Screen name="index" />

        {/* Onboarding Screens */}
        <Stack.Screen name="signup" />
        <Stack.Screen name="question1" />
        <Stack.Screen name="question2" />
        <Stack.Screen name="question3" />
        <Stack.Screen name="question4" />
        <Stack.Screen name="user_info" />

        {/* Main App with Tabs (Only After Onboarding) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}