import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import classes.json
import classesData from '../assets/classes.json';

export default function User_Classification() {
  const router = useRouter();
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [classInfo, setClassInfo] = useState({
    className: '',
    description: '',
    quest_format: '',
    consequence_description: '',
    model: ''
  });

  // Load user data when component mounts
  useEffect(() => {
    const loadUserClassification = async () => {
      try {
        setIsLoading(true);
        // Get user token
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
        
        // Get codes from AsyncStorage (try token-specific first, fall back to general)
        let path, difficulty, tracking, consequence;
        
        if (token) {
          path = await AsyncStorage.getItem(`question1Code_${token}`) || await AsyncStorage.getItem('question1Code');
          difficulty = await AsyncStorage.getItem(`question2Code_${token}`) || await AsyncStorage.getItem('question2Code');
          tracking = await AsyncStorage.getItem(`question3Code_${token}`) || await AsyncStorage.getItem('question3Code');
          consequence = await AsyncStorage.getItem(`question4Code_${token}`) || await AsyncStorage.getItem('question4Code');
        } else {
          path = await AsyncStorage.getItem('question1Code');
          difficulty = await AsyncStorage.getItem('question2Code');
          tracking = await AsyncStorage.getItem('question3Code');
          consequence = await AsyncStorage.getItem('question4Code');
        }
        
        // Map to simplified attributes
        // Path: Keep as is (1, 2, 3)
        // Difficulty: Map 1-3 to "beginner", 4-5 to "epic"
        const simplifiedDifficulty = parseInt(difficulty || '1') <= 3 ? "beginner" : "epic";
        
        // For backward compatibility, store the old format key as well
        const oldFormatKey = `${path}-${difficulty}-${tracking}-${consequence}`;
        
        // Create a combined path+difficulty for new format
        const newFormatKey = `${path}-${simplifiedDifficulty}-${consequence === '1' ? 'consequence' : 'noconsequence'}`;
        
        // Find the class data in classes.json using the new format key
        const classEntry = classesData.classes.find(c => c.key === newFormatKey);
        
        if (classEntry) {
          // Store the class information for display
          setClassInfo({
            className: classEntry.class,
            description: classEntry.description,
            quest_format: classEntry.quest_format,
            consequence_description: classEntry.consequence_description,
            model: classEntry.model || ''
          });
          
          // Save the class information to AsyncStorage for later use
          await AsyncStorage.setItem('userClass', classEntry.class);
          
          // Store both key formats for backward compatibility
          await AsyncStorage.setItem('userClassKey', newFormatKey);
          await AsyncStorage.setItem('userClassKeyOld', oldFormatKey);
          
          await AsyncStorage.setItem('userClassDescription', classEntry.description);
          await AsyncStorage.setItem('userQuestFormat', classEntry.quest_format);
          await AsyncStorage.setItem('userConsequenceDescription', classEntry.consequence_description);
          await AsyncStorage.setItem('userClassModel', classEntry.model || '');
          
          if (token) {
            await AsyncStorage.setItem(`userClass_${token}`, classEntry.class);
            await AsyncStorage.setItem(`userClassKey_${token}`, newFormatKey);
            await AsyncStorage.setItem(`userClassKeyOld_${token}`, oldFormatKey);
            
            // Clear any existing tasks to ensure fresh data
            await AsyncStorage.removeItem(`dailyTasks_${token}`);
            await AsyncStorage.removeItem('dailyTasks');
          }
          
          // Initialize additionalTasks as an empty array if it doesn't exist yet
          if (token) {
            const existingAdditionalTasks = await AsyncStorage.getItem(`additionalTasks_${token}`);
            if (!existingAdditionalTasks) {
              await AsyncStorage.setItem(`additionalTasks_${token}`, JSON.stringify([]));
            }
          }
          
          // Initial quests will be generated when homepage loads
        } else {
          console.error('Class not found for key:', newFormatKey);
          setClassInfo({
            className: 'Class Not Found',
            description: 'There was an error determining your hero class.',
            quest_format: 'Please try the classification process again.',
            consequence_description: '',
            model: ''
          });
        }
        
        setIsLoading(false);
      } catch (e) {
        console.error('Error loading user classification:', e);
        setIsLoading(false);
      }
    };
    
    console.log("User Classification screen mounted");
    loadUserClassification();
  }, []);

  // Handler for continuing to the loading screen before the homepage
  const handleContinue = () => {
    console.log("Continuing to Loading Screen");
    router.replace('/LoadingScreen'); // Navigate to Loading Screen
  };

  // Handler for going back to question4
  const handleBack = () => {
    console.log("Navigating back to question4");
    router.push('/question4');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="red" />
        <Text style={styles.loadingText}>Determining your hero class...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.9}
      onPress={handleContinue}
    >
      <View style={styles.content}>
        <Text style={styles.headerText}>Your Hero Class</Text>
        
        <Text style={styles.classTitle}>{classInfo.className}</Text>
        
        {classInfo.model && (
          <Text style={styles.modelText}>Models: {classInfo.model}</Text>
        )}
        
        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.infoText}>{classInfo.description}</Text>
        </View>
        
        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>Quest Format</Text>
          <Text style={styles.infoText}>{classInfo.quest_format}</Text>
        </View>
        
        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>Consequence System</Text>
          <Text style={styles.infoText}>{classInfo.consequence_description}</Text>
        </View>
        
        <Text style={styles.tapToContinue}>Tap anywhere to continue</Text>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  headerText: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 10,
    textAlign: 'center',
  },
  classTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Olondon_' : 'Olondon_',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6666',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#ddd',
    lineHeight: 22,
  },
  tapToContinue: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 40,
    fontStyle: 'italic',
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
  loadingText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
  },
  modelText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#aaa',
    marginBottom: 20,
    textAlign: 'center',
  },
});