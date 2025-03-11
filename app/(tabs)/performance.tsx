import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';

export default function PerformanceScreen() {
  const router = useRouter();
  
  const handleBack = () => {
    router.push('/(tabs)/homepage');
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: 'black',
            height: 100,
          },
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
          },
          headerTitle: "Performance",
        }} 
      />
      
      <View style={styles.container}>
        <Text style={styles.text}>Performance Page - Graphs & Analytics</Text>
        
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    description: {
      color: 'gray',
      fontSize: 14,
      fontStyle: 'italic',
      flex: 1,
      marginRight: 10,
    },
    taskCard: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      marginBottom: 10,
    },
    taskText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'black',
    },
    navBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 20,
      borderTopWidth: 1,
      borderColor: 'gray',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'black',
    },
    backButton: {
      backgroundColor: 'gray',
      borderRadius: 10,
      padding: 15,
      alignItems: 'center',
      position: 'absolute',
      bottom: 30,
      left: 20,
      right: 20,
    },
    backText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
});