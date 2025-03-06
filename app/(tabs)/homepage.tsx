import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Homepage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.header}>
        <Text style={styles.description}>
          A warrior does not wait for the perfect moment; they forge it with their own hands. 
          Every step, every struggle, every victory—this is how legends are made.
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
          <View style={styles.profileIcon} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Weekly Trial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Daily Quote</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Daily Quote</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Daily Quote</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation Icons */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/performance')}>
          <Text style={styles.icon}>📈</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/addTask')}>
          <Text style={styles.icon}>➕</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
          <Text style={styles.icon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingTop: 100, // Adjust to move elements down
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30, // Space between header and content
  },
  description: {
    color: 'gray',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center', // Moves the content lower
  },
  option: {
    backgroundColor: 'white',
    paddingVertical: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderColor: 'gray',
  },
  icon: {
    fontSize: 24,
    color: 'white',
  },
});

export const unstable_settings = {
  bottomTabs: {
    tabBarStyle: { display: 'none' }, // Hide the bottom white bar
  },
};