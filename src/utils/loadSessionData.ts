import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

/**
 * Loads user token and saved question selections
 * Validates the user session and redirects to login if invalid
 */
export const loadUserSessionData = async (
  router: any,
  setUserToken: (token: string | null) => void,
  setSelected: (selection: string | null) => void,
  setExpandedOption: (option: string | null) => void,
) => {
  try {
    // First, remove any NON-token specific choices to avoid confusion
    await AsyncStorage.removeItem('question1Choice');
    await AsyncStorage.removeItem('question1Code');
    
    // Get user token (this should be set during login/registration)
    const token = await AsyncStorage.getItem('userToken');
    console.log('Current token:', token);
    
    if (!token) {
      // If no token, redirect to login
      console.log('No user token found - redirecting to login');
      Alert.alert(
        "Session Expired", 
        "Please log in again to continue.",
        [{ text: "OK", onPress: () => router.replace('/signup') }]
      );
      return;
    }
    
    setUserToken(token);
    
    // Only load TOKEN-SPECIFIC choices
    const savedSelection = await AsyncStorage.getItem(`question1Choice_${token}`);
    console.log('Loaded selection for this user:', savedSelection);
    
    if (savedSelection !== null) {
      setSelected(savedSelection);
      setExpandedOption(savedSelection);
    } else {
      // No saved selection for this token
      setSelected(null);
      setExpandedOption(null);
      console.log('No saved selections for this user. Starting fresh.');
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
};