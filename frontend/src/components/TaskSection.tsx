'use client';

import { Paper, Stack, Divider } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { CollapsibleSection } from './CollapsibleSection';
import ErrorBoundary from './ErrorBoundary';

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onRestoreTask: (id: string) => void;
  onPermanentDeleteTask: (id: string) => void;
  onPermanentDeleteAll?: () => void;
  animationDuration: number;
  testId: string;
}

export function TaskSection({
  title,
  tasks,
  isExpanded,
  onToggleExpanded,
  onToggleTask,
  onDeleteTask,
  onRestoreTask,
  onPermanentDeleteTask,
  onPermanentDeleteAll,
  animationDuration,
  testId
}: TaskSectionProps) {
  const itemAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: animationDuration }
  };

  const emptyMessage = title === 'Active' ? 'No tasks yet. Add one above!' : 
                     title === 'Completed' ? 'No completed tasks yet' : 
                     'No deleted tasks';

  return (
    <ErrorBoundary>
      <motion.div 
        layout
        transition={{ type: "spring", bounce: 0, duration: animationDuration }}
      >
        <Paper withBorder p="md" radius="md">
          <CollapsibleSection
            title={title}
            count={tasks.length}
            data-testid={testId}
            emptyMessage={emptyMessage}
            onToggle={onToggleExpanded}
            initialOpen={isExpanded}
            showBulkDelete={title === 'Deleted'}
            onBulkDelete={onPermanentDeleteAll}
          >
            <Stack gap={0}>
              <AnimatePresence>
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    {...itemAnimation}
                  >
                    <TaskItem
                      task={task}
                      onToggle={onToggleTask}
                      onDelete={onDeleteTask}
                      onRestore={onRestoreTask}
                      onPermanentDelete={onPermanentDeleteTask}
                    />
                    {index < tasks.length - 1 && <Divider my="sm" />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          </CollapsibleSection>
        </Paper>
      </motion.div>
    </ErrorBoundary>
  );
}