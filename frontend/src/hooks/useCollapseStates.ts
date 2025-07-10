import { useState, useEffect, useCallback } from 'react';

export interface CollapseStates {
  active: boolean;
  completed: boolean;
  deleted: boolean;
}

const DEFAULT_COLLAPSE_STATES: CollapseStates = {
  active: true,
  completed: false,
  deleted: false
};

const STORAGE_KEY = 'taskflow-collapse-states';

export function useCollapseStates(initialStates?: Partial<CollapseStates>) {
  const [collapseStates, setCollapseStates] = useState<CollapseStates>({
    ...DEFAULT_COLLAPSE_STATES,
    ...initialStates
  });
  const [mounted, setMounted] = useState(false);

  // Load collapse states from localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const loadedStates = JSON.parse(stored) as Partial<CollapseStates>;
        setCollapseStates(prevStates => ({
          ...prevStates,
          ...loadedStates
        }));
      }
    } catch (error) {
      console.error('Failed to load collapse states from localStorage:', error);
    }
  }, []);

  // Save collapse states to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collapseStates));
      } catch (error) {
        console.error('Failed to save collapse states to localStorage:', error);
      }
    }
  }, [collapseStates, mounted]);

  // Toggle functions for each section (memoized to prevent unnecessary re-renders)
  const toggleActiveSection = useCallback(() => {
    setCollapseStates(prev => ({ ...prev, active: !prev.active }));
  }, []);

  const toggleCompletedSection = useCallback(() => {
    setCollapseStates(prev => ({ ...prev, completed: !prev.completed }));
  }, []);

  const toggleDeletedSection = useCallback(() => {
    setCollapseStates(prev => ({ ...prev, deleted: !prev.deleted }));
  }, []);

  // Generic toggle function for any section
  const toggleSection = useCallback((section: keyof CollapseStates) => {
    setCollapseStates(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // Set specific section state
  const setSectionState = useCallback((section: keyof CollapseStates, state: boolean) => {
    setCollapseStates(prev => ({ ...prev, [section]: state }));
  }, []);

  // Reset all sections to default state
  const resetToDefaults = useCallback(() => {
    setCollapseStates(DEFAULT_COLLAPSE_STATES);
  }, []);

  return {
    collapseStates,
    toggleActiveSection,
    toggleCompletedSection,
    toggleDeletedSection,
    toggleSection,
    setSectionState,
    resetToDefaults,
    mounted
  };
}