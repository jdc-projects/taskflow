'use client';

import { useMemo, useCallback } from 'react';
import { Container, Stack } from '@mantine/core';
import { LayoutGroup } from 'framer-motion';
import { useTodos } from '@/hooks/useTodos';
import { useCollapseStates } from '@/hooks/useCollapseStates';
import { useFocusManagement } from '@/hooks/useFocusManagement';
import { AddTodo } from '@/components/AddTodo';
import { TaskSection } from '@/components/TaskSection';
import { AppHeader } from '@/components/AppHeader';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  const { 
    todos, 
    addTodo, 
    toggleTodo, 
    deleteTodo, 
    restoreTodo, 
    permanentDeleteTodo, 
    permanentDeleteAllDeleted
  } = useTodos();
  
  const {
    collapseStates,
    toggleActiveSection,
    toggleCompletedSection,
    toggleDeletedSection,
    mounted
  } = useCollapseStates();

  const focusManager = useFocusManagement();


  // Single animation duration for consistency
  const animationDuration = 0.3;

  // Enhanced toggle functions with focus management
  const handleToggleTodo = useCallback((id: string) => {
    focusManager.storeFocus();
    toggleTodo(id);
    focusManager.scheduleDelayedFocus(() => {
      focusManager.restoreFocus();
    }, animationDuration);
  }, [toggleTodo, focusManager, animationDuration]);

  const handleDeleteTodo = useCallback((id: string) => {
    focusManager.storeFocus();
    deleteTodo(id);
    focusManager.scheduleDelayedFocus(() => {
      focusManager.focusOnSection('deleted-section');
    }, animationDuration);
  }, [deleteTodo, focusManager, animationDuration]);

  const handleRestoreTodo = useCallback((id: string) => {
    focusManager.storeFocus();
    restoreTodo(id);
    focusManager.scheduleDelayedFocus(() => {
      focusManager.focusOnSection('active-section');
    }, animationDuration);
  }, [restoreTodo, focusManager, animationDuration]);

  const handlePermanentDeleteTodo = useCallback((id: string) => {
    focusManager.storeFocus();
    permanentDeleteTodo(id);
    focusManager.scheduleDelayedFocus(() => {
      focusManager.focusOnSection('deleted-section');
    }, animationDuration);
  }, [permanentDeleteTodo, focusManager, animationDuration]);

  const handlePermanentDeleteAllDeleted = useCallback(() => {
    focusManager.storeFocus();
    permanentDeleteAllDeleted();
    focusManager.scheduleDelayedFocus(() => {
      focusManager.focusOnAddTodo();
    }, animationDuration);
  }, [permanentDeleteAllDeleted, focusManager, animationDuration]);

  // Memoized section computation for performance
  const incompleteTasks = useMemo(() => 
    todos.filter(todo => !todo.completed && !todo.deleted), 
    [todos]
  );
  
  const completedTasks = useMemo(() => 
    todos.filter(todo => todo.completed && !todo.deleted)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0)),
    [todos]
  );
  
  const deletedTasks = useMemo(() => 
    todos.filter(todo => todo.deleted)
      .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0)),
    [todos]
  );
  

  if (!mounted) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Container size="sm" py="xl">
        <Stack gap="md">
          <AppHeader />
          
          <ErrorBoundary>
            <AddTodo onAdd={addTodo} />
          </ErrorBoundary>
          
          <LayoutGroup>
            <Stack gap="md">
              {/* Active Tasks */}
              <TaskSection
                title="Active"
                tasks={incompleteTasks}
                isExpanded={collapseStates.active}
                onToggleExpanded={toggleActiveSection}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
                onRestoreTodo={handleRestoreTodo}
                onPermanentDeleteTodo={handlePermanentDeleteTodo}
                animationDuration={animationDuration}
                testId="active-section"
              />

              {/* Completed Tasks */}
              <TaskSection
                title="Completed"
                tasks={completedTasks}
                isExpanded={collapseStates.completed}
                onToggleExpanded={toggleCompletedSection}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
                onRestoreTodo={handleRestoreTodo}
                onPermanentDeleteTodo={handlePermanentDeleteTodo}
                animationDuration={animationDuration}
                testId="completed-section"
              />

              {/* Deleted Tasks */}
              <TaskSection
                title="Deleted"
                tasks={deletedTasks}
                isExpanded={collapseStates.deleted}
                onToggleExpanded={toggleDeletedSection}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
                onRestoreTodo={handleRestoreTodo}
                onPermanentDeleteTodo={handlePermanentDeleteTodo}
                onPermanentDeleteAll={handlePermanentDeleteAllDeleted}
                animationDuration={animationDuration}
                testId="deleted-section"
              />
            </Stack>
          </LayoutGroup>
        </Stack>
      </Container>
    </ErrorBoundary>
  );
}
