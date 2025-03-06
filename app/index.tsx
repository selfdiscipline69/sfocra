import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Pressable 
      style={styles.container} 
      onPress={() => router.replace('/signup')} // Ensure the route is correct
    >
      <ImageBackground 
        source={require('../assets/images/welcome-screen.png')} // Ensure this image exists in the correct path
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.text}>Tap to Continue</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'flex-end', // Moves text to the bottom
    alignItems: 'center',
  },
  overlay: {
    width: '100%',
    paddingBottom: 30, // Moves text slightly up from the bottom
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 14, // Smaller text size
  },
});