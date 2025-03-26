import { AdditionalTask } from './UserTypes';
import { TaskItem } from './TaskTypes';

// Declare that these types are compatible
declare global {
  namespace React {
    interface IntrinsicElements {
      // Add any custom components that might need declaration
    }
  }
}

// Fix the type compatibility issue between AdditionalTask and TaskItem
// Both have the same shape but are defined in different files
declare module './UserTypes' {
  export interface AdditionalTask extends TaskItem {}
} 