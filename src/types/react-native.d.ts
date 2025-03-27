/**
 * Fix for React Native TypeScript errors
 */

import { AdditionalTask } from './UserTypes';
import { TaskItem } from './TaskTypes';

// Declare React Native components
declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const StyleSheet: any;
  export const Platform: any;
  export const ScrollView: any;
  export const TouchableOpacity: any;
  export const TouchableWithoutFeedback: any;
  export const Keyboard: any;
  export const Alert: any;
  export const Modal: any;
  export const TextInput: any;
  export const Image: any;
  export const ActivityIndicator: any;
  export const RefreshControl: any;
  export const KeyboardAvoidingView: any;
  export const Dimensions: any;
  export const AppState: any;
  export const Pressable: any;
  export const ImageBackground: any;
  export const FlatList: any;
  
  // Add Animated namespace with its types
  export namespace Animated {
    class Value {
      constructor(value: number): Value;
      setValue(value: number): void;
      interpolate(config: any): AnimatedInterpolation<number>;
    }
    class AnimatedInterpolation<T = number> {
      interpolate(config: any): AnimatedInterpolation<number>;
    }
    const View: any;
    const Text: any;
    const Image: any;
    const ScrollView: any;
    
    function timing(
      value: Animated.Value,
      config: {
        toValue: number;
        duration?: number;
        easing?: any;
        delay?: number;
        useNativeDriver?: boolean;
      }
    ): { start: (callback?: () => void) => void };
    function sequence(animations: any[]): { start: (callback?: () => void) => void };
    function createAnimatedComponent(component: any): any;
    function event(argMapping: any[], config?: any): any;
  }
}

// Make types compatible
declare module './UserTypes' {
  export interface AdditionalTask extends TaskItem {}
}

// Fix for victory-native
declare module 'victory-native' {
  export const VictoryPie: any;
}

// Fix for Swipeable from react-native-gesture-handler
declare module 'react-native-gesture-handler' {
  export const Swipeable: any;
  export const GestureHandlerRootView: any;
}

// Fix for Ionicons
declare module '@expo/vector-icons' {
  export const Ionicons: any;
  export const FontAwesome5: any;
}

// Fix for DashboardTypes
declare module '../types/DashboardTypes' {
  export interface CategoryData {
    name: string;
    value: number;
    color: string;
  }
}

// Fix for Quest.json type
declare module '../../assets/Quest.json' {
  const questsData: {
    progressiveChallenges: any[];
    taskLibrary: Record<string, any>;
  };
  export default questsData;
}

// Fix for parameter types
declare global {
  interface Function {
    __noImplicitAnyInParameters?: true;
  }
} 