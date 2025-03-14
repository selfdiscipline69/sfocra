import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { display: 'none' } // Hide the tab bar
    }}>
      <Tabs.Screen name="homepage" />
      <Tabs.Screen name="performance" />
      <Tabs.Screen name="settings" />
      <Tabs.Screen name="addTask" />
      <Tabs.Screen name="appearance" /> {/* Add the new screen */}
    </Tabs>
  );
}