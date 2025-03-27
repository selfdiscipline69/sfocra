import { TaskItem, WeeklyTrialItem } from '../types/TaskTypes';

/**
 * Updates a weekly trial task with a selected image
 */
export const updateWeeklyTrialWithImage = (
  selectedImage: string,
  weeklyTrial: WeeklyTrialItem,
  setWeeklyTrial: React.Dispatch<React.SetStateAction<WeeklyTrialItem>>,
  saveTasksFn: () => Promise<void>
): void => {
  setWeeklyTrial(prev => ({ 
    ...prev, 
    image: selectedImage,
    completed: true,
    showImage: false // Default to hidden
  }));
  
  // Save tasks after updating
  saveTasksFn();
};

/**
 * Updates a daily task with a selected image
 */
export const updateDailyTaskWithImage = (
  selectedImage: string,
  index: number,
  tasks: TaskItem[],
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
  saveTasksFn: () => Promise<void>
): void => {
  const updatedTasks = [...tasks];
  if (updatedTasks[index]) {
    updatedTasks[index] = { 
      ...updatedTasks[index], 
      image: selectedImage,
      completed: true,
      showImage: false // Default to hidden
    };
    setTasks(updatedTasks);
    
    // Save tasks after updating
    saveTasksFn();
  }
};

/**
 * Updates an additional task with a selected image
 */
export const updateAdditionalTaskWithImage = (
  selectedImage: string,
  index: number,
  additionalTasks: TaskItem[],
  setAdditionalTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
  saveTasksFn: () => Promise<void>
): void => {
  const updated = [...additionalTasks];
  if (updated[index]) {
    updated[index] = { 
      ...updated[index], 
      image: selectedImage,
      completed: true,
      showImage: false // Default to hidden
    };
    setAdditionalTasks(updated);
    
    // Save tasks after updating
    saveTasksFn();
  }
};