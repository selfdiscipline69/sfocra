import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserInfoScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [nameError, setNameError] = useState('');

  // Add this useEffect to log when the component mounts
  useEffect(() => {
    console.log("User Info screen mounted");
  }, []);

  const handleContinue = async () => {
    // Basic validation
    if (!fullName.trim()) {
      setNameError('Please enter your name');
      return;
    }
    
    try {
      // Save user info to AsyncStorage
      await AsyncStorage.setItem('userFullName', fullName);
      
      // Only save username if provided, otherwise use a default based on the name
      const usernameToSave = username.trim() ? 
        username : 
        `@${fullName.toLowerCase().replace(/\s+/g, '')}`;
      
      await AsyncStorage.setItem('userUsername', usernameToSave);
      
      // Continue to homepage
      console.log("Navigating to homepage");
      router.replace('/question1');
    } catch (error) {
      console.error('Failed to save user info:', error);
    }
  };

  const handleBack = () => {
    // Go back to User Classification
    console.log("Going back to User_Classification");
    router.push('/User_Classification');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.headerText}>One Last Step</Text>
          <Text style={styles.subText}>Tell us who you are, hero</Text>
          
          <View style={styles.inputSection}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                setNameError('');
              }}
              placeholder="Enter your full name"
              placeholderTextColor="#666"
              autoCapitalize="words"
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            
            <Text style={styles.label}>Username (optional)</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Create a username"
              placeholderTextColor="#666"
              autoCapitalize="none"
            />
            <Text style={styles.hintText}>
              This will be displayed as @{username || (fullName ? fullName.toLowerCase().replace(/\s+/g, '') : 'username')}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  headerText: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 40,
  },
  inputSection: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    color: 'white',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
    width: '100%',
  },
  errorText: {
    color: 'red',
    marginTop: -10,
    marginBottom: 15,
  },
  hintText: {
    color: '#888',
    fontSize: 14,
    marginTop: -10,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  continueButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  continueText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
});
