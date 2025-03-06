import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PerformanceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Performance Page - Graphs & Analytics</Text>
    </View>
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
  });