import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Handles navigation to the next question while saving user selections
 * Supports both simple string routes and complex navigation objects
 * 
 * @param questionNumber The current question number (1, 2, 3, etc.)
 * @param userToken The user's authentication token
 * @param selected Currently selected option
 * @param codeMapping Record mapping option names to numeric codes
 * @param router The navigation router
 * @param nextRoute The route to navigate to (string or object)
 * @param storeNonTokenVersion Whether to also store non-token specific versions
 * @param customLogMessage Optional custom log message before navigation
 */
export const handleNext = async (
  questionNumber: number,
  userToken: string | null,
  selected: string | null,
  codeMapping: Record<string, number>,
  router: any,
  nextRoute: string | object,
  storeNonTokenVersion: boolean = false,
  customLogMessage?: string
) => {
  if (!userToken) {
    console.log('No user token found when navigating');
    return;
  }
  
  if (!selected) return;
  
  try {
    // Get the numeric code for the selected option
    const codeValue = codeMapping[selected];
    
    // Store non-token version if requested
    if (storeNonTokenVersion) {
      await AsyncStorage.setItem(`question${questionNumber}Choice`, selected);
      await AsyncStorage.setItem(`question${questionNumber}Code`, String(codeValue));
    }
    
    // Store with token-specific keys
    await AsyncStorage.setItem(`question${questionNumber}Choice_${userToken}`, selected);
    await AsyncStorage.setItem(`question${questionNumber}Code_${userToken}`, String(codeValue));
    console.log(`Confirmed selection before navigation: ${selected}`);
    
    // Log custom message if provided
    if (customLogMessage) {
      console.log(customLogMessage);
    }
    
    // Navigate to the next page
    await router.push(nextRoute);
  } catch (e) {
    console.error('Error during navigation:', e);
  }
};