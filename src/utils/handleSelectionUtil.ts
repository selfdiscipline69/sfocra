import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generic handler for option selection across all question pages
 * Manages selection state and saves/removes choices in AsyncStorage
 * 
 * @param questionNumber The question number (1, 2, 3, etc.)
 * @param option The option being selected/deselected
 * @param userToken The user's authentication token
 * @param selected Currently selected option
 * @param setSelected Function to update selected state
 * @param setExpandedOption Function to update expanded option state
 * @param codeMapping Record mapping option names to numeric codes
 * @param storeNonTokenVersion Whether to also store non-token specific versions (default: false)
 */
export const handleSelection = async (
  questionNumber: number,
  option: string,
  userToken: string | null,
  selected: string | null,
  setSelected: (value: string | null) => void,
  setExpandedOption: (value: string | null) => void,
  codeMapping: Record<string, number>,
  storeNonTokenVersion: boolean = false
) => {
  try {
    if (selected === option) {
      // If already selected, unselect it
      setSelected(null);
      setExpandedOption(null);
      
      // Remove from AsyncStorage
      if (storeNonTokenVersion) {
        await AsyncStorage.removeItem(`question${questionNumber}Choice`);
        await AsyncStorage.removeItem(`question${questionNumber}Code`);
      }
      
      if (userToken) {
        await AsyncStorage.removeItem(`question${questionNumber}Choice_${userToken}`);
        await AsyncStorage.removeItem(`question${questionNumber}Code_${userToken}`);
        console.log('Selection cleared');
      }
    } else {
      // If not selected or a different option was selected, select this one
      const codeValue = codeMapping[option];
      
      // Store both the human-readable choice and the code
      if (storeNonTokenVersion) {
        await AsyncStorage.setItem(`question${questionNumber}Choice`, option);
        await AsyncStorage.setItem(`question${questionNumber}Code`, String(codeValue));
      }
      
      // If we have a user token, also store with token-specific keys
      if (userToken) {
        await AsyncStorage.setItem(`question${questionNumber}Choice_${userToken}`, option);
        await AsyncStorage.setItem(`question${questionNumber}Code_${userToken}`, String(codeValue));
        console.log(`Saved selection: ${option} (${codeValue}) for token ${userToken}`);
      }
      
      setSelected(option);
      setExpandedOption(option);
    }
  } catch (e) {
    console.error('Error saving selection:', e);
  }
};