import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

interface ProfileSectionProps {
  profileImage: string | null;
  userName: string;
  userHandle: string;
  theme: any;
  onImagePick: () => void;
}

const ProfileSection = ({ 
  profileImage, 
  userName, 
  userHandle, 
  theme, 
  onImagePick 
}: ProfileSectionProps) => {
  return (
    <View style={[styles.profileSection, { 
      borderBottomColor: theme.border,
      backgroundColor: 'transparent'
    }]}>
      {/* Profile Picture with Edit Icon */}
      <TouchableOpacity style={styles.profileImageContainer} onPress={onImagePick}>
        <Image 
          source={
            profileImage 
              ? { uri: profileImage } 
              : require('../../../assets/images/empty-icon.png')
          } 
          style={[styles.profileImage, { 
            backgroundColor: theme.mode === 'dark' ? theme.boxBackground : '#E0E0E0'
          }]} 
        />
        <View style={styles.editIconContainer}>
          <Text style={styles.editIcon}>✎</Text>
        </View>
      </TouchableOpacity>
      
      {/* Name and Username */}
      <Text style={[styles.userName, { color: theme.text }]}>{userName || 'Set your name'}</Text>
      <Text style={[styles.userHandle, { color: theme.subtext }]}>{userHandle || 'Set your username'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userHandle: {
    fontSize: 16,
  },
});

export default ProfileSection;
