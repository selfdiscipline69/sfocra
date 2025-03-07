import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';


export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

// Clear inputs on initial load/refresh
useEffect(() => {
  const clearInputs = async () => {
    setEmail('');
    setPassword('');
  };
  clearInputs();
}, []); // Empty dependency array means it runs once on mount

// Save user data to AsyncStorage
const saveUserData = async () => {
  try {
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('userPassword', password);
    return true;
  } catch (err) {
    console.log('Failed to save user data', err);
    return false;
  }
};

// Verify login credentials
const verifyLogin = async () => {
  try {
    const storedEmail = await AsyncStorage.getItem('userEmail');
    const storedPassword = await AsyncStorage.getItem('userPassword');
    
    if (email === storedEmail && password === storedPassword) {
      router.replace('/question1');
    } else {
      console.log('Invalid credentials');
      // You might want to add some user feedback here
      alert('Invalid email or password');
    }
  } catch (err) {
    console.log('Error verifying login', err);
  }
};

// Handle login button press
const handleLogin = async () => {
  // If no stored credentials exist, save them and proceed
  const storedEmail = await AsyncStorage.getItem('userEmail');
  if (!storedEmail) {
    const saved = await saveUserData();
    if (saved) {
      router.replace('/question1');
    }
  } else {
    // If credentials exist, verify them
    await verifyLogin();
  }
};

  return (
    <View style={styles.container}>
      {/* Spacer to push content lower */}
      <View style={styles.spacer} />

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="white" // 👈 Ensure placeholder is visible
      />

      {/* Password Input */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="white" // 👈 Ensure placeholder is visible
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.eyeIcon}>
          <Text style={{ color: 'white' }}>👁️</Text>
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/question1')}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      {/* Register Option (Aligned) */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Not a member?</Text>
        <TouchableOpacity onPress={() => router.replace('/register')}>
          <Text style={styles.registerNow}> Register now</Text>
        </TouchableOpacity>
      </View>

      {/* Social Login Options */}
      <Text style={styles.orContinue}>Or continue with</Text>
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Image source={require('../assets/icons/google.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Image source={require('../assets/icons/apple.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Image source={require('../assets/icons/facebook.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black', // 👈 Ensures full black background
    paddingHorizontal: 20,
  },
  spacer: {
    flex: 1, // Pushes content downward
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: 'white', // 👈 Makes entered text white
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: 'white', // 👈 Ensures password text is white
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: 'red',
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row', // Ensures text is on the same line
    alignItems: 'center',
    marginBottom: 20,
  },
  registerText: {
    color: 'gray',
    fontSize: 14,
  },
  registerNow: {
    color: 'red',
    fontSize: 14,
    fontWeight: 'bold',
  },
  orContinue: {
    color: 'gray',
    marginBottom: 15,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 20, // 👈 Added more spacing between social icons
    marginBottom: 30,
  },
  socialButton: {
    width: 60, // 👈 Made buttons slightly larger
    height: 60, // 👈 Increased size
    borderRadius: 30,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 30, // 👈 Increased icon size
    height: 30,
  },
});

/*
function useEffect(arg0: () => void, arg1: never[]) {
  throw new Error('Function not implemented.');
}
  */
