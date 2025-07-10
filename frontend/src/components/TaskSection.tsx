'use client';

import { Paper, Stack, Divider } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { Todo } from '@/types/todo';
import { TodoItem } from './TodoItem';
import { CollapsibleSection } from './CollapsibleSection';
import ErrorBoundary from './ErrorBoundary';

interface TaskSectionProps {
  title: string;
  tasks: Todo[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onRestoreTodo: (id: string) => void;
  onPermanentDeleteTodo: (id: string) => void;
  onPermanentDeleteAll?: () => void;
  animationDuration: number;
  testId: string;
}

export function TaskSection({
  title,
  tasks,
  isExpanded,
  onToggleExpanded,
  onToggleTodo,
  onDeleteTodo,
  onRestoreTodo,
  onPermanentDeleteTodo,
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
                {tasks.map((todo, index) => (
                  <motion.div
                    key={todo.id}
                    layoutId={todo.id}
                    {...itemAnimation}
                  >
                    <TodoItem
                      todo={todo}
                      onToggle={onToggleTodo}
                      onDelete={onDeleteTodo}
                      onRestore={onRestoreTodo}
                      onPermanentDelete={onPermanentDeleteTodo}
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