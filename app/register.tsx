import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Image, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  
  const emailShakeAnimation = useRef(new Animated.Value(0)).current;
  const passwordShakeAnimation = useRef(new Animated.Value(0)).current;
  const confirmPasswordShakeAnimation = useRef(new Animated.Value(0)).current;

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const shakeElement = (animation) => {
    Animated.sequence([
      Animated.timing(animation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(animation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(animation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(animation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleRegister = async () => {
    // Reset error messages
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    let hasError = false;
    
    // Validate email format
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      shakeElement(emailShakeAnimation);
      hasError = true;
    }
    
    // Validate password is not empty and at least 6 characters
    if (!password || password.trim() === '' || password.length < 1) {
      setPasswordError('Password must be at least 1 characters');
      shakeElement(passwordShakeAnimation);
      hasError = true;
    }
    
    // Validate confirm password matches
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      shakeElement(confirmPasswordShakeAnimation);
      hasError = true;
    }
    
    if (hasError) {
      return;
    }

    // Check if user already exists
    try {
      const existingEmail = await AsyncStorage.getItem('userEmail');
      
      if (existingEmail === email) {
        setEmailError('This email is already registered');
        shakeElement(emailShakeAnimation);
        return;
      }
      
      // Save user registration data
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', password);
      const token = `${email}_${password}`;
      await AsyncStorage.setItem('userToken', token);
      
      // Clear any existing data for this new token
      await AsyncStorage.removeItem(`question1Choice_${token}`);
      await AsyncStorage.removeItem(`question1Code_${token}`);
      
      // Also remove non-token-specific choices to prevent confusion
      await AsyncStorage.removeItem('question1Choice');
      await AsyncStorage.removeItem('question1Code');
      
      console.log('User registered successfully with token:', token);
      
      // Navigate to the user_info page to complete profile
      router.push('/user_info');
    } catch (err) {
      console.error('Failed to register user', err);
    }
  };

  return (
    <View style={styles.backgroundContainer}>
      <ImageBackground 
        source={require('../assets/images/welcome-screen.png')}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.5 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Title */}
              <Text style={styles.title}>Create Account</Text>
              
              {/* Email Input */}
              <Animated.View style={[styles.inputContainer, { transform: [{ translateX: emailShakeAnimation }] }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#aaa"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Animated.View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              {/* Password Input */}
              <Animated.View 
                style={[styles.passwordContainer, { transform: [{ translateX: passwordShakeAnimation }] }]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="white"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                  secureTextEntry={secureTextEntry}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                >
                  <Image 
                    source={secureTextEntry 
                      ? require('../assets/icons/Pw_show.png') 
                      : require('../assets/icons/Pw_hide.png')
                    } 
                    style={styles.passwordToggleIcon} 
                  />
                </TouchableOpacity>
              </Animated.View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

              {/* Confirm Password Input */}
              <Animated.View 
                style={[styles.passwordContainer, { transform: [{ translateX: confirmPasswordShakeAnimation }] }]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password"
                  placeholderTextColor="white"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError('');
                  }}
                  secureTextEntry={secureConfirmTextEntry}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
                >
                  <Image 
                    source={secureConfirmTextEntry 
                      ? require('../assets/icons/Pw_show.png') 
                      : require('../assets/icons/Pw_hide.png')
                    } 
                    style={styles.passwordToggleIcon} 
                  />
                </TouchableOpacity>
              </Animated.View>
              {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

              {/* Register Button */}
              <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerText}>Register</Text>
              </TouchableOpacity>

              {/* Login Option */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.replace('/signup')}>
                  <Text style={styles.loginNow}> Login now</Text>
                </TouchableOpacity>
              </View>

              {/* Social Register Options */}
              <Text style={styles.orContinue}>Or register with</Text>
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
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputContainer: {
    width: width - 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
  },
  input: {
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: 'white',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    width: width - 40,
    paddingHorizontal: 5,
    fontSize: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width - 40,
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
    color: 'white',
  },
  eyeIcon: {
    padding: 10,
  },
  registerButton: {
    backgroundColor: 'red',
    width: width - 40,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  registerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: 'gray',
    fontSize: 14,
  },
  loginNow: {
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
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  passwordToggleIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
});