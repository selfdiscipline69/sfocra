import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserChoices } from '../types/UserTypes';

// User choices storage
export const getUserChoices = async (userToken: string): Promise<UserChoices> => {
  try {
    // Initialize with null values according to the updated UserChoices type
    const choices: UserChoices = {
      question1: null,
      question2: null,
      question4: null,
    };

    // Define the keys based on the current questions
    const questionKeys: (keyof UserChoices)[] = ['question1', 'question2', 'question4'];
    const questionNumbers = [1, 2, 4]; // Corresponding question numbers

    for (let i = 0; i < questionKeys.length; i++) {
      const questionKey = questionKeys[i];
      const questionNum = questionNumbers[i];

      // Try with token-specific key first
      if (userToken) {
        const choiceWithToken = await AsyncStorage.getItem(`question${questionNum}Choice_${userToken}`);
        if (choiceWithToken !== null) {
          choices[questionKey] = choiceWithToken;
          continue; // Move to next question key
        }
      }

      // Fall back to non-token key
      const choiceWithoutToken = await AsyncStorage.getItem(`question${questionNum}Choice`);
      if (choiceWithoutToken !== null) {
        choices[questionKey] = choiceWithoutToken;
      }
    }

    return choices;
  } catch (error) {
    console.error('Error getting user choices:', error);
    // Return structure matching the updated UserChoices type
    return {
      question1: null,
      question2: null,
      question4: null,
    };
  }
}; 