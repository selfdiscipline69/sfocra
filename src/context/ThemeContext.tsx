import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme colors and styling with more distinct differences
export const themes = {
  dark: {
    mode: 'dark',
    background: '#000000',
    text: '#FFFFFF',
    subtext: '#BBBBBB',
    card: '#222222',
    cardHeader: '#333333',
    accent: '#FF3B30',
    border: '#444444',
    boxBackground: '#1C1C1E',
    selectedBackground: '#2C2C2E',
    gradientColors: ["#4A4A4A", "#1E1E1E"],
    categoryColors: {
      fitness: '#D13030', // darker red for white text
      learning: '#30A030', // darker green for white text
      mindfulness: '#2080D1', // darker blue for white text
      social: '#D1A020', // darker yellow for white text
      creativity: '#8030D1', // darker purple for white text
    }
  },
  light: {
    mode: 'light',
    background: '#FFFFFF',
    text: '#000000',
    subtext: '#555555',
    card: '#F5F5F5',
    cardHeader: '#E0E0E0',
    accent: '#FF3B30',
    border: '#D1D1D6',
    boxBackground: '#F2F2F7',
    selectedBackground: '#E5E5EA',
    gradientColors: ["#E0E0E0", "#FFFFFF"],
    categoryColors: {
      fitness: '#CC3333', // darker red for white text
      learning: '#33A033', // darker green for white text
      mindfulness: '#3399CC', // darker blue for white text
      social: '#CC9933', // darker yellow for white text
      creativity: '#9933CC', // darker purple for white text
    }
  }
};

// Context type definition
type ThemeContextType = {
  theme: typeof themes.dark;
  isDarkMode: boolean;
  toggleTheme: (isDark: boolean) => void;
};

// Create the context with default values
export const ThemeContext = createContext<ThemeContextType>({
  theme: themes.dark,
  isDarkMode: true,
  toggleTheme: () => {},
});

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme provider component
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [theme, setTheme] = useState(themes.dark);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference when component mounts
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themePreference');
        
        if (savedTheme !== null) {
          const isDark = savedTheme === 'dark';
          setIsDarkMode(isDark);
          setTheme(isDark ? themes.dark : themes.light);
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadTheme();
  }, []);

  // Simplified toggle function
  const toggleTheme = async (isDark: boolean) => {
    // Set state first for immediate UI update
    setIsDarkMode(isDark);
    setTheme(isDark ? themes.dark : themes.light);
    
    // Then save to storage (don't wait for this to complete)
    AsyncStorage.setItem('themePreference', isDark ? 'dark' : 'light')
      .catch(error => console.error('Failed to save theme preference:', error));
  };

  // Show a placeholder while theme is loading
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
