import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserClassKey = async (userToken: string | null): Promise<string | null> => {
  try {
    let newFormatKey: string | null = null;
    let oldFormatKey: string | null = null;

    if (userToken) {
      // Prioritize token-specific keys
      newFormatKey = await AsyncStorage.getItem(`userClassKey_${userToken}`);
      oldFormatKey = await AsyncStorage.getItem(`userClassKeyOld_${userToken}`);
    }

    // Fallback to general keys if token-specific are not found or token is null
    if (!newFormatKey) {
      newFormatKey = await AsyncStorage.getItem('userClassKey');
    }
    if (!oldFormatKey) {
      oldFormatKey = await AsyncStorage.getItem('userClassKeyOld');
    }

    // Return new format key if available, otherwise fall back to old format key
    return newFormatKey || oldFormatKey;

  } catch (error) {
    console.error('Error getting user class key:', error);
    return null;
  }
}; 