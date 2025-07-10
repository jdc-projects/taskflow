import { useRef, useCallback } from 'react';

export interface FocusManager {
  // Store the currently focused element before an operation
  storeFocus: () => void;
  // Restore focus to a similar element after an operation
  restoreFocus: () => void;
  // Focus on a specific todo item by ID
  focusOnTodo: (todoId: string) => void;
  // Focus on the next available element in a section
  focusOnSection: (sectionId: string, fallbackToHeader?: boolean) => void;
  // Focus on the add todo input
  focusOnAddTodo: () => void;
  // Schedule focus action with animation delay (skips in test environment)
  scheduleDelayedFocus: (action: () => void, animationDuration: number) => void;
}

export function useFocusManagement(): FocusManager {
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const lastFocusedTodoId = useRef<string | null>(null);

  const storeFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    lastFocusedElement.current = activeElement;
    
    // If focused on a todo item, store its ID for later restoration
    const todoItem = activeElement.closest('[data-todo-id]');
    if (todoItem) {
      lastFocusedTodoId.current = todoItem.getAttribute('data-todo-id');
    } else {
      lastFocusedTodoId.current = null;
    }
  }, []);

  const restoreFocus = useCallback(() => {
    // First try to restore focus to the same todo item if it still exists
    if (lastFocusedTodoId.current) {
      const todoElement = document.querySelector(`[data-todo-id="${lastFocusedTodoId.current}"]`);
      if (todoElement) {
        const focusableElement = todoElement.querySelector('input, button, [tabindex]:not([tabindex="-1"])') as HTMLElement;
        if (focusableElement) {
          focusableElement.focus();
          return;
        }
      }
    }

    // If that fails, try to restore to the last focused element
    if (lastFocusedElement.current && document.contains(lastFocusedElement.current)) {
      try {
        lastFocusedElement.current.focus();
        return;
      } catch (error) {
        console.debug('Could not restore focus to last focused element:', error);
      }
    }

    // Final fallback: focus on add todo input
    const addTodoInput = document.querySelector('input[placeholder*="Add"], input[placeholder*="task"], input[type="text"]') as HTMLElement;
    if (addTodoInput) {
      addTodoInput.focus();
    }
  }, []);

  const focusOnTodo = useCallback((todoId: string) => {
    const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`);
    if (todoElement) {
      const focusableElement = todoElement.querySelector('input, button, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      if (focusableElement) {
        focusableElement.focus();
      }
    }
  }, []);

  const focusOnSection = useCallback((sectionId: string, fallbackToHeader = true) => {
    // Try to focus on the first focusable element in the section
    const section = document.querySelector(`[data-testid="${sectionId}"]`);
    if (section) {
      const focusableElement = section.querySelector('input, button, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      if (focusableElement) {
        focusableElement.focus();
        return;
      }
      
      // If no focusable elements and fallback is enabled, focus on section header
      if (fallbackToHeader) {
        const sectionHeader = section.querySelector('[role="button"], button, [tabindex="0"]') as HTMLElement;
        if (sectionHeader) {
          sectionHeader.focus();
          return;
        }
      }
    }

    // Final fallback: focus on add todo input
    const addTodoInput = document.querySelector('input[placeholder*="Add"], input[placeholder*="task"], input[type="text"]') as HTMLElement;
    if (addTodoInput) {
      addTodoInput.focus();
    }
  }, []);

  const focusOnAddTodo = useCallback(() => {
    const addTodoInput = document.querySelector('input[placeholder*="Add"], input[placeholder*="task"], input[type="text"]') as HTMLElement;
    if (addTodoInput) {
      addTodoInput.focus();
    }
  }, []);

  const scheduleDelayedFocus = useCallback((action: () => void, animationDuration: number) => {
    // Skip delayed focus in test environment
    if (!process.env.NODE_ENV?.includes('test')) {
      setTimeout(action, animationDuration * 1000 + 100);
    }
  }, []);

  return {
    storeFocus,
    restoreFocus,
    focusOnTodo,
    focusOnSection,
    focusOnAddTodo,
    scheduleDelayedFocus
  };
}