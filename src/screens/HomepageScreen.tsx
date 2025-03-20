import React from 'react';
import { 
  View, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  StyleSheet, 
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

// Custom hooks
import useHomepageData from '../hooks/useHomepageData';
import { useTheme } from '../context/ThemeContext';

// Components
import ProfileSection from '../components/ProfileSection';
import DailyQuote from '../components/DailyQuote';
import WeeklyTrialSection from '../components/WeeklyTrialSection';
import DailyTaskInput from '../components/DailyTaskInput';
import AdditionalTaskDisplay from '../components/AdditionalTaskDisplay';
import BottomNavigation from '../components/BottomNavigation';

const { width } = Dimensions.get('window');

const HomepageScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { userData, content, actions } = useHomepageData();
  
  // Fix the infinite loop by using a ref to track if we've loaded data
  const dataLoadedRef = React.useRef(false);
  
  useFocusEffect(
    React.useCallback(() => {
      // Only reload data if we haven't already or if returning to the screen
      if (!dataLoadedRef.current) {
        console.log("Homepage focused - reloading data");
        actions.refreshData();
        dataLoadedRef.current = true;
      }
      return () => {
        // When screen loses focus, allow data to be reloaded next time
        dataLoadedRef.current = false;
      };
    }, [actions.refreshData]) // Only include the stable refreshData function
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
    >
      <View style={styles.innerContainer}>
        {/* Header with Profile and Quote */}
        <View style={styles.header}>
          <DailyQuote quote={content.dailyQuote} theme={theme} />
          
          <View style={styles.headerButtons}>
            <ProfileSection 
              profileImage={userData.profileImage} 
              userHandle={userData.userHandle}
              theme={theme}
            />
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true} 
          scrollEnabled={true}
          style={styles.scrollView}
        >
          <View style={styles.spacerView} />
          
          {/* Weekly Trial Section */}
          <WeeklyTrialSection 
            weeklyTrial={content.weeklyTrial} 
            theme={theme} 
          />

          {/* Daily Tasks */}
          <DailyTaskInput 
            tasks={content.dailyTasks} 
            onChangeTask={actions.handleTaskChange}
            theme={theme}
          />
          
          {/* Additional Tasks */}
          <AdditionalTaskDisplay 
            tasks={content.additionalTasks}
            theme={theme}
          />
          
          {/* Extra space at bottom for keyboard */}
          <View style={styles.keyboardSpace} />
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNavigation theme={theme} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 5,
    paddingTop: 20, 
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  headerButtons: {
    alignItems: 'center',
    marginRight: 25,
  },
  content: {
    paddingBottom: 80,
    flexGrow: 1,
  },
  spacerView: {
    height: 30,
  },
  keyboardSpace: {
    height: 100,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
});

export default HomepageScreen;
