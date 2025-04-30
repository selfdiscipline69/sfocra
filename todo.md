# Task Addition Feature Modification Plan
## Files to Modify
    src/screens/HomepageScreen.tsx
    src/utils/taskAdditionUtils.ts
    src/components/AdditionalTaskDisplay.tsx
    src/utils/StorageUtils.ts
    src/types/UserTypes.ts
    src/utils/taskCategoryUtils.ts

## Requirements Summary
- Keep the "Suggested Task" section unchanged
- Modify the "Create Custom Task" section to use a new UI with buttons for category, task, and intensity
- Read the task_category from TaskLibrary.json for options
- Implement dependencies between selections (disable buttons until prior selections are made)
- Store selections in AsyncStorage
- do not remove any code that you think are unused, just replace the old code that does the same feature
- Add JSDoc Comments to explain the modification with detail

## Detailed Modifications
1. HomepageScreen.tsx
@HomepageScreen.tsx - Replace the "Create Custom Task" section with new UI:

- Keep the suggested random task part intact
- Replace custom task input with three buttons: Category, Task, Intensity
- Each button opens a slider with options from TaskLibrary.json
- Implement button states (disabled/enabled) based on selection state (disable the second, third button and enable the first button as default)
- Add three modal states for category/task/intensity selection
- Update addCustomTask function to work with the new UI components
- Store the selected values in state variables
- Implement new slider component for each selection

2. taskAdditionUtils.ts
@taskAdditionUtils.ts - Update task addition utility:

- Modify addCustomTask function to handle the new structure with category/task/intensity
- Add utility functions to:
  - Read TaskLibrary.json and extract available categories (task_category)
  - Filter tasks based on selected category
  - Filter intensities based on selected task
  - Store all input as string
- Format task text to include intensity information from the selected intensity
- Update the structure of the AdditionalTask object to include new fields
- Implement AsyncStorage saving for new fields (AddTaskCategory, AddTaskIntensity)

3. AdditionalTaskDisplay.tsx
@AdditionalTaskDisplay.tsx - Update to handle new task format:

- Update the display to handle tasks created with the new format
- Ensure component can display tasks with intensity information
- Handle tasks created with either the old or new format for backward compatibility

4. StorageUtils.ts
@StorageUtils.ts - Add storage utilities for new task structure:

- Add functions to save and retrieve:
  - AddTaskCategory
  - AddTaskIntensity
- Update the AdditionalTask handling to include new fields
- Implement migration for existing tasks if needed
- Add type validation for new fields

5. UserTypes.ts
@UserTypes.ts - Update AdditionalTask interface:

- Add new optional fields for:
  - taskKey: string (to store the key from TaskLibrary)
  - intensity: string (to store the selected intensity)
- Ensure backward compatibility with existing tasks
- Update category type to include all possible categories from TaskLibrary.json

6. taskCategoryUtils.ts
@taskCategoryUtils.ts - Enhance category detection:

- Add function to extract available categories from TaskLibrary.json
- Add function to filter tasks by category
- Add function to get intensity options for a task
- Maintain backward compatibility with existing functions
- Add utility to format task display text based on task and intensity

## Implementation Notes
1. Default Values: Set default values to 'general' for categories and appropriate defaults for other fields to prevent errors.
2. Button States:
    Category button: Always enabled
    Task button: Enabled only after category selection
    Intensity button: Enabled only after task selection
3. Sliders: Create reusable slider components for selections that display options from TaskLibrary.json.
4. AsyncStorage Keys:
    AddTaskCategory_${userToken}
    AddTaskTask_${userToken}
    AddTaskIntensity_${userToken}
5. TaskLibrary.json Structure:
    Use the existing structure with categories, tasks, and intensities
    Parse JSON structure to populate UI options dynamically
6. Backward Compatibility:
    Ensure the system works with both old and new task formats
    Provide fallbacks for missing fields

