import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Image,
  Dimensions,
  Platform // Import Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import quotesData from '../assets/Quote.json'; // Import the updated quote data

const { width } = Dimensions.get('window');

// --- Author Image Mapping ---
// Create a map to hold required image assets. This helps with bundling.
// Add entries for all authors as you add their images.
const authorImages: { [key: string]: any } = {
  'socrates': require('../assets/authors/Socrates.png'),
  'plato': require('../assets/authors/Plato.png'), 
  'aristotle': require('../assets/authors/Aristotle.png'),
  'immanuel_kant': require('../assets/authors/Immanuel_Kant.png'),
  'friedrich_nietzsche': require('../assets/authors/friedrich_nietzsche.png'),
  'epictetus': require('../assets/authors/Epictetus.png'),
  'seneca': require('../assets/authors/Seneca.png'),
  'marcus_aurelius': require('../assets/authors/Marcus_Aurelius.png'),
  'default': require('../assets/icons/profile.png') // Make sure you have a default icon
};

// Define the structure of a quote object (matching the updated JSON)
interface Quote {
  quoteText: string;
  author: string;
  origin: string | null; // Origin can be null
  authorImageKey: string;
}

export default function LoadingScreen() {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null); // State to hold the selected quote object
  const [loadingComplete, setLoadingComplete] = useState(false); // State to track loading progress
  const loadingProgress = useRef(new Animated.Value(0)).current; // Animated value for the loading bar width

  // Effect to select a quote and start the loading animation on mount
  useEffect(() => {
    // Select a random quote - This should now work correctly with the structured data
    const randomIndex = Math.floor(Math.random() * quotesData.length);
    // Ensure the selected quote matches the interface
    const selectedQuote: Quote = quotesData[randomIndex]; 
    setQuote(selectedQuote);

    // Start the loading bar animation
    Animated.timing(loadingProgress, {
      toValue: 1, // Animate to 1 (representing 100%)
      duration: 1500, // Keep 1.5 seconds duration
      useNativeDriver: false, // width animation is not supported by native driver
    }).start(() => {
      // Set loading complete state to true when animation finishes
      setLoadingComplete(true);
    });
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handler to navigate to the homepage
  const handleContinue = () => {
    if (loadingComplete) {
      router.replace('/(tabs)/homepage'); // Navigate to homepage
    }
  };

  // Interpolate the animated value to actual width percentage
  const loadingBarWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'], // Map 0 to 0% width, 1 to 100% width
  });

  // Get the image source using the map, fall back to default if key not found
  const imageSource = quote ? (authorImages[quote.authorImageKey] || authorImages['default']) : authorImages['default'];

  if (!quote) {
    // Optional: Show a minimal loader while the quote is being set initially
    return <View style={styles.container}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  return (
    // Wrap the screen in TouchableOpacity to allow tapping anywhere
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1} 
      onPress={handleContinue}
    >
      <View style={styles.content}>
        {/* Author Image Frame */}
        <View style={styles.imageFrame}>
          {/* Load the image dynamically */}
          <Image source={imageSource} style={styles.authorImage} /> 
        </View>

        {/* Quote Text Area */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>"{quote.quoteText}"</Text>
          {/* Display Author and Origin */}
          <Text style={styles.authorText}>
            — {quote.author}{quote.origin ? ` (${quote.origin})` : ''} —
          </Text>
        </View>
      </View>

      {/* Loading Animation / Continue Text */}
      <View style={styles.loadingContainer}>
        {loadingComplete ? (
          // Show "Tap to continue" text when loading is complete
          <Text style={styles.continueText}>Tap anywhere to continue, Hero.</Text>
        ) : (
          // Show the loading bar animation while loading
          <View style={styles.loadingBarBackground}>
            <Animated.View style={[styles.loadingBarFill, { width: loadingBarWidth }]} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// --- Updated Font Names ---
// Use the specific font names. Note that React Native might require slightly different
// naming conventions depending on how the font files are structured internally (PostScript name).
// Check Expo Fonts documentation or use a tool to find the exact name if these don't work.
const regularFont = Platform.OS === 'ios' ? 'TTOctosquaresCompressedTrial-Lt' : 'TT Octosquares Trial Compressed Light';
const italicFont = Platform.OS === 'ios' ? 'TTOctosquaresCompressedTrial-LtIt' : 'TT Octosquares Trial Compressed Light Italic';

// Styles for the Loading Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Dark background
    justifyContent: 'space-between', // Pushes content to top and loading to bottom
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1, // Takes up available space in the middle
    justifyContent: 'center', // Centers the image and quote vertically
    alignItems: 'center',
    width: '100%',
  },
  imageFrame: {
    width: 150,
    height: 150,
    borderRadius: 75, // Make it circular
    backgroundColor: '#333', // Placeholder background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: '#555',
    overflow: 'hidden', // Ensures the image stays within bounds if you add one
  },
  authorImage: { 
     width: '100%',
     height: '100%',
     resizeMode: 'cover', // Ensure the image covers the frame
  },
  quoteContainer: {
    backgroundColor: '#000', // Black background for the quote area
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: width - 60, // Adjust width as needed
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  quoteText: {
    fontFamily: regularFont, // Use the new font name
    fontSize: 18,
    color: '#fff', // White text
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 26,
  },
  authorText: {
    fontFamily: italicFont, // Use the new italic font name
    fontSize: 16,
    color: '#ccc', // Lighter grey for author
    textAlign: 'center',
  },
  loadingContainer: {
    height: 50, // Fixed height for the loading area
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20, // Add some padding at the bottom
  },
  loadingBarBackground: {
    height: 10,
    width: '80%',
    backgroundColor: '#444', // Background of the loading bar
    borderRadius: 5,
    overflow: 'hidden', // Clip the fill bar
  },
  loadingBarFill: {
    height: '100%',
    backgroundColor: 'red', // Color of the filling bar
    borderRadius: 5,
  },
  continueText: {
    fontFamily: regularFont, // Use the new font name
    fontSize: 16,
    color: '#aaa',
    fontStyle: 'italic', // Keep italic style if desired, even with non-italic font
  },
  loadingText: { // Style for initial loading text if needed
    color: 'white',
    fontSize: 18,
    fontFamily: regularFont, // Use the new font name
  },
});

// --- IMPORTANT ---
// Ensure you have linked the fonts correctly in your project (e.g., via react-native.config.js or expo config).
// Add a default avatar image at 'assets/icons/default-avatar.png' or change the path. 