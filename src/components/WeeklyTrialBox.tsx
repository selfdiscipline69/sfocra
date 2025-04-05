import React, { createContext, useContext, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { useTheme } from "../context/ThemeContext";
import PixelArtIcon from "./PixelArtIcon";
import AnimatedSpriteIcon from "./AnimatedSpriteIcon";
import AnimatedLearningIcon from "./AnimatedLearningIcon";
import AnimatedMindfulnessIcon from "./AnimatedMindfulnessIcon";
import AnimatedSocialIcon from "./AnimatedSocialIcon";
import AnimatedCreativityIcon from "./AnimatedCreativityIcon";

// Create a context to pass the text color down to children
export const BoxTextColorContext = createContext('#FFFFFF');

interface WeeklyTrialBoxProps {
  children?: React.ReactNode;
  title: string;
  category?: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity';
  backgroundColor?: string;
  onPress?: () => void;
}

const WeeklyTrialBox: React.FC<WeeklyTrialBoxProps> = ({ 
  title, 
  children, 
  category, 
  backgroundColor: customBgColor,
  onPress 
}) => {
  // Use the theme context to get the current theme
  const { theme } = useTheme();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const hoverAnim = useRef(new Animated.Value(1)).current;
  
  // Initial scale animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  // Get background color based on category or custom color
  const getBackgroundColor = () => {
    // Special case for Weekly Trial/Challenge - always white in dark mode and light gray in light mode
    if (title === "Weekly Trial" || title === "Weekly Challenge") {
      return theme.mode === 'dark' ? '#FFFFFF' : '#F2F2F7';
    }
    
    // For other components, use the original logic
    // Use custom background color if provided
    if (customBgColor) {
      return customBgColor;
    }
    
    // Normalize category to lowercase for consistent comparison
    const normalizedCategory = category?.toLowerCase() as keyof typeof theme.categoryColors;
    
    // Use category color if available
    if (normalizedCategory && theme.categoryColors[normalizedCategory]) {
      return theme.categoryColors[normalizedCategory];
    }
    
    // Default background if no category
    return theme.mode === 'dark' ? '#2C2C2E' : '#F2F2F7';
  };
  
  // Determine text color based on background brightness
  const getTextColor = () => {
    // Special case for Weekly Trial/Challenge - always black text
    if (title === "Weekly Trial" || title === "Weekly Challenge") {
      return '#000000';
    }
    
    // For other components, use the original logic
    // For all categories or custom colors, use white text for better visibility
    if (category || customBgColor) {
      return '#FFFFFF'; // White text for all categories regardless of theme
    }
    // For default backgrounds without category, use the theme text color
    return theme.text;
  };
  
  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();
  
  // Handle press animations
  const handlePressIn = () => {
    Animated.spring(hoverAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(hoverAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };
  
  return (
    <BoxTextColorContext.Provider value={textColor}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={({ pressed }: { pressed: boolean }) => [
          styles.pressableContainer,
          pressed && styles.pressedContainer
        ]}
      >
        <Animated.View
          style={[
            styles.boxContainer,
            { 
              backgroundColor,
              // Use a darker border for Weekly Trial/Challenge in dark mode
              borderColor: (title === "Weekly Trial" || title === "Weekly Challenge") && theme.mode === 'dark' 
                ? 'rgba(0, 0, 0, 0.2)' 
                : 'rgba(0, 0, 0, 0.1)',
              transform: [
                { scale: Animated.multiply(scaleAnim, hoverAnim) }
              ]
            }
          ]}
        >
          {/* Single unified content area with title at the top */}
          <View style={styles.unifiedContainer}>
            {/* Title with sprite for fitness, learning, mindfulness, social, or creativity */}
            <View style={styles.titleContainer}>
              <View style={styles.leftContainer}>
                {category && 
                 !['fitness', 'learning', 'mindfulness', 'social', 'creativity'].includes(category.toLowerCase()) && 
                 title !== "Weekly Challenge" && (
                  <PixelArtIcon 
                    category={category} 
                    size={24} 
                    color={textColor}
                  />
                )}
                <Text style={[styles.title, { color: textColor, marginLeft: category && !['fitness', 'learning', 'mindfulness', 'social', 'creativity'].includes(category.toLowerCase()) && title !== "Weekly Challenge" ? 8 : 0 }]}>{title}</Text>
              </View>
              {category?.toLowerCase() === 'fitness' && title !== "Weekly Challenge" && (
                <View style={styles.spriteContainer}>
                  <AnimatedSpriteIcon size={80} />
                </View>
              )}
              {category?.toLowerCase() === 'learning' && title !== "Weekly Challenge" && (
                <View style={styles.spriteContainer}>
                  <AnimatedLearningIcon size={75} />
                </View>
              )}
              {category?.toLowerCase() === 'mindfulness' && title !== "Weekly Challenge" && (
                <View style={styles.spriteContainer}>
                  <AnimatedMindfulnessIcon size={80} />
                </View>
              )}
              {category?.toLowerCase() === 'social' && title !== "Weekly Challenge" && (
                <View style={styles.spriteContainer}>
                  <AnimatedSocialIcon size={75} />
                </View>
              )}
              {category?.toLowerCase() === 'creativity' && title !== "Weekly Challenge" && (
                <View style={styles.spriteContainer}>
                  <AnimatedCreativityIcon size={75} />
                </View>
              )}
            </View>
            
            {/* Content */}
            <View style={styles.childrenContainer}>
              {children}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </BoxTextColorContext.Provider>
  );
};

// Hook to use the box text color
export const useBoxTextColor = () => useContext(BoxTextColorContext);

const styles = StyleSheet.create({
  pressableContainer: {
    width: '100%',
  },
  pressedContainer: {
    opacity: 0.9,
  },
  boxContainer: {
    width: "100%",
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
  },
  unifiedContainer: {
    padding: 10,
    paddingRight: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
    justifyContent: 'space-between',
    minHeight: 65,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  spriteContainer: {
    marginLeft: 'auto',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    marginTop: -2,
  },
  childrenContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
});

export default WeeklyTrialBox;
