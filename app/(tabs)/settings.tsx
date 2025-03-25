import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../src/context/ThemeContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

// Import components
import ProfileSection from '../../components/settings/ProfileSection';
import HeroClassSection from '../../components/settings/HeroClassSection';
import SettingItem from '../../components/settings/SettingItem';
import BottomNavigation from '../../components/BottomNavigation';

const { width } = Dimensions.get('window');

// Define SettingItem interface with enhanced functionality
interface SettingItem {
  id: string;
  title: string;
  screen: string;
  isSpecial?: boolean;
  handler?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  toggleHandler?: () => void;
  rightElement?: () => React.ReactNode;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userHandle, setUserHandle] = useState<string>('');
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
      const token = await AsyncStorage.getItem('userToken');
      if (token !== null) {
        setUserToken(token);
        const storedImage = await AsyncStorage.getItem(`profileImage_${token}`);
        if (storedImage !== null) {
          setProfileImage(storedImage);
        }
      }
      
      const storedName = await AsyncStorage.getItem('userFullName');
      const storedHandle = await AsyncStorage.getItem('userUsername');
      
      setUserName(storedName || 'Hero');
      setUserHandle(storedHandle || '@hero');
      
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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        setProfileImage(selectedImageUri);
        
        if (userToken) {
          await AsyncStorage.setItem(`profileImage_${userToken}`, selectedImageUri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  // Navigate back to homepage
  const handleBack = () => {
    router.push({
      pathname: '/(tabs)/homepage'
    });
  };

  // Handler for settings item press
  const handleSettingPress = (item: SettingItem) => {
    if (item.isToggle && item.toggleHandler) {
      item.toggleHandler();
    } else if (item.title === 'Logout') {
      router.replace('/');
    } else if (item.handler) {
      item.handler();
    } else if (item.screen) {
      router.push({ pathname: item.screen as any });
    }
  };

  // Theme toggle handler
  const handleThemeToggle = () => {
    toggleTheme(!isDarkMode);
  };

  // Debugging for navigation
  const handlePrivacyNavigation = () => {
    console.log("Navigating to privacy screen");
    router.push({ pathname: "/(tabs)/privacy" });
  };

  // Combined settings data for FlatList
  const settingsData: SettingItem[] = [
    { 
      id: '1', 
      title: 'Theme', 
      screen: '', 
      isToggle: true,
      toggleValue: isDarkMode,
      toggleHandler: handleThemeToggle,
      rightElement: () => (
        <View style={styles.themeToggleContainer}>
          <Text style={[styles.themeLabel, { color: theme.text }]}>
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </Text>
          <TouchableOpacity 
            style={[
              styles.themeToggle, 
              { backgroundColor: isDarkMode ? theme.accent : '#ccc' }
            ]}
            onPress={handleThemeToggle}
          >
            <View style={[
              styles.toggleKnob, 
              { 
                backgroundColor: 'white',
                transform: [{ translateX: isDarkMode ? 22 : 0 }]
              }
            ]} />
          </TouchableOpacity>
        </View>
      )
    },
    { id: '4', title: 'Privacy & Security', screen: '/(tabs)/privacy', handler: handlePrivacyNavigation },
    { id: '6', title: 'Change Password', screen: '/(tabs)/change_pw' },
    { id: '7', title: 'Logout', screen: '/', isSpecial: true },
  ];

  // Enhanced setting item renderer to handle toggles
  const renderSettingItem = ({ item }: { item: SettingItem }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.settingItem, 
          item.isSpecial && styles.specialSettingItem,
          { 
            borderBottomColor: theme.border,
            backgroundColor: 'transparent'
          }
        ]}
        onPress={() => handleSettingPress(item)}
      >
        <Text style={[
          styles.settingText,
          { color: item.isSpecial ? theme.accent : theme.text },
          item.isSpecial && styles.specialSettingText
        ]}>
          {item.title}
        </Text>
        
        {item.rightElement ? (
          item.rightElement()
        ) : (
          <Text style={[styles.arrowIcon, { color: theme.subtext }]}>➝</Text>
        )}
      </TouchableOpacity>
    );
  };

  // Render header component for list
  const ListHeaderComponent = () => (
    <>
      <ProfileSection
        profileImage={profileImage}
        userName={userName}
        userHandle={userHandle}
        theme={theme}
        onImagePick={handleImagePick}
      />
      <HeroClassSection heroClass={heroClass} theme={theme} />
    </>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: { backgroundColor: theme.background },
          headerTitleStyle: {
            fontSize: 18,
            color: theme.text,
            fontWeight: 'bold',
          },
          headerTitle: "Settings",
          headerTitleAlign: 'center',
        }} 
      />
      
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <FlatList
          data={settingsData}
          renderItem={renderSettingItem}
          keyExtractor={item => item.id}
          style={[styles.settingsList, { backgroundColor: theme.background }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
          contentContainerStyle={styles.listContentContainer}
        />
        
        <BottomNavigation theme={theme} activeScreen="settings" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    marginVertical: 2,
  },
  specialSettingItem: {
    borderBottomWidth: 0,
    marginTop: 15,
  },
  settingText: {
    fontSize: 16,
  },
  specialSettingText: {
    fontWeight: 'bold',
  },
  arrowIcon: {
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Theme toggle styles
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeLabel: {
    marginRight: 10,
    fontSize: 14,
  },
  themeToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  }
});