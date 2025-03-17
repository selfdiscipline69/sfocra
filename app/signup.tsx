import React, { useState, useRef, useEffect } from 'react';
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

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const emailShakeAnimation = useRef(new Animated.Value(0)).current;
  const passwordShakeAnimation = useRef(new Animated.Value(0)).current;

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

  // Update the handleLogin function to validate password
  const handleLogin = async () => {
    // Reset error messages
    setEmailError('');
    setPasswordError('');
    
    let hasError = false;
    
    // Validate email format
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      shakeElement(emailShakeAnimation);
      hasError = true;
    }
    
    // Validate password is not empty
    if (!password || password.trim() === '') {
      setPasswordError('Please enter a valid password');
      shakeElement(passwordShakeAnimation);
      hasError = true;
    }
    
    if (hasError) {
      return;
    }

    const token = `${email}_${password}`;
    try {
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', password);
      await AsyncStorage.setItem('userToken', token);
      router.replace('/question1');
    } catch (err) {
      console.log('Failed to save user data', err);
    }
  };

  // Clear inputs on initial load/refresh
  useEffect(() => {
    const clearInputs = async () => {
      setEmail('');
      setPassword('');
    };
    clearInputs();
  }, []); // Empty dependency array means it runs once on mount

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
              {/* Spacer to push content lower */}
              <View style={styles.spacer} />

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

              {/* Forgot Password */}
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
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
    backgroundColor: 'black', // This will show through the semi-transparent image
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
  spacer: {
    flex: 1,
  },
  inputContainer: {
    width: width - 10,  // Full screen width - 10
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
    width: width - 10,
    paddingHorizontal: 5,
    fontSize: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width - 10,
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
  forgotPassword: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 20,
    width: width - 10,
    paddingHorizontal: 5,
  },
  loginButton: {
    backgroundColor: 'red',
    width: width - 10,
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
    flexDirection: 'row',
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
    paddingHorizontal: 5,
  },
  passwordToggleIcon: {
    width: 24,
    height: 24,
    tintColor: 'white', // Optional: adds white tint to the icon for better visibility
  },
});
