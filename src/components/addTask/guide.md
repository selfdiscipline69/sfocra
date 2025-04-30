Read file: src/components/addTask/CustomTaskSelector.tsx
# Task Management Application Component Guide

This README provides a comprehensive overview of the key files involved in the task selection and management functionality of the application. It's designed to help you quickly locate where to make changes to components like the task selection pop-up windows.

## Key Files and Their Functions

### 1. `src/components/addTask/CustomTaskSelector.tsx`

**Primary function:** This component handles the selection UI for creating custom tasks with three interconnected selection buttons (category, task, intensity).

**Key features:**
- Contains the actual **pop-up modals** for selecting categories, tasks, and intensities
- Implements the button disabling logic (task button disabled until category selected, intensity disabled until task selected)
- Reads data from TaskLibrary.json to populate the selections
- Uses three separate modal windows that appear when clicking the respective buttons

**When to edit this file:**
- To modify the appearance of the selection buttons or modals
- To change how the selection options are displayed
- To adjust modal animations or behaviors
- To modify how task details are loaded and displayed

### 2. `src/screens/HomepageScreen.tsx`

**Primary function:** The main screen that integrates all components and manages the state and data flow.

**Key features:**
- Contains the main "Add Task" modal that includes both suggested tasks and the custom task selector
- Manages the overall task state and communicates with storage
- Handles task completion, cancellation and timer functionality
- Integrates the `CustomTaskSelector` component

**When to edit this file:**
- To change the main "Add Task" modal behavior or appearance
- To modify how task data flows between components
- To adjust how the application responds to task selections
- To change what happens after a task is added

### 3. `src/utils/taskAdditionUtils.ts`

**Primary function:** Utility functions for adding tasks to the application.

**Key features:**
- Provides the `addCustomTask` function that processes task selections
- Handles the creation of new task objects
- Manages AsyncStorage interactions for saving tasks
- Validates task data before saving

**When to edit this file:**
- To change how tasks are formatted and saved
- To modify validation logic for tasks
- To adjust how task categories and colors are assigned
- To change AsyncStorage interactions related to task creation

### 4. `src/components/AdditionalTaskDisplay.tsx`

**Primary function:** Component that displays additional (custom) tasks and handles their interactions.

**Key features:**
- Renders the list of additional tasks on the homepage
- Provides swipe-to-complete and swipe-to-cancel functionality
- Supports timer via long press functionality
- Displays task information including categories

**When to edit this file:**
- To change how tasks appear on the homepage
- To modify the swipe actions or animations
- To adjust task interaction behaviors
- To change the visual styling of tasks

### 5. `src/utils/taskCategoryUtils.ts`

**Primary function:** Utility functions for working with task categories and TaskLibrary data.

**Key features:**
- Provides functions to get tasks by category
- Gets available intensities for tasks
- Formats task names and details
- Determines task categories

**When to edit this file:**
- To modify how task categories are determined
- To change task formatting logic
- To adjust how the application interacts with TaskLibrary data
- To fix category-related issues

### 6. `src/utils/StorageUtils.ts`

**Primary function:** Handles all AsyncStorage interactions for persisting application data.

**Key features:**
- Provides functions to save and retrieve tasks
- Manages user data, preferences, and achievements
- Handles task completion records
- Normalizes categories for consistency

**When to edit this file:**
- To change how data is persisted
- To modify storage keys or data structures
- To adjust how task completion is recorded
- To fix storage-related issues

## Pop-up Window Modals Overview

If you want to edit the pop-up window modals for selecting tasks, categories, or intensities:

1. **Main "Add Task" modal:** Located in `HomepageScreen.tsx` (around line 435)
   - This is the first modal that opens when adding a task
   - Contains both the suggested random task and the custom task selection UI

2. **Category/Task/Intensity selection modals:** Located in `CustomTaskSelector.tsx` (around line 155)
   - These are the three individual selection modals that appear when clicking the respective buttons
   - Each modal shows options based on previous selections
   - Contains the implementation of the cascading selection logic

3. **Selection buttons:** Located in `CustomTaskSelector.tsx` (around line 108)
   - These are the three buttons that trigger the selection modals
   - Implement the disabled state logic based on previous selections

## Task Data Flow

1. User opens main modal in `HomepageScreen.tsx`
2. User interacts with `CustomTaskSelector` component
3. Selections are stored in state in `HomepageScreen.tsx`
4. When user confirms, data is passed to `addCustomTask` in `taskAdditionUtils.ts`
5. Task is saved to storage and added to the tasks list
6. Task appears in `AdditionalTaskDisplay` component

This should help you locate where to make changes to the task selection pop-up windows and related functionality.
