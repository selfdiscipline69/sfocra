import { TaskItem, WeeklyTrialItem } from '../types/TaskTypes';

/**
 * Toggles the visibility of an image for a specific task
 * 
 * @param type The type of task ('weekly', 'daily', or 'additional')
 * @param index The optional index of the task (required for daily and additional tasks)
 * @param state Object containing the current state values and setter functions
 */
export const toggleImageVisibility = (
  type: string, 
  index?: number,
  state: {
    weeklyTrial: WeeklyTrialItem,
    setWeeklyTrial: React.Dispatch<React.SetStateAction<WeeklyTrialItem>>,
    tasks: TaskItem[],
    setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
    additionalTasks: TaskItem[],
    setAdditionalTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
  }
): void => {
  if (type === 'weekly') {
    state.setWeeklyTrial(prev => ({
      ...prev,
      showImage: !prev.showImage
    }));
  } else if (type === 'daily' && typeof index === 'number') {
    const updatedTasks = [...state.tasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      showImage: !updatedTasks[index].showImage
    };
    state.setTasks(updatedTasks);
  } else if (type === 'additional' && typeof index === 'number') {
    const updated = [...state.additionalTasks];
    updated[index] = {
      ...updated[index],
      showImage: !updated[index].showImage
    };
    state.setAdditionalTasks(updated);
  }
};