# Task Management System Refactoring: To-Do List

## Overview
This document outlines the steps needed to implement a unified task display system with enhanced data fields and two new modal components: the Task Box Modal and Edit Task Modal. These changes will standardize the UI for both daily and additional tasks while expanding functionality.

## Data Structure Updates

### 1. Update UserTypes.ts
```
- Create a unified TaskData interface that includes:
  - id: string
  - category: string
  - taskName: string
  - intensity: string (duration)
  - is_daily: boolean (1 for daily, 0 for additional)
  - XP: number (default 500 for daily, 250 for additional)
  - is_Recurrent: boolean
  - Recurrent_frequency: number[] (7-item array for days of week)
  - start_time: string (format: "HH:MM")
  - note: string
  - status: 'default' | 'completed' | 'canceled' (for daily tasks)
  - completed_at?: number (timestamp)
  - day?: number (account age day)
  
- Update existing Task and AdditionalTask types to either:
  - Extend the unified TaskData interface, or
  - Replace them with the new interface
```

### 2. Update StorageUtils.ts
```
- Modify task storage functions to handle the new data structure
- Add migration utilities for existing task data
- Update getTaskCompletionRecords and saveTaskCompletionRecord to handle additional fields
- Implement functions to convert between the old and new data formats if needed
```

## UI Components

### 3. Create Task_modal/TaskBoxModal.tsx
```
- Create a reusable component that displays:
  - Task type label (top-left)
  - Category animation (top-right)
  - Content section with:
    - Category
    - TaskName
    - Intensity (duration)
    - Recurrent frequency (if applicable)
    - Start time (bottom-left)
  - "Long press to start timer" hint (bottom-right)
  
- Implement:
  - Long press handler for timer
  - Single tap handler for edit modal
  - Swipe actions for task completion/cancellation
```

### 4. Create Task_modal/EditTaskModal.tsx
```
- Create a form modal with FlatList for all editable fields:
  - Category selector (disabled for daily tasks)
  - TaskName/Intensity selector (similar to CustomTaskSelector)
  - Recurrence toggle and day selectors
  - Start time selectors (hour/minute)
  - Note text area
  
- Implement:
  - Loading of TaskLibrary data
  - Filtering tasks by category
  - Saving changes back to storage
  - Form validation
```

### 5. Update DailyTaskInput.tsx
```
- Refactor to use the new TaskBoxModal component
- Map existing Task objects to the new TaskData format
- Maintain existing functionality but delegate UI to TaskBoxModal
- Handle edit actions through EditTaskModal
```

### 6. Update AdditionalTaskDisplay.tsx
```
- Refactor to use the new TaskBoxModal component
- Map existing AdditionalTask objects to the new TaskData format
- Maintain existing functionality but delegate UI to TaskBoxModal
- Handle edit actions through EditTaskModal
```

### 7. Update HomepageScreen.tsx
```
- Integrate the new modals
- Update state management to handle the expanded task data
- Add handlers for edit functionality
- Ensure timer functionality works with new components
- Update refresh logic to account for task edits
```

## Additional Components

### 8. Create Task_modal/RecurrenceSelector.tsx (Optional)
```
- Create a reusable component for selecting recurring days
- Display weekday abbreviations (Mon, Tue, etc.)
- Toggle selection with visual feedback
- Return the 7-item array of selections
```

### 9. Create Task_modal/TimeSelector.tsx (Optional)
```
- Create a reusable component for time selection
- Implement hour and minute pickers
- Format and return time string in "HH:MM" format
```

## Testing and Integration

### 10. Test Migration
```
- Verify existing tasks convert correctly to new format
- Ensure task completion records integrate with new fields
- Check that UI correctly displays all task types
```

### 11. Test Task Box Features
```
- Verify timer functionality works with long press
- Test swipe actions for completion/cancellation
- Confirm recurrence displays correctly
```

### 12. Test Edit Modal
```
- Verify all fields save correctly
- Test TaskLibrary integration
- Check that edits persist across app restarts
```

## Implementation Priority

1. Data structure updates (UserTypes.ts, StorageUtils.ts)
2. Core UI components (TaskBoxModal.tsx)
3. Edit functionality (EditTaskModal.tsx)
4. Integration with existing components
5. Optional selector components
6. Testing and refinement

This approach ensures a smooth transition to the new unified system while maintaining backward compatibility with existing data.


git command:
Here’s a typical Git workflow for creating a feature branch, pushing it up, and then merging it back into `main` when you’re done:

1. Create & switch to your new branch  
```bash
git checkout -b feature/my-new-thing
```

2. Work, then stage & commit your changes  
```bash
git add .
git commit -m "feat: add my new thing"
```

3. Push the branch to origin and set the upstream  
```bash
git push -u origin feature/my-new-thing
```

4. (Optional) Continue working—future `git push` will just do  
```bash
git push
```

5. When you’re ready to merge back into `main`:

   a. Switch to `main` and update it  
   ```bash
   git checkout main
   git pull origin main
   ```

   b. Merge in your feature branch  
   ```bash
   git merge --no-ff feature/my-new-thing
   ```

   c. Push the updated `main`  
   ```bash
   git push origin main
   ```

6. (Optional) Clean up your feature branch locally and remotely  
```bash
git branch -d feature/my-new-thing
git push origin --delete feature/my-new-thing
```
