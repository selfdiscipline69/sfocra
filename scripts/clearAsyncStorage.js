const AsyncStorage = require('@react-native-async-storage/async-storage').default;

const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage cleared');
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
  }
};

// Execute the function
clearAsyncStorage();
