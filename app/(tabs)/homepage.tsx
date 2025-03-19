import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
// Use dynamic import with React.lazy to avoid potential circular dependencies
const HomepageScreen = React.lazy(() => import('../../src/screens/HomepageScreen'));

export default function Homepage() {
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
          headerTitle: "",
        }} 
      />
      {/* Wrap the lazy-loaded component in a Suspense boundary */}
      <React.Suspense fallback={<React.Fragment />}>
        <HomepageScreen />
      </React.Suspense>
    </>
  );
}

export const unstable_settings = {
  bottomTabs: {
    tabBarStyle: { display: 'none' },
  },
};