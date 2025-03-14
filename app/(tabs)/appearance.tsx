import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeContext } from '../context/ThemeContext';

export default function AppearanceScreen() {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  // Simplified direct toggle handlers
  const handleToggleDark = () => toggleTheme(true);
  const handleToggleLight = () => toggleTheme(false);

  // Back button handler
  const handleBack = () => {
    router.push('/(tabs)/settings');
  };
  
  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTitleStyle: {
            fontSize: 20,
            color: theme.text,
          },
          headerTitle: "Appearance",
          headerRight: () => (
            <TouchableOpacity
              style={styles.topRightBackButton}
              onPress={handleBack}
            >
              <Text style={[styles.topRightBackText, { color: theme.text }]}>Back</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerText, { color: theme.text }]}>Theme Mode</Text>
        
        <View style={[styles.optionsContainer, { backgroundColor: theme.boxBackground }]}>
          {/* Dark mode option - Full width touchable */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              isDarkMode ? styles.selectedOptionDark : null,
              { borderBottomColor: theme.border }
            ]}
            onPress={handleToggleDark}
            activeOpacity={0.6}
          >
            <View style={styles.optionContent}>
              <Ionicons name="moon" size={24} color={isDarkMode ? theme.text : "#888"} />
              <Text style={[
                styles.optionText, 
                { color: isDarkMode ? theme.text : "#888" }
              ]}>Dark Mode</Text>
              {isDarkMode && <Ionicons name="checkmark-circle" size={22} color={theme.accent} />}
            </View>
          </TouchableOpacity>
          
          {/* Light mode option - Full width touchable */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              !isDarkMode ? styles.selectedOptionLight : null,
              { borderBottomColor: theme.border }
            ]}
            onPress={handleToggleLight}
            activeOpacity={0.6}
          >
            <View style={styles.optionContent}>
              <Ionicons name="sunny" size={24} color={!isDarkMode ? theme.text : "#888"} />
              <Text style={[
                styles.optionText, 
                { color: !isDarkMode ? theme.text : "#888" }
              ]}>Light Mode</Text>
              {!isDarkMode && <Ionicons name="checkmark-circle" size={22} color={theme.accent} />}
            </View>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.noteText, { color: theme.subtext }]}>
          Note: Dark Mode is recommended for the best experience with our app.
        </Text>
      </View>
      
      {/* Bottom Navigation Icons */}
      <View style={[styles.bottomNav, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/performance')}
          style={styles.navButton}
        >
          <FontAwesome5 name="chart-line" size={22} color={theme.text} />
        </TouchableOpacity>
        
        {/* Home button */}
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => router.push('/(tabs)/homepage')}
        >
          <Text style={styles.homeButtonText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/settings')}
          style={styles.navButton}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionButton: {
    padding: 0, // Remove padding from button itself
    borderBottomWidth: 1,
    width: '100%', // Ensure button takes full width
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    height: 70, // Explicitly set height for better touch target
  },
  selectedOptionDark: {
    backgroundColor: '#2C2C2E',
  },
  selectedOptionLight: {
    backgroundColor: '#e6e6e6',
  },
  optionText: {
    fontSize: 18,
    marginLeft: 16,
    flex: 1,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
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
  topRightBackButton: {
    backgroundColor: 'transparent',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  topRightBackText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export const unstable_settings = {
  bottomTabs: {
    tabBarStyle: { display: 'flex' },
  },
};
