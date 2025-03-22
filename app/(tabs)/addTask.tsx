import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';

// Use lazy loading for the implementation
const AddTaskScreenImpl = React.lazy(() => import('../../src/screens/AddTaskScreen'));

export default function AddTask() {
  const { theme } = useTheme();
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTitleStyle: {
            fontSize: 16,
            color: theme.text,
          },
          headerTitle: "Add Tasks",
        }} 
      />
      
      {/* Wrap the lazy-loaded component in a Suspense boundary */}
      <React.Suspense fallback={<React.Fragment />}>
        <AddTaskScreenImpl />
      </React.Suspense>
    </>
  );
}

export const unstable_settings = {
  // This ensures the tab bar is displayed correctly
  bottomTabs: {
    tabBarStyle: { display: 'flex' },
  },
};