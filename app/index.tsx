import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ImageBackground, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to clear all AsyncStorage data
const clearAllUserData = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(allKeys);
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

export default function WelcomeScreen() {
  const router = useRouter();
  const [pressStartTime, setPressStartTime] = useState<number>(0);

  // Handle the start of a long press
  const handlePressStart = () => {
    setPressStartTime(Date.now());
  };

  // Handle the end of a press
  const handlePressEnd = async () => {
    const pressDuration = Date.now() - pressStartTime;
    
    // If pressed for more than 3 seconds, show reset confirmation
    if (pressDuration >= 3000) {
      Alert.alert(
        "Reset App Data",
        "This will clear ALL user data and return to initial state. This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Reset",
            style: "destructive",
            onPress: async () => {
              try {
                const success = await clearAllUserData();
                if (success) {
                  Alert.alert(
                    "Reset Complete",
                    "All data has been cleared. The app will now restart.",
                    [
                      {
                        text: "OK",
                        onPress: () => router.replace('/signup')
                      }
                    ]
                  );
                } else {
                  throw new Error('Failed to clear data');
                }
              } catch (error) {
                console.error('Error during reset:', error);
                Alert.alert("Error", "Failed to reset app data");
              }
            }
          }
        ]
      );
    } else {
      // Normal tap behavior - navigate to signup
      router.replace('/signup');
    }
  };

  return (
    <Pressable 
      style={styles.container} 
      onPressIn={handlePressStart}
      onPressOut={handlePressEnd}
      delayLongPress={3000}
    >
      <ImageBackground 
        source={require('../assets/images/welcome-screen.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.text}>
            Tap to Continue
          </Text>
          <Text style={styles.resetHint}>
            
          </Text>
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    width: '100%',
    paddingBottom: 30,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  resetHint: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontStyle: 'italic',
  }
});