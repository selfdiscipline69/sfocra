import { TaskItem, WeeklyTrialItem } from '../types/TaskTypes';

/**
 * Updates task state with a selected image based on task type
 * 
 * @param type The type of task ('weekly', 'daily', or 'additional')
 * @param selectedImage The URI of the selected image
 * @param index The index of the task (for daily or additional tasks)
 * @param state The current state objects and setters
 * @param saveTasksFn Function to save tasks after updating
 */
export const updateTaskWithImage = (
  type: string,
  selectedImage: string,
  index?: number,
  state: {
    weeklyTrial: WeeklyTrialItem,
    setWeeklyTrial: React.Dispatch<React.SetStateAction<WeeklyTrialItem>>,
    tasks: TaskItem[],
    setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
    additionalTasks: TaskItem[],
    setAdditionalTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
  },
  saveTasksFn: () => Promise<void>
): void => {
  if (type === 'weekly') {
    state.setWeeklyTrial(prev => ({ 
      ...prev, 
      image: selectedImage,
      completed: true,
      showImage: false // Default to hidden
    }));
  } else if (type === 'daily' && typeof index === 'number') {
    const updatedTasks = [...state.tasks];
    updatedTasks[index] = { 
      ...updatedTasks[index], 
      image: selectedImage,
      completed: true,
      showImage: false // Default to hidden
    };
    state.setTasks(updatedTasks);
  } else if (type === 'additional' && typeof index === 'number') {
    const updated = [...state.additionalTasks];
    updated[index] = { 
      ...updated[index], 
      image: selectedImage,
      completed: true,
      showImage: false // Default to hidden
    };
    state.setAdditionalTasks(updated);
  }
  
  // Save all tasks after updating
  saveTasksFn();
};