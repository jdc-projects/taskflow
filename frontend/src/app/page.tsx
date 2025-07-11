'use client';

import { useMemo, useCallback } from 'react';
import { Container, Stack } from '@mantine/core';
import { LayoutGroup } from 'framer-motion';
import { useTasks } from '@/hooks/useTasks';
import { useCollapseStates } from '@/hooks/useCollapseStates';
import { useFocusManagement } from '@/hooks/useFocusManagement';
import { AddTask } from '@/components/AddTask';
import { TaskSection } from '@/components/TaskSection';
import { AppHeader } from '@/components/AppHeader';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ANIMATION_DURATIONS } from '@/constants/animations';

export default function Home() {
  const { 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask, 
    restoreTask, 
    permanentDeleteTask, 
    permanentDeleteAllDeleted
  } = useTasks();
  
  const {
    collapseStates,
    toggleActiveSection,
    toggleCompletedSection,
    toggleDeletedSection,
    mounted
  } = useCollapseStates();

  const focusManager = useFocusManagement();


  // Enhanced toggle functions with focus management
  const handleToggleTask = useCallback((id: string) => {
    focusManager.storeFocus();
    toggleTask(id);
    focusManager.scheduleDelayedFocus(() => {
      focusManager.restoreFocus();
    }, ANIMATION_DURATIONS.TASK_TRANSITION);
  }, [toggleTask, focusManager]);

  const handleDeleteTask = useCallback((id: string) => {
    focusManager.storeFocus();
    deleteTask(id);
    focusManager.scheduleDelayedFocus(() => {
      focusManager.focusOnSection('deleted-section');
    }, ANIMATION_DURATIONS.TASK_TRANSITION);
  }, [deleteTask, focusManager]);

  const handleRestoreTask = useCallback((id: string) => {
    focusManager.storeFocus();
    restoreTask(id);
    focusManager.scheduleDelayedFocus(() => {
      focusManager.focusOnSection('active-section');
    }, ANIMATION_DURATIONS.TASK_TRANSITION);
  }, [restoreTask, focusManager]);

  const handlePermanentDeleteTask = useCallback((id: string) => {
    focusManager.storeFocus();
    permanentDeleteTask(id);
    focusManager.scheduleDelayedFocus(() => {
      focusManager.focusOnSection('deleted-section');
    }, ANIMATION_DURATIONS.TASK_TRANSITION);
  }, [permanentDeleteTask, focusManager]);

  const handlePermanentDeleteAllDeleted = useCallback(() => {
    focusManager.storeFocus();
    permanentDeleteAllDeleted();
    focusManager.scheduleDelayedFocus(() => {
      focusManager.focusOnAddTask();
    }, ANIMATION_DURATIONS.TASK_TRANSITION);
  }, [permanentDeleteAllDeleted, focusManager]);

  // Memoized section computation for performance
  const incompleteTasks = useMemo(() => 
    tasks.filter(task => !task.completed && !task.deleted), 
    [tasks]
  );
  
  const completedTasks = useMemo(() => 
    tasks.filter(task => task.completed && !task.deleted)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0)),
    [tasks]
  );
  
  const deletedTasks = useMemo(() => 
    tasks.filter(task => task.deleted)
      .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0)),
    [tasks]
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
            <AddTask onAdd={addTask} />
          </ErrorBoundary>
          
          <LayoutGroup>
            <Stack gap="md">
              {/* Active Tasks */}
              <TaskSection
                title="Active"
                tasks={incompleteTasks}
                isExpanded={collapseStates.active}
                onToggleExpanded={toggleActiveSection}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onRestoreTask={handleRestoreTask}
                onPermanentDeleteTask={handlePermanentDeleteTask}
                animationDuration={ANIMATION_DURATIONS.TASK_TRANSITION}
                testId="active-section"
              />

              {/* Completed Tasks */}
              <TaskSection
                title="Completed"
                tasks={completedTasks}
                isExpanded={collapseStates.completed}
                onToggleExpanded={toggleCompletedSection}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onRestoreTask={handleRestoreTask}
                onPermanentDeleteTask={handlePermanentDeleteTask}
                animationDuration={ANIMATION_DURATIONS.TASK_TRANSITION}
                testId="completed-section"
              />

              {/* Deleted Tasks */}
              <TaskSection
                title="Deleted"
                tasks={deletedTasks}
                isExpanded={collapseStates.deleted}
                onToggleExpanded={toggleDeletedSection}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onRestoreTask={handleRestoreTask}
                onPermanentDeleteTask={handlePermanentDeleteTask}
                onPermanentDeleteAll={handlePermanentDeleteAllDeleted}
                animationDuration={ANIMATION_DURATIONS.TASK_TRANSITION}
                testId="deleted-section"
              />
            </Stack>
          </LayoutGroup>
        </Stack>
      </Container>
    </ErrorBoundary>
  );
}
