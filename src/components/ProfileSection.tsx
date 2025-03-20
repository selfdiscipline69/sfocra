import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface ProfileSectionProps {
  profileImage: string | null;
  userHandle: string;
  theme: any; // Replace with proper theme type if available
}

const ProfileSection = ({ profileImage, userHandle, theme }: ProfileSectionProps) => {
  const router = useRouter();
  
  return (
    <View style={styles.profileSection}>
      <TouchableOpacity 
        onPress={() => router.push('/(tabs)/settings')} 
        style={styles.profileIconButton}
        accessibilityLabel="Settings"
      >
        {profileImage ? (
          <Image 
            source={{ uri: profileImage }} 
            style={styles.profileIcon} 
          />
        ) : (
          <View style={[styles.profileIcon, { backgroundColor: theme?.mode === 'dark' ? '#555' : '#e0e0e0' }]} />
        )}
      </TouchableOpacity>
      
      {/* Username display under profile icon */}
      <Text style={[styles.usernameText, { color: theme?.text || '#ddd' }]}>
        {userHandle || '@username'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    alignItems: 'center',
  },
  profileIconButton: {
    padding: 8,
  },
  profileIcon: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#e0e0e0',
  },
  usernameText: {
    fontSize: 12,
    marginTop: 6, 
    textAlign: 'center',
    maxWidth: 150,
  },
});

export default ProfileSection;
