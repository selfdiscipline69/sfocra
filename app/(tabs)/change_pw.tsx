import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userToken, setUserToken] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load existing password
  useEffect(() => {
    const loadPassword = async () => {
      try {
        const storedPassword = await AsyncStorage.getItem('userPassword');
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedEmail = await AsyncStorage.getItem('userEmail');
        
        if (storedPassword) {
          setCurrentPassword(storedPassword);
          setNewPassword(storedPassword); // Pre-fill the field with current password
        }
        if (storedToken) setUserToken(storedToken);
        if (storedEmail) setEmail(storedEmail);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading password:', error);
        Alert.alert('Error', 'Failed to load current password.');
        setIsLoading(false);
      }
    };

    loadPassword();
  }, []);

  // Handle password save
  const handleSavePassword = async () => {
    try {
      if (!newPassword || newPassword.trim() === '') {
        Alert.alert('Error', 'Password cannot be empty');
        return;
      }

      console.log("Saving new password:", newPassword);
      
      // Clear existing password first
      await AsyncStorage.removeItem('userPassword');
      
      // Then set the new one with a small delay to ensure the change registers
      setTimeout(async () => {
        await AsyncStorage.setItem('userPassword', newPassword);
        console.log("Password saved in AsyncStorage");
        
        if (email) {
          // Update token similarly
          const oldToken = userToken;
          const newToken = `${email}_${newPassword}`;
          
          // First copy all data from old token to new token
          if (oldToken && oldToken !== newToken) {
            // Copy data from old token to new token
            for (let i = 1; i <= 4; i++) {
              const choiceData = await AsyncStorage.getItem(`question${i}Choice_${oldToken}`);
              if (choiceData) {
                await AsyncStorage.setItem(`question${i}Choice_${newToken}`, choiceData);
                // Remove the old token data
                await AsyncStorage.removeItem(`question${i}Choice_${oldToken}`);
              }
            }
            
            // Copy profile image if exists
            const profileImage = await AsyncStorage.getItem(`profileImage_${oldToken}`);
            if (profileImage) {
              await AsyncStorage.setItem(`profileImage_${newToken}`, profileImage);
              // Remove the old token data
              await AsyncStorage.removeItem(`profileImage_${oldToken}`);
            }
          }
          
          // Update token with clear + set pattern
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.setItem('userToken', newToken);
          console.log("Token updated in AsyncStorage");
        }
        
        // Success alert with back navigation
        Alert.alert(
          'Success', 
          'Password updated successfully',
          [{ 
            text: 'OK', 
            onPress: () => {
              console.log("Navigating back to settings");
              router.push('/(tabs)/settings');
            }
          }]
        );
      }, 100);
    } catch (error) {
      console.error('Error saving password:', error);
      Alert.alert('Error', 'Failed to update password.');
    }
  };

    // Back to previous page
    const CancelBack = async () => {
        try {
          router.push('/(tabs)/settings'); 
        } catch (e) {
          console.error('Error navigating back:', e);
        }
      };

  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: 'red',
            height: 100,
          },
          headerTitleStyle: {
            fontSize: 16,
            color: 'white',
          },
          headerTitle: "Change Password",
        }} 
      />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Update Your Password</Text>
            
            {isLoading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>New Password:</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={false} // For ease of use, you can change to true for production
                    placeholder="Enter new password"
                    placeholderTextColor="#999"
                  />
                </View>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSavePassword}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={CancelBack}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  inputContainer: {
    width: width - 40,
    marginBottom: 30,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 15,
    color: 'white',
    fontSize: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 40,
  },
  saveButton: {
    backgroundColor: 'red',
    borderRadius: 8,
    padding: 15,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#555',
    borderRadius: 8,
    padding: 15,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});