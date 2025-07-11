import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/task';
import { useDebounce } from './useDebounce';
import { validateTaskText, sanitizeTaskText } from '@/utils/validation';
import { validateAndMigrateTasks } from '@/schemas/task';

const STORAGE_KEY = 'taskflow-tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        const validatedTasks = validateAndMigrateTasks(parsedData);
        setTasks(validatedTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error);
      // If localStorage is corrupted, start with empty array
      setTasks([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Debounced localStorage save function to reduce write frequency during rapid operations
  const saveToStorage = useCallback((tasksToSave: Task[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error);
    }
  }, []);

  const debouncedSave = useDebounce(saveToStorage as (...args: unknown[]) => unknown, 300); // 300ms debounce

  useEffect(() => {
    if (isLoaded) {
      debouncedSave(tasks);
    }
  }, [tasks, isLoaded, debouncedSave]);

  const addTask = useCallback((text: string) => {
    // Validate and sanitize input
    const validation = validateTaskText(text);
    if (!validation.isValid) {
      console.warn('Invalid task text:', validation.error);
      return;
    }

    const sanitizedText = sanitizeTaskText(text);
    if (!sanitizedText) return;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: sanitizedText,
      completed: false,
      deleted: false,
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => 
        task.id === id ? { 
          ...task, 
          completed: !task.completed,
          completedAt: !task.completed ? Date.now() : undefined
        } : task
      );
      
      // If task was uncompleted (marked as incomplete), move to top
      const toggledTask = updatedTasks.find(task => task.id === id);
      if (toggledTask && !toggledTask.completed) {
        const otherTasks = updatedTasks.filter(task => task.id !== id);
        return [toggledTask, ...otherTasks];
      }
      
      return updatedTasks;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { 
        ...task, 
        deleted: true, 
        deletedAt: Date.now() 
      } : task
    ));
  }, []);

  const restoreTask = useCallback((id: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => 
        task.id === id ? { 
          ...task, 
          deleted: false, 
          deletedAt: undefined 
        } : task
      );
      
      // Move restored incomplete tasks to top, like uncompleted tasks
      const restoredTask = updatedTasks.find(task => task.id === id);
      if (restoredTask && !restoredTask.completed) {
        const otherTasks = updatedTasks.filter(task => task.id !== id);
        return [restoredTask, ...otherTasks];
      }
      
      return updatedTasks;
    });
  }, []);

  const permanentDeleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const permanentDeleteAllDeleted = useCallback(() => {
    setTasks(prev => prev.filter(task => !task.deleted));
  }, []);

  return {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    restoreTask,
    permanentDeleteTask,
    permanentDeleteAllDeleted,
  };
}