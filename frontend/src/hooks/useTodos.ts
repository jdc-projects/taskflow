import { useState, useEffect, useCallback } from 'react';
import { Todo } from '@/types/todo';

const STORAGE_KEY = 'taskflow-todos';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTodos(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load todos from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } catch (error) {
        console.error('Failed to save todos to localStorage:', error);
      }
    }
  }, [todos, isLoaded]);

  const addTodo = useCallback((text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    
    const newTodo: Todo = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: trimmedText,
      completed: false,
    };
    setTodos(prev => [...prev, newTodo]);
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
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}