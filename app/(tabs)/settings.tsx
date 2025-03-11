import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image,
  Alert,
  Dimensions
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userToken, setUserToken] = useState('');
  const [userChoices, setUserChoices] = useState({
    question1: null,
    question2: null,
    question3: null,
    question4: null,
  });
  const [profileImage, setProfileImage] = useState(null);

  useFocusEffect(
    useCallback(() => {
      console.log("Settings screen focused"); // Debug log
      loadUserData();
      
      return () => {
        console.log("Settings screen blurred"); // Debug log
      };
    }, []) // Empty dependency array means it only depends on focus/blur events
  );

  // Function to load all user data from AsyncStorage
  const loadUserData = async () => {
    try {
      console.log("Loading user data in settings..."); // Debug log
      
      // Load user auth info - IMPORTANT: load token AFTER email and password
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedPassword = await AsyncStorage.getItem('userPassword');
      
      // Debug logs to trace the issue
      console.log("Retrieved password from storage:", storedPassword);
      
      // Always get a fresh token since it might have changed
      const userToken = await AsyncStorage.getItem('userToken');
      console.log("Retrieved token from storage:", userToken);
      
      // Update state with the latest values
      if (storedEmail !== null) setEmail(storedEmail);
      if (storedPassword !== null) setPassword(storedPassword);
      setUserToken(userToken); // Store the token in state
      
      // Initialize an object to store choices
      const choices = {
        question1: null,
        question2: null,
        question3: null,
        question4: null,
      };
      
      // Try to load choices with both key patterns
      for (let i = 1; i <= 4; i++) {
        // First try with token-specific key
        if (userToken) {
          const choiceWithToken = await AsyncStorage.getItem(`question${i}Choice_${userToken}`);
          if (choiceWithToken !== null) {
            choices[`question${i}`] = choiceWithToken;
            continue; // Skip to next question if found
          }
        }
        
        // Fall back to non-token-specific key if token-specific not found
        const choiceWithoutToken = await AsyncStorage.getItem(`question${i}Choice`);
        if (choiceWithoutToken !== null) {
          choices[`question${i}`] = choiceWithoutToken;
        }
      }
      
      // Load profile image if exists
      if (userToken) {
        const storedImage = await AsyncStorage.getItem(`profileImage_${userToken}`);
        if (storedImage !== null) setProfileImage(storedImage);
      }
      
      // Update state with all found choices
      setUserChoices(choices);
      
      console.log("Settings - Loaded choices:", choices); // Debug log to verify what was loaded
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Function to handle image picking
  const handleImagePick = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Get the selected image URI
        const selectedImageUri = result.assets[0].uri;
        
        // Save to state
        setProfileImage(selectedImageUri);
        
        // Save to AsyncStorage with user's token
        if (userToken) {
          await AsyncStorage.setItem(`profileImage_${userToken}`, selectedImageUri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  // Back to previous page
  const handleBack = async () => {
    try {
      router.push('/(tabs)/homepage'); 
    } catch (e) {
      console.error('Error navigating back:', e);
    }
  };

  // Handle logout - redirect to the starting page
  const handleLogout = () => {
      if (1) {
        try {
          router.replace('/');
        } catch (e) {
          console.error('Error saving before navigation:', e);
        }
      }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    // Show confirmation dialog
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              if (userToken) {
                // Remove all data associated with this token
                await AsyncStorage.removeItem('userEmail');
                await AsyncStorage.removeItem('userPassword');
                await AsyncStorage.removeItem('userToken');
                
                // Remove profile image
                await AsyncStorage.removeItem(`profileImage_${userToken}`);
                
                // Remove all question choices
                for (let i = 1; i <= 4; i++) {
                  await AsyncStorage.removeItem(`question${i}Choice_${userToken}`);
                }
                
                console.log("Account deleted successfully");
                
                // Navigate back to starting page
                router.replace('/');
              } else {
                Alert.alert("Error", "Could not delete account. User token not found.");
              }
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <>
      {/* Add the same header as homepage */}
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: 'black',
            height: 70,
          },
          headerTitleStyle: {
            fontSize: 16,
            color: 'white',
          },
          headerTitle: "",
        }} 
      />
      
      <View style={styles.container}>
        {/* User choices in upper left corner with title */}
        <View style={styles.userChoicesContainer}>
          <Text style={styles.destinyTitle}>Your Destiny</Text>
          <View style={styles.choicesBox}>
            {Object.entries(userChoices).some(([, choice]) => choice) ? (
              Object.entries(userChoices).map(([question, choice]) => (
                choice && (
                  <Text key={question} style={styles.choiceText}>
                    {`Q${question.replace('question', '')}: ${choice}`}
                  </Text>
                )
              ))
            ) : (
              <Text style={styles.noChoiceText}>No choices made yet</Text>
            )}
          </View>
        </View>
        
        {/* Profile picture in upper right corner */}
        <TouchableOpacity 
          style={styles.profileImageContainer} 
          onPress={handleImagePick}
        >
          <Image 
            source={profileImage ? { uri: profileImage } : require('../../assets/images/empty-icon.png')} 
            style={styles.profileImage} 
          />
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
        
        {/* User info in the middle */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.settingsTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Password:</Text>
            <Text style={styles.infoValue}>{password}</Text>
          </View>
        </View>
        
        {/* Additional settings options could go here */}
        <ScrollView style={styles.settingsOptionsContainer}>
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => router.push('/(tabs)/change_pw')}
          >
            <Text style={styles.optionText}>Change Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>Notification Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteAccountText}>Delete My Account</Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
    paddingTop: 60,
  },
  userChoicesContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    maxWidth: width * 0.7,
    zIndex: 1,
  },
  destinyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  choicesBox: {
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    borderRadius: 10,
    padding: 7,
    borderWidth: 1,
    borderColor: '#444',
  },
  choiceText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  noChoiceText: {
    color: '#aaa',
    fontSize: 12,
    fontStyle: 'italic',
  },
  profileImageContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
  },
  changePhotoText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 140,
    width: '100%',
  },
  settingsTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: 'gray',
    fontSize: 16,
  },
  infoValue: {
    color: 'white',
    fontSize: 16,
  },
  settingsOptionsContainer: {
    marginTop: 20,
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#870000',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteAccountButton: {
    backgroundColor: '#600000', // Darker red than logout
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  deleteAccountText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: 'gray',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 16,
  }
});