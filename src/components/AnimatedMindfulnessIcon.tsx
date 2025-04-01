import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

interface AnimatedMindfulnessIconProps {
  size?: number;
}

const AnimatedMindfulnessIcon: React.FC<AnimatedMindfulnessIconProps> = ({ size = 24 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        // Float up
        Animated.timing(floatAnim, {
          toValue: -10, // Move up by 10 pixels
          duration: 1500, // 1.5 seconds up
          useNativeDriver: true,
        }),
        // Float down
        Animated.timing(floatAnim, {
          toValue: 0, // Back to original position
          duration: 1500, // 1.5 seconds down
          useNativeDriver: true,
        })
      ]).start(() => {
        animate(); // Loop the animation
      });
    };

    animate(); // Start the animation

    return () => {
      // Cleanup animation when component unmounts
      floatAnim.setValue(0);
    };
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.Image
        source={require('../assets/mindfulness-sprite.png')}
        style={[
          styles.sprite,
          {
            width: size,
            height: size,
            transform: [
              { translateY: floatAnim }
            ]
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sprite: {
    width: '100%',
    height: '100%',
  },
});

export default AnimatedMindfulnessIcon; 