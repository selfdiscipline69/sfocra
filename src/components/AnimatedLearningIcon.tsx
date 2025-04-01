import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

interface AnimatedLearningIconProps {
  size?: number;
}

const AnimatedLearningIcon: React.FC<AnimatedLearningIconProps> = ({ size = 24 }) => {
  const fadeAnim1 = useRef(new Animated.Value(1)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim2, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(500), // 0.5 seconds
        Animated.parallel([
          Animated.timing(fadeAnim1, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(500), // 0.5 seconds
      ]).start(() => {
        animate(); // Loop the animation
      });
    };

    animate(); // Start the animation

    return () => {
      // Cleanup animation when component unmounts
      fadeAnim1.setValue(1);
      fadeAnim2.setValue(0);
    };
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.Image
        source={require('../assets/learning-sprite-1.png')}
        style={[
          styles.sprite,
          {
            width: size,
            height: size,
            opacity: fadeAnim1,
            position: 'absolute',
          },
        ]}
        resizeMode="contain"
      />
      <Animated.Image
        source={require('../assets/learning-sprite-2.png')}
        style={[
          styles.sprite,
          {
            width: size,
            height: size,
            opacity: fadeAnim2,
            position: 'absolute',
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

export default AnimatedLearningIcon; 