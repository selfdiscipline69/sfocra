import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  Image,
  Dimensions,
  Alert
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5, Ionicons } from '@expo/vector-icons'; // Import vector icons

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [userToken, setUserToken] = useState('');
  const [userName, setUserName] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [heroClass, setHeroClass] = useState({
    className: '',
    description: '',
    questFormat: '',
    consequenceDescription: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  // Function to load all user data from AsyncStorage
  const loadUserData = async () => {
    try {
      // Get user token
      const userToken = await AsyncStorage.getItem('userToken');
      setUserToken(userToken);
      
      // Load profile image if exists
      if (userToken) {
        const storedImage = await AsyncStorage.getItem(`profileImage_${userToken}`);
        if (storedImage !== null) setProfileImage(storedImage);
      }
      
      // Load user name and handle with better fallbacks
      const storedName = await AsyncStorage.getItem('userFullName');
      const storedHandle = await AsyncStorage.getItem('userUsername');
      
      setUserName(storedName || 'Hero');
      setUserHandle(storedHandle || '@hero');
      
      // Load hero class information
      const userClass = await AsyncStorage.getItem('userClass');
      const userClassDescription = await AsyncStorage.getItem('userClassDescription');
      const userQuestFormat = await AsyncStorage.getItem('userQuestFormat');
      const userConsequenceDescription = await AsyncStorage.getItem('userConsequenceDescription');
      
      setHeroClass({
        className: userClass || 'Unknown',
        description: userClassDescription || 'No description available.',
        questFormat: userQuestFormat || 'No quest format available.',
        consequenceDescription: userConsequenceDescription || 'No consequence description available.'
      });
    } catch (err) {
      console.error('Error loading user data:', err);
      setUserName('Hero');
      setUserHandle('@hero');
    }
  };

  // Function to handle image picking
  const handleImagePick = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Get the selected image URI
        const selectedImageUri = result.assets[0].uri;
        
        // Save to state
        setProfileImage(selectedImageUri);
        
        // Save to AsyncStorage with user's token
        if (userToken) {
          await AsyncStorage.setItem(`profileImage_${userToken}`, selectedImageUri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  // Add back button handler
  const handleBack = () => {
    router.push('/(tabs)/homepage');
  };

  // Settings data for FlatList - update the Appearance screen path
  const settingsData = [
    { id: '2', title: 'Appearance', screen: '/(tabs)/appearance' }, // Changed to new appearance screen
    { id: '4', title: 'Privacy & Security', screen: '/(tabs)/homepage' },
    { id: '6', title: 'Change Password', screen: '/(tabs)/change_pw' },
    { id: '7', title: 'Logout', screen: '/', isSpecial: true },
  ];

  // Render each setting item
  const renderSettingItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.settingItem, 
        item.isSpecial && styles.specialSettingItem
      ]}
      onPress={() => {
        if (item.title === 'Logout') {
          router.replace('/');
        } else {
          router.push(item.screen);
        }
      }}
    >
      <Text style={[
        styles.settingText,
        item.isSpecial && styles.specialSettingText
      ]}>
        {item.title}
      </Text>
      <Text style={styles.arrowIcon}>➝</Text>
    </TouchableOpacity>
  );

  // Create header component for FlatList that includes profile section
  const ListHeaderComponent = () => (
    <>
      <View style={styles.profileSection}>
        {/* Profile Picture with Edit Icon */}
        <TouchableOpacity style={styles.profileImageContainer} onPress={handleImagePick}>
          <Image 
            source={
              profileImage 
                ? { uri: profileImage } 
                : require('../../assets/images/empty-icon.png')
            } 
            style={styles.profileImage} 
          />
          <View style={styles.editIconContainer}>
            <Text style={styles.editIcon}>✎</Text>
          </View>
        </TouchableOpacity>
        
        {/* Name and Username - Now properly fallback to generic text if empty */}
        <Text style={styles.userName}>{userName || 'Set your name'}</Text>
        <Text style={styles.userHandle}>{userHandle || 'Set your username'}</Text>
      </View>
      
      {/* Hero Class Information - Redesigned */}
      <View style={styles.heroClassSection}>
        <View style={styles.heroClassTitleContainer}>
          <Text style={styles.heroClassPrefix}>⚔️ YOUR HERO CLASS</Text>
          <Text style={styles.heroClassName}>{heroClass.className}</Text>
        </View>
        
        <View style={styles.heroClassContentBox}>
          <View style={styles.heroClassInfoSection}>
            <Text style={styles.heroClassSubtitle}>📜 Description</Text>
            <Text style={styles.heroClassText}>{heroClass.description}</Text>
          </View>
          
          <View style={styles.heroClassDivider} />
          
          <View style={styles.heroClassInfoSection}>
            <Text style={styles.heroClassSubtitle}>🎯 Quest Format</Text>
            <Text style={styles.heroClassText}>{heroClass.questFormat}</Text>
          </View>
          
          <View style={styles.heroClassDivider} />
          
          <View style={styles.heroClassInfoSection}>
            <Text style={styles.heroClassSubtitle}>⚖️ Consequence System</Text>
            <Text style={styles.heroClassText}>{heroClass.consequenceDescription}</Text>
          </View>
        </View>
      </View>
    </>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: 'black',
          },
          headerTitleStyle: {
            fontSize: 18,
            color: 'white',
            fontWeight: 'bold',
          },
          headerTitle: "Settings",
          headerTitleAlign: 'center',
          headerHeight: 70,
          headerRight: () => (
            <TouchableOpacity
              style={styles.topRightBackButton}
              onPress={handleBack}
            >
              <Text style={styles.topRightBackText}>Back</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.container}>
        {/* Settings List with Profile Section as Header */}
        <FlatList
          data={settingsData}
          renderItem={renderSettingItem}
          keyExtractor={item => item.id}
          style={styles.settingsList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
          contentContainerStyle={styles.listContentContainer}
        />
        
        {/* Updated Bottom Navigation Icons */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/performance')}
            style={styles.navButton}
          >
            <FontAwesome5 name="chart-line" size={22} color="white" />
          </TouchableOpacity>
          
          {/* Home button with text instead of plus icon */}
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => router.push('/(tabs)/homepage')}
          >
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/settings')}
            style={[styles.navButton, styles.activeNavButton]}
          >
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginTop: 10, // Add space to prevent overlap with header
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0080ff',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
  },
  editIcon: {
    color: 'white',
    fontSize: 16,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userHandle: {
    color: 'gray',
    fontSize: 16,
  },
  settingsList: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  specialSettingItem: {
    borderBottomWidth: 0,
    marginTop: 15,
  },
  settingText: {
    color: 'white',
    fontSize: 16,
  },
  specialSettingText: {
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  arrowIcon: {
    color: 'gray',
    fontSize: 16,
  },
  topRightBackButton: {
    backgroundColor: 'transparent',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  topRightBackText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderColor: 'gray',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  activeNavButton: {
    // Optional: Add styling for the active nav button
    opacity: 0.9,
  },
  icon: {
    fontSize: 24,
    color: 'white',
  },
  homeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  heroClassSection: {
    marginHorizontal: 10,
    marginVertical: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
  },
  heroClassTitleContainer: {
    padding: 15,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    alignItems: 'center',
  },
  heroClassPrefix: {
    color: '#999',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 5,
  },
  heroClassName: {
    color: 'red',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heroClassContentBox: {
    padding: 15,
  },
  heroClassInfoSection: {
    marginVertical: 5,
  },
  heroClassSubtitle: {
    color: '#ff5555',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroClassText: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 10,
  },
  heroClassDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
  },
});