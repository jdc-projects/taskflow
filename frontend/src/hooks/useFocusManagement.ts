import { useRef, useCallback } from 'react';
import { getFocusDelay } from '@/constants/animations';

export interface FocusManager {
  // Store the currently focused element before an operation
  storeFocus: () => void;
  // Restore focus to a similar element after an operation
  restoreFocus: () => void;
  // Focus on a specific task item by ID
  focusOnTask: (taskId: string) => void;
  // Focus on the next available element in a section
  focusOnSection: (sectionId: string, fallbackToHeader?: boolean) => void;
  // Focus on the add task input
  focusOnAddTask: () => void;
  // Schedule focus action with animation delay (skips in test environment)
  scheduleDelayedFocus: (action: () => void, animationDuration: number) => void;
}

export function useFocusManagement(): FocusManager {
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const lastFocusedTaskId = useRef<string | null>(null);

  const storeFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    lastFocusedElement.current = activeElement;
    
    // If focused on a task item, store its ID for later restoration
    const taskItem = activeElement.closest('[data-task-id]');
    if (taskItem) {
      lastFocusedTaskId.current = taskItem.getAttribute('data-task-id');
    } else {
      lastFocusedTaskId.current = null;
    }
  }, []);

  const restoreFocus = useCallback(() => {
    // First try to restore focus to the same task item if it still exists
    if (lastFocusedTaskId.current) {
      const taskElement = document.querySelector(`[data-task-id="${lastFocusedTaskId.current}"]`);
      if (taskElement) {
        const focusableElement = taskElement.querySelector('input, button, [tabindex]:not([tabindex="-1"])') as HTMLElement;
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

    // Final fallback: focus on add task input
    const addTaskInput = document.querySelector('input[placeholder*="Add"], input[placeholder*="task"], input[type="text"]') as HTMLElement;
    if (addTaskInput) {
      addTaskInput.focus();
    }
  }, []);

  const focusOnTask = useCallback((taskId: string) => {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      const focusableElement = taskElement.querySelector('input, button, [tabindex]:not([tabindex="-1"])') as HTMLElement;
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

    // Final fallback: focus on add task input
    const addTaskInput = document.querySelector('input[placeholder*="Add"], input[placeholder*="task"], input[type="text"]') as HTMLElement;
    if (addTaskInput) {
      addTaskInput.focus();
    }
  }, []);

  const focusOnAddTask = useCallback(() => {
    const addTaskInput = document.querySelector('input[placeholder*="Add"], input[placeholder*="task"], input[type="text"]') as HTMLElement;
    if (addTaskInput) {
      addTaskInput.focus();
    }
  }, []);

  const scheduleDelayedFocus = useCallback((action: () => void, animationDuration: number) => {
    // Skip delayed focus in test environment
    if (!process.env.NODE_ENV?.includes('test')) {
      setTimeout(action, getFocusDelay(animationDuration));
    }
  }, []);

  return {
    storeFocus,
    restoreFocus,
    focusOnTask,
    focusOnSection,
    focusOnAddTask,
    scheduleDelayedFocus
  };
}