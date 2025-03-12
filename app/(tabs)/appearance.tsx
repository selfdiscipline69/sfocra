import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeContext, themes } from '../context/ThemeContext';

export default function AppearanceScreen() {
  const router = useRouter();
  const themeContext = React.useContext(ThemeContext);
  const { theme, isDarkMode, toggleTheme } = themeContext;
  
  // Enhanced theme toggle handlers with debugging
  const handleToggleDark = () => {
    console.log("Dark mode button pressed");
    try {
      toggleTheme(true);
      console.log("Theme should now be dark");
      // Optional: Show confirmation
      Alert.alert("Theme Changed", "Dark theme applied");
    } catch (error) {
      console.error("Error toggling to dark mode:", error);
    }
  };

  const handleToggleLight = () => {
    console.log("Light mode button pressed");
    try {
      toggleTheme(false);
      console.log("Theme should now be light");
      // Optional: Show confirmation
      Alert.alert("Theme Changed", "Light theme applied");
    } catch (error) {
      console.error("Error toggling to light mode:", error);
    }
  };

  // Back button handler
  const handleBack = () => {
    router.push('/(tabs)/settings');
  };

  // Log current theme for debugging
  console.log('Current theme in appearance screen:', theme.mode);
  
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
        {/* Theme indicator for debugging */}
        <View style={styles.themeIndicator}>
          <Text style={[styles.themeIndicatorText, { color: theme.text }]}>
            Current UI Theme: {theme.mode}
          </Text>
        </View>
        
        <Text style={[styles.headerText, { color: theme.text }]}>Theme Mode</Text>
        
        <View style={[styles.optionsContainer, { backgroundColor: theme.boxBackground }]}>
          {/* Dark mode option - using TouchableOpacity with improved touch feedback */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              isDarkMode && styles.selectedOptionDark,
              { borderBottomColor: theme.border }
            ]}
            onPress={handleToggleDark}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="moon" size={24} color={isDarkMode ? theme.text : "#888"} />
            <Text style={[
              styles.optionText, 
              { color: isDarkMode ? theme.text : "#888" }
            ]}>Dark Mode</Text>
            {isDarkMode && <Ionicons name="checkmark-circle" size={22} color={theme.accent} />}
          </TouchableOpacity>
          
          {/* Light mode option with improved touch feedback */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              !isDarkMode && styles.selectedOptionLight,
              { borderBottomColor: theme.border }
            ]}
            onPress={handleToggleLight}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="sunny" size={24} color={!isDarkMode ? theme.text : "#888"} />
            <Text style={[
              styles.optionText, 
              { color: !isDarkMode ? theme.text : "#888" }
            ]}>Light Mode</Text>
            {!isDarkMode && <Ionicons name="checkmark-circle" size={22} color={theme.accent} />}
          </TouchableOpacity>
        </View>
        
        {/* Debug info to see current theme state */}
        <View style={[styles.debugContainer, { backgroundColor: theme.mode === 'dark' ? '#222' : '#eee' }]}>
          <Text style={[styles.debugText, { color: theme.text }]}>
            Current Theme: {isDarkMode ? 'Dark' : 'Light'}
          </Text>
          <TouchableOpacity 
            style={[styles.refreshButton, {backgroundColor: theme.accent}]}
            onPress={() => {
              Alert.alert("Theme Status", `Current theme: ${isDarkMode ? 'Dark' : 'Light'}`);
              // Force refresh of theme context
              if (isDarkMode) {
                toggleTheme(true);
              } else {
                toggleTheme(false);
              }
            }}
          >
            <Text style={styles.refreshButtonText}>Refresh Theme</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.noteText, { color: theme.subtext }]}>
          Note: Dark Mode is recommended for the best experience with our app.
        </Text>
        
        {/* Theme Samples to demonstrate the current theme */}
        <View style={styles.themeSamples}>
          <Text style={[styles.sampleTitle, { color: theme.text }]}>Theme Samples:</Text>
          
          <View style={[styles.sampleBox, { backgroundColor: theme.boxBackground, borderColor: theme.border }]}>
            <Text style={[styles.sampleText, { color: theme.text }]}>Primary Text</Text>
            <Text style={[styles.sampleText, { color: theme.subtext }]}>Secondary Text</Text>
            <View style={[styles.sampleButton, { backgroundColor: theme.accent }]}>
              <Text style={styles.sampleButtonText}>Button</Text>
            </View>
          </View>
        </View>
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
  themeIndicator: {
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  themeIndicatorText: {
    fontSize: 14,
    fontWeight: '500',
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    height: 70, // Explicitly set height for better touch target
    zIndex: 1, // Ensure buttons are clickable
  },
  selectedOptionDark: {
    backgroundColor: '#2C2C2E',
  },
  selectedOptionLight: {
    backgroundColor: '#e6e6e6',
  },
  pressedOption: {
    opacity: 0.7,
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
  debugContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 5,
  },
  debugText: {
    fontSize: 14,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Theme samples styling
  themeSamples: {
    marginTop: 20,
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sampleBox: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  sampleText: {
    marginBottom: 8,
    fontSize: 14,
  },
  sampleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  sampleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export const unstable_settings = {
  // This ensures the tab bar is displayed correctly
  bottomTabs: {
    tabBarStyle: { display: 'flex' },
  },
};
