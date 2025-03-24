import React, { createContext, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

// Create a context to pass the text color down to children
export const BoxTextColorContext = createContext('#FFFFFF');

interface WeeklyTrialBoxProps {
  children?: React.ReactNode;
  title: string;
  category?: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity';
  backgroundColor?: string;
}

const WeeklyTrialBox: React.FC<WeeklyTrialBoxProps> = ({ title, children, category, backgroundColor: customBgColor }) => {
  // Use the theme context to get the current theme
  const { theme } = useTheme();
  
  // Get background color based on category or custom color
  const getBackgroundColor = () => {
    // Use custom background color if provided
    if (customBgColor) {
      return customBgColor;
    }
    // Use category color if available
    if (category && theme.categoryColors[category]) {
      return theme.categoryColors[category];
    }
    // Default background if no category
    return theme.mode === 'dark' ? '#2C2C2E' : '#F2F2F7';
  };
  
  // Determine text color based on background brightness
  // Change to white text for colored backgrounds
  const getTextColor = () => {
    // For all categories or custom colors, use white text for better visibility
    if (category || customBgColor) {
      return '#FFFFFF'; // White text for all categories regardless of theme
    }
    // For default backgrounds without category, use the theme text color
    return theme.text;
  };
  
  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();
  
  return (
    <BoxTextColorContext.Provider value={textColor}>
      <View
        style={[
          styles.boxContainer,
          { backgroundColor }
        ]}
      >
        {/* Single unified content area with title at the top */}
        <View style={styles.unifiedContainer}>
          {/* Title */}
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          
          {/* Content directly below title with consistent spacing */}
          <View style={styles.childrenContainer}>
            {/* Pass the text color down to child components through context or props */}
            {/* We'll just use the original children for now to avoid TypeScript errors */}
            {children}
          </View>
        </View>
      </View>
    </BoxTextColorContext.Provider>
  );
};

// Hook to use the box text color
export const useBoxTextColor = () => useContext(BoxTextColorContext);

const styles = StyleSheet.create({
  boxContainer: {
    width: "100%",
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)'
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
    alignItems: 'flex-start',
  },
});

export default WeeklyTrialBox;
