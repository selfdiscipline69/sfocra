import AsyncStorage from '@react-native-async-storage/async-storage';

const getCreationDateKey = (userToken: string) => `@account_creation_date_${userToken}`;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Function to calculate account age in days and save creation date if missing
export const getAccountAge = async (userToken: string): Promise<number> => {
   if (!userToken) return 1; // Default age if no token
  try {
    const creationDateKey = getCreationDateKey(userToken);
    let creationDateStr = await AsyncStorage.getItem(creationDateKey);
    let creationTimestamp: number;

    if (creationDateStr && !isNaN(parseInt(creationDateStr, 10))) {
      creationTimestamp = parseInt(creationDateStr, 10);
    } else {
      // If creation date not found or invalid, set it to the beginning of today and save
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      creationTimestamp = startOfToday.getTime();
      await AsyncStorage.setItem(creationDateKey, creationTimestamp.toString());
      console.log("Account creation date not found/invalid, set to:", startOfToday.toISOString());
      return 1; // First day
    }

    const creationDate = new Date(creationTimestamp);
    const today = new Date();
    const startOfTodayTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const startOfCreationDayTimestamp = new Date(creationDate.getFullYear(), creationDate.getMonth(), creationDate.getDate()).getTime();

    // Check if creation date is in the future (possible due to adjustments/errors)
    if (startOfCreationDayTimestamp > startOfTodayTimestamp) {
        console.warn("Creation date is in the future. Resetting to today.");
        creationTimestamp = startOfTodayTimestamp;
        await AsyncStorage.setItem(creationDateKey, creationTimestamp.toString());
        return 1;
    }

    // Calculate days difference based on the start of each day
    const diffTime = startOfTodayTimestamp - startOfCreationDayTimestamp;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 because day 1 is the first day

    return Math.max(1, diffDays); // Ensure minimum age is 1

  } catch (error) {
    console.error('Error calculating account age:', error);
    // Fallback: Try to set creation date now and return 1
    try {
        const creationDateKey = getCreationDateKey(userToken);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        await AsyncStorage.setItem(creationDateKey, startOfToday.getTime().toString());
        return 1;
    } catch (saveError) {
        console.error('Error saving fallback creation date:', saveError);
        return 1; // Ultimate fallback
    }
  }
};

// Function to adjust the creation date earlier (increase age)
export const increaseAccountCreationDay = async (userToken: string): Promise<boolean> => {
  if (!userToken) return false;
  try {
    const key = getCreationDateKey(userToken);
    const creationDateStr = await AsyncStorage.getItem(key);
    if (!creationDateStr) {
      console.warn("Cannot increase age: Creation date not found.");
      // Attempt to set creation date to yesterday to make age 2
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday.getTime() - DAY_IN_MS);
      await AsyncStorage.setItem(key, startOfYesterday.getTime().toString());
      console.log("DEV: Set creation date to yesterday.");
      return true;
    }
    const currentTimestamp = parseInt(creationDateStr, 10);
    if (isNaN(currentTimestamp)) {
        console.error("Cannot increase age: Invalid creation timestamp."); return false;
    }
    const newTimestamp = currentTimestamp - DAY_IN_MS;
    await AsyncStorage.setItem(key, newTimestamp.toString());
    console.log("DEV: Adjusted creation date earlier to:", new Date(newTimestamp).toISOString());
    return true;
  } catch (error) {
    console.error("Error increasing account age:", error);
    return false;
  }
};

// Function to adjust the creation date later (decrease age)
export const decreaseAccountCreationDay = async (userToken: string): Promise<boolean> => {
   if (!userToken) return false;
  try {
    const key = getCreationDateKey(userToken);
    const creationDateStr = await AsyncStorage.getItem(key);
    if (!creationDateStr) {
      console.warn("Cannot decrease age: Creation date not found.");
       // Cannot decrease age if it doesn't exist (or is implicitly 1)
      return false;
    }

    const currentTimestamp = parseInt(creationDateStr, 10);
     if (isNaN(currentTimestamp)) {
        console.error("Cannot decrease age: Invalid creation timestamp."); return false;
    }
    const newTimestamp = currentTimestamp + DAY_IN_MS;

    // Prevent setting creation date to today or in the future
    const now = new Date();
    const startOfTodayTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (newTimestamp >= startOfTodayTimestamp) {
      console.warn("Cannot decrease age below 1.");
      // Set it *to* yesterday to ensure age becomes 1 if it wasn't already
       const startOfYesterdayTimestamp = startOfTodayTimestamp - DAY_IN_MS;
       if (currentTimestamp < startOfYesterdayTimestamp) {
           await AsyncStorage.setItem(key, startOfYesterdayTimestamp.toString());
           console.log("DEV: Adjusted creation date to yesterday (minimum age 1).");
           return true;
       }
      return false;
    }

    await AsyncStorage.setItem(key, newTimestamp.toString());
    console.log("DEV: Adjusted creation date later to:", new Date(newTimestamp).toISOString());
    return true;
  } catch (error) {
    console.error("Error decreasing account age:", error);
    return false;
  }
}; 