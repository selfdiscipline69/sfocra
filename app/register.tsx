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
import { supabase } from '../src/lib/supabase';

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
  const [isRegistering, setIsRegistering] = useState(false);
  
  const emailShakeAnimation = useRef(new Animated.Value(0)).current;
  const passwordShakeAnimation = useRef(new Animated.Value(0)).current;
  const confirmPasswordShakeAnimation = useRef(new Animated.Value(0)).current;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const shakeElement = (animation: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(animation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(animation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(animation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleRegister = async () => {
    // Prevent multiple submissions
    if (isRegistering) return;
    
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
    if (!password || password.trim() === '' || password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
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

    try {
      setIsRegistering(true); // Disable button
      
      // Sign up with Supabase and trigger email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'myapp://login',
          data: {
            name: email.split('@')[0] // Basic name based on email
          }
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          setEmailError('This email is already registered');
          shakeElement(emailShakeAnimation);
        } else {
          setEmailError('Registration failed. Please try again.');
          shakeElement(emailShakeAnimation);
        }
        console.error('Signup error:', error.message);
        return;
      }

      console.log('Registration data:', data);

      // Call the Edge Function to send a welcome email
      try {
        const { error: functionError } = await supabase.functions.invoke('send-welcome-email', {
          body: { email, name: email.split('@')[0] }
        });
        
        if (functionError) {
          console.error('Failed to send welcome email:', functionError);
        } else {
          console.log('Welcome email sent successfully');
        }
      } catch (funcErr) {
        console.error('Edge function error:', funcErr);
      }

      // Save user data to AsyncStorage for local app state
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', password);
      const token = `${email}_${password}`;
      await AsyncStorage.setItem('userToken', token);
      
      // Clear any existing data for this new token
      await AsyncStorage.removeItem(`question1Choice_${token}`);
      await AsyncStorage.removeItem(`question1Code_${token}`);
      
      console.log('User registered successfully with token:', token);
      
      // Navigate to the user_info page to complete profile
      router.push('/user_info');
    } catch (err) {
      console.error('Failed to register user', err);
      setEmailError('Registration failed. Please try again.');
      shakeElement(emailShakeAnimation);
    } finally {
      setIsRegistering(false); // Re-enable button
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
                  onChangeText={(text: string) => {
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
                  onChangeText={(text: string) => {
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
                  onChangeText={(text: string) => {
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
              <TouchableOpacity 
                style={[
                  styles.registerButton, 
                  isRegistering && styles.disabledButton
                ]} 
                onPress={handleRegister}
                disabled={isRegistering}
              >
                <Text style={styles.registerText}>
                  {isRegistering ? 'Registering...' : 'Register'}
                </Text>
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
  disabledButton: {
    backgroundColor: '#888', // Gray out when disabled
    opacity: 0.7,
  },
});