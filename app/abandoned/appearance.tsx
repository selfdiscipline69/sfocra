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
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

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

export default function AppearanceScreen() {
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

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token !== null) {
        setUserToken(token);
      }

      if (token) {
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

  const handleBack = () => {
    router.push({
      pathname: '/(tabs)/homepage'
    });
  };

  const handlePrivacyNavigation = () => {
    console.log("Navigating to privacy screen");
    router.push({
      pathname: "/(tabs)/privacy"
    });
  };

  const handleThemeToggle = () => {
    toggleTheme(!isDarkMode);
  };

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
    { id: '2', title: 'Privacy & Security', screen: '/(tabs)/privacy', handler: handlePrivacyNavigation },
    { id: '3', title: 'Change Password', screen: '/(tabs)/change_pw' },
    { id: '4', title: 'Logout', screen: '/', isSpecial: true },
  ];

  function renderSettingItem({ item, theme }: { item: SettingItem; theme: any }) {
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
        onPress={() => {
          if (item.isToggle && item.toggleHandler) {
            item.toggleHandler();
          } else if (item.title === 'Logout') {
            router.replace('/');
          } else if (item.handler) {
            item.handler();
          } else if (item.screen) {
            router.push({
              pathname: item.screen as any
            });
          }
        }}
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
  }

  function ListHeaderComponent({ theme }: { theme: any }) {
    return (
      <>
        <View style={[styles.profileSection, { 
          borderBottomColor: theme.border,
          backgroundColor: 'transparent'
        }]}>
          <TouchableOpacity style={styles.profileImageContainer} onPress={handleImagePick}>
            <Image 
              source={
                profileImage 
                  ? { uri: profileImage } 
                  : require('../../assets/images/empty-icon.png')
              } 
              style={[styles.profileImage, { 
                backgroundColor: theme.mode === 'dark' ? theme.boxBackground : '#E0E0E0'
              }]} 
            />
            <View style={styles.editIconContainer}>
              <Text style={styles.editIcon}>✎</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.userName, { color: theme.text }]}>{userName || 'Set your name'}</Text>
          <Text style={[styles.userHandle, { color: theme.subtext }]}>{userHandle || 'Set your username'}</Text>
        </View>
        
        <View style={[styles.heroClassSection, { 
          backgroundColor: theme.mode === 'dark' ? theme.boxBackground : 'rgba(245, 245, 245, 0.7)',
          borderColor: theme.border 
        }]}>
          <View style={[styles.heroClassTitleContainer, { backgroundColor: theme.mode === 'dark' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 0, 0, 0.1)' }]}>
            <Text style={[styles.heroClassPrefix, { color: theme.subtext }]}>⚔️ YOUR HERO CLASS</Text>
            <Text style={[styles.heroClassName, { color: theme.accent }]}>{heroClass.className}</Text>
          </View>
          <View style={[styles.heroClassContentBox, { backgroundColor: theme.boxBackground }]}>
            <View style={styles.heroClassInfoSection}>
              <Text style={[styles.heroClassSubtitle, { color: theme.accent }]}>📜 Description</Text>
              <Text style={[styles.heroClassText, { color: theme.text }]}>{heroClass.description}</Text>
            </View>
            <View style={[styles.heroClassDivider, { backgroundColor: theme.border }]} />
            <View style={styles.heroClassInfoSection}>
              <Text style={[styles.heroClassSubtitle, { color: theme.accent }]}>🎯 Quest Format</Text>
              <Text style={[styles.heroClassText, { color: theme.text }]}>{heroClass.questFormat}</Text>
            </View>
            <View style={[styles.heroClassDivider, { backgroundColor: theme.border }]} />
            <View style={styles.heroClassInfoSection}>
              <Text style={[styles.heroClassSubtitle, { color: theme.accent }]}>⚖️ Consequence System</Text>
              <Text style={[styles.heroClassText, { color: theme.text }]}>{heroClass.consequenceDescription}</Text>
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerStyle: { 
            backgroundColor: theme.background, 
          }, 
          headerTitleStyle: { 
            fontSize: 18, 
            color: theme.text, 
            fontWeight: 'bold', 
          }, 
          headerTitle: "Settings", 
          headerTitleAlign: 'center', 
          headerRight: () => (
            <TouchableOpacity 
              style={styles.topRightBackButton} 
              onPress={handleBack}
            >
              <Text style={[styles.topRightBackText, { color: theme.text }]}>Back</Text>
            </TouchableOpacity>
          ), 
        }} 
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <FlatList 
          data={settingsData} 
          renderItem={({ item }) => renderSettingItem({ item, theme })} 
          keyExtractor={item => item.id} 
          style={[styles.settingsList, { backgroundColor: theme.background }]} 
          showsVerticalScrollIndicator={false} 
          ListHeaderComponent={() => ListHeaderComponent({ theme })} 
          contentContainerStyle={styles.listContentContainer} 
        />
        <View style={[styles.bottomNav, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/(tabs)/performance' })}
            style={styles.navButton}
          >
            <FontAwesome5 name="chart-line" size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => router.push({ pathname: '/(tabs)/homepage' })}
          >
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/(tabs)/settings' })}
            style={[styles.navButton, styles.activeNavButton]}
          >
            <Ionicons name="settings" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    marginTop: 10,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    marginVertical: 2,
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
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  activeNavButton: {
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
    borderWidth: 1,
  },
  heroClassTitleContainer: {
    padding: 15,
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
  },
  heroClassContentBox: {
    padding: 15,
  },
  heroClassInfoSection: {
    marginBottom: 10,
  },
  heroClassSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  heroClassText: {
    fontSize: 14,
  },
  heroClassDivider: {
    height: 1,
    marginVertical: 10,
  },
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