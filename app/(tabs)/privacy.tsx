import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';

export default function PrivacyScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  
  // Back button handler
  const handleBack = () => {
    router.push('/(tabs)/settings');
  };
  
  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTitleStyle: {
            fontSize: 20,
            color: theme.text,
          },
          headerTitle: "Privacy & Security",
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
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.headerText, { color: theme.text }]}>Privacy & Security</Text>
        
        {/* Data Privacy Section */}
        <View style={[styles.section, { backgroundColor: theme.boxBackground, borderColor: theme.border }]}>
          <View style={styles.titleRow}>
            <Text style={styles.emoji}>🔒</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Privacy & Protection</Text>
          </View>
          <View style={styles.bulletPointContainer}>
            <Text style={[styles.bulletPoint, { color: theme.subtext }]}>• Your personal progress, goals, and activities are stored securely on your device locally.</Text>
            <Text style={[styles.bulletPoint, { color: theme.subtext }]}>• We do not sell your data to third parties—your information is yours alone.</Text>
            <Text style={[styles.bulletPoint, { color: theme.subtext }]}>• You have full control over your account, with the ability to delete your data anytime.</Text>
          </View>
        </View>
        
        {/* Secure & Encrypted Section */}
        <View style={[styles.section, { backgroundColor: theme.boxBackground, borderColor: theme.border }]}>
          <View style={styles.titleRow}>
            <Text style={styles.emoji}>🔐</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Secure & Encrypted</Text>
          </View>
          <View style={styles.bulletPointContainer}>
            <Text style={[styles.bulletPoint, { color: theme.subtext }]}>• All communication and stored data remain on your device, ensuring full privacy.</Text>
            <Text style={[styles.bulletPoint, { color: theme.subtext }]}>• Secure login methods, including Apple Sign-In and Two-Factor Authentication (2FA), help protect your account.</Text>
          </View>
        </View>
        
        {/* Your Control Section */}
        <View style={[styles.section, { backgroundColor: theme.boxBackground, borderColor: theme.border }]}>
          <View style={styles.titleRow}>
            <Text style={styles.emoji}>🛡️</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Control, Your Choice</Text>
          </View>
          <View style={styles.bulletPointContainer}>
            <Text style={[styles.bulletPoint, { color: theme.subtext }]}>• Transparent privacy policies ensure you know exactly how your data is used.</Text>
          </View>
        </View>
        
        <View style={styles.disclaimer}>
          <Text style={[styles.disclaimerText, { color: theme.subtext }]}>
            Our commitment is to ensure your personal data stays private and secure. 
            If you have any questions about your privacy, please contact our support team.
          </Text>
        </View>
      </ScrollView>
      
      {/* Bottom Navigation Icons */}
      <View style={[styles.bottomNav, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/performance')}
          style={styles.navButton}
        >
          <FontAwesome5 name="chart-line" size={22} color={theme.text} />
        </TouchableOpacity>
        
        {/* Home button */}
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => router.push('/(tabs)/homepage')}
        >
          <Text style={styles.homeButtonText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/settings')}
          style={styles.navButton}
        >
          <Ionicons name="settings" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80, // Add space for bottom nav
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 22,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bulletPointContainer: {
    marginLeft: 10,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  disclaimer: {
    marginTop: 10,
    marginBottom: 30,
  },
  disclaimerText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
});

export const unstable_settings = {
  bottomTabs: {
    tabBarStyle: { display: 'flex' },
  },
};
