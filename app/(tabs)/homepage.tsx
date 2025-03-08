import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import quotesData from '../../assets/Quote.json';

export default function Homepage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userChoices, setUserChoices] = useState({
    question1: null,
    question2: null,
    question3: null,
    question4: null,
  });
  const [dailyQuotes, setDailyQuotes] = useState(['', '', '', '', '']);

  // Function to load user choices from AsyncStorage
  const loadUserChoices = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedPassword = await AsyncStorage.getItem('userPassword');
      if (storedEmail !== null) setEmail(storedEmail);
      if (storedPassword !== null) setPassword(storedPassword);
      const question1Choice = await AsyncStorage.getItem('question1Choice');
      const question2Choice = await AsyncStorage.getItem('question2Choice');
      const question3Choice = await AsyncStorage.getItem('question3Choice');
      const question4Choice = await AsyncStorage.getItem('question4Choice');

      setUserChoices({
        question1: question1Choice,
        question2: question2Choice,
        question3: question3Choice,
        question4: question4Choice,
      });
    } catch (err) {
      console.error('Error loading user choices:', err);
    }
  };

  // Function to load quotes
  const loadQuotes = async () => {
    try {
      // Extract 5 random quotes from the data
      const randomQuotes = [];
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * quotesData.length);
        const randomQuote = quotesData[randomIndex];
        
        // Extract the quote text from the object
        if (randomQuote && randomQuote.quote) {
          randomQuotes.push(randomQuote.quote);
        } else {
          randomQuotes.push("Quote not available");
        }
      }
      
      setDailyQuotes(randomQuotes);
    } catch (err) {
      console.error('Error loading quotes:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      // Set default quotes in case of error
      setDailyQuotes([
        "The unexamined life is not worth living - Socrates",
        "We are what we repeatedly do. Excellence, then, is not an act, but a habit - Aristotle",
        "You have power over your mind - not outside events. Realize this, and you will find strength - Marcus Aurelius",
        "The soul becomes dyed with the color of its thoughts - Marcus Aurelius",
        "To live is to suffer, to survive is to find some meaning in the suffering - Friedrich Nietzsche"
      ]);
    }
  };

  // Function to refresh all data
  const handleRefresh = () => {
    loadUserChoices();
    loadQuotes();
  };

  // Load all stored choices from AsyncStorage when component mounts
  useEffect(() => {
    loadUserChoices();
    loadQuotes();
  }, []);

  const handleQuoteChange = (index, newQuote) => {
    const updatedQuotes = [...dailyQuotes];
    updatedQuotes[index] = newQuote;
    setDailyQuotes(updatedQuotes);
  };

  return (
    <View style={styles.container}>
      {/* User Login Info */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoText}>Email: {email}</Text>
        <Text style={styles.userInfoText}>Password: {password}</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.description}>
            A warrior does not wait for the perfect moment; they forge it with their own hands. 
            Every step, every struggle, every victory—this is how legends are made.
          </Text>
        </View>
        <View style={styles.headerButtons}>
          {/* Refresh Button */}
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
            <View style={styles.profileIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Weekly Trial */}
        <View style={styles.optionContainer}>
          <Text style={styles.optionTitle}>Weekly Trial</Text>
          <View style={styles.optionContent}>
            {Object.entries(userChoices).some(([, choice]) => choice) ? (
              Object.entries(userChoices).map(([question, choice]) => (
                choice && (
                  <Text key={question} style={styles.userChoiceText}>
                    {`Q${question.replace('question', '')}: ${choice}`}
                  </Text>
                )
              ))
            ) : (
              <Text style={styles.noChoicesText}>No choices made yet</Text>
            )}
          </View>
        </View>

        {/* Daily Quotes */}
        {dailyQuotes.map((quote, index) => (
          <View key={index} style={styles.optionContainer}>
            <Text style={styles.optionTitle}>Daily Quote</Text>
            <View style={styles.optionContent}>
              <TextInput
                style={styles.quoteInput}
                value={quote}
                onChangeText={(text) => handleQuoteChange(index, text)}
                multiline={true}
                textAlign="center"
                placeholder="Enter a quote"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>
        ))}
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
      
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  userInfoContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  userInfoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  description: {
    color: 'gray',
    fontSize: 14,
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
    paddingBottom: 30,
  },
  optionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  optionContent: {
    padding: 15,
  },
  userChoiceText: {
    fontSize: 16,
    marginVertical: 5,
  },
  noChoicesText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: 'gray',
  },
  quoteInput: {
    fontSize: 16,
    paddingVertical: 10,
    textAlign: 'center',
    color: '#333',
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
  backButton: {
    position: 'absolute',
    bottom: 20,
    right: 150,
    backgroundColor: 'gray',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginRight: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  refreshButtonText: {
    color: 'black',
    fontSize: 16,
  },
});

export const unstable_settings = {
  bottomTabs: {
    tabBarStyle: { display: 'none' },
  },
};