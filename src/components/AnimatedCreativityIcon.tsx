import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface AnimatedCreativityIconProps {
  size?: number;
}

const AnimatedCreativityIcon: React.FC<AnimatedCreativityIconProps> = ({ size = 24 }) => {
  const fadeAnim1 = useRef(new Animated.Value(1)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        // Show frame 1
        Animated.parallel([
          Animated.timing(fadeAnim1, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(fadeAnim2, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(fadeAnim3, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(fadeAnim4, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(500), // Wait 0.5 seconds

        // Show frame 2
        Animated.parallel([
          Animated.timing(fadeAnim1, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(fadeAnim2, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(fadeAnim3, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(fadeAnim4, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(500),

        // Show frame 3
        Animated.parallel([
          Animated.timing(fadeAnim1, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(fadeAnim2, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(fadeAnim3, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(fadeAnim4, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(500),

        // Show frame 4
        Animated.parallel([
          Animated.timing(fadeAnim1, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(fadeAnim2, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(fadeAnim3, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(fadeAnim4, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(500),
      ]).start(() => {
        animate(); // Loop the animation
      });
    };

    animate(); // Start the animation

    return () => {
      // Cleanup animation when component unmounts
      fadeAnim1.setValue(1);
      fadeAnim2.setValue(0);
      fadeAnim3.setValue(0);
      fadeAnim4.setValue(0);
    };
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.Image
        source={require('../assets/creativity-sprite-1.png')}
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
        source={require('../assets/creativity-sprite-2.png')}
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
      <Animated.Image
        source={require('../assets/creativity-sprite-3.png')}
        style={[
          styles.sprite,
          {
            width: size,
            height: size,
            opacity: fadeAnim3,
            position: 'absolute',
          },
        ]}
        resizeMode="contain"
      />
      <Animated.Image
        source={require('../assets/creativity-sprite-4.png')}
        style={[
          styles.sprite,
          {
            width: size,
            height: size,
            opacity: fadeAnim4,
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

export default AnimatedCreativityIcon; 