import { useState, useEffect, useCallback } from 'react';
import { Todo } from '@/types/todo';
import { useDebounce } from './useDebounce';
import { validateTaskText, sanitizeTaskText } from '@/utils/validation';
import { validateAndMigrateTodos } from '@/schemas/todo';

const STORAGE_KEY = 'taskflow-todos';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        const validatedTodos = validateAndMigrateTodos(parsedData);
        setTodos(validatedTodos);
      }
    } catch (error) {
      console.error('Failed to load todos from localStorage:', error);
      // If localStorage is corrupted, start with empty array
      setTodos([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Debounced localStorage save function to reduce write frequency during rapid operations
  const saveToStorage = useCallback((todosToSave: Todo[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todosToSave));
    } catch (error) {
      console.error('Failed to save todos to localStorage:', error);
    }
  }, []);

  const debouncedSave = useDebounce(saveToStorage as (...args: unknown[]) => unknown, 300); // 300ms debounce

  useEffect(() => {
    if (isLoaded) {
      debouncedSave(todos);
    }
  }, [todos, isLoaded, debouncedSave]);

  const addTodo = useCallback((text: string) => {
    // Validate and sanitize input
    const validation = validateTaskText(text);
    if (!validation.isValid) {
      console.warn('Invalid task text:', validation.error);
      return;
    }

    const sanitizedText = sanitizeTaskText(text);
    if (!sanitizedText) return;
    
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: sanitizedText,
      completed: false,
      deleted: false,
    };
    setTodos(prev => [newTodo, ...prev]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => {
      const updatedTodos = prev.map(todo => 
        todo.id === id ? { 
          ...todo, 
          completed: !todo.completed,
          completedAt: !todo.completed ? Date.now() : undefined
        } : todo
      );
      
      // If task was uncompleted (marked as incomplete), move to top
      const toggledTodo = updatedTodos.find(todo => todo.id === id);
      if (toggledTodo && !toggledTodo.completed) {
        const otherTodos = updatedTodos.filter(todo => todo.id !== id);
        return [toggledTodo, ...otherTodos];
      }
      
      return updatedTodos;
    });
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { 
        ...todo, 
        deleted: true, 
        deletedAt: Date.now() 
      } : todo
    ));
  }, []);

  const restoreTodo = useCallback((id: string) => {
    setTodos(prev => {
      const updatedTodos = prev.map(todo => 
        todo.id === id ? { 
          ...todo, 
          deleted: false, 
          deletedAt: undefined 
        } : todo
      );
      
      // Move restored incomplete tasks to top, like uncompleted tasks
      const restoredTodo = updatedTodos.find(todo => todo.id === id);
      if (restoredTodo && !restoredTodo.completed) {
        const otherTodos = updatedTodos.filter(todo => todo.id !== id);
        return [restoredTodo, ...otherTodos];
      }
      
      return updatedTodos;
    });
  }, []);

  const permanentDeleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const permanentDeleteAllDeleted = useCallback(() => {
    setTodos(prev => prev.filter(todo => !todo.deleted));
  }, []);

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    restoreTodo,
    permanentDeleteTodo,
    permanentDeleteAllDeleted,
  };
}