'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Stack, Paper, Group, ActionIcon, Text, Divider } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useTodos } from '@/hooks/useTodos';
import { AddTodo } from '@/components/AddTodo';
import { TodoItem } from '@/components/TodoItem';
import { CollapsibleSection } from '@/components/CollapsibleSection';

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
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Single, consistent animation for all items
  const itemAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={1} c="dimmed">
            TaskFlow
          </Title>
          <ActionIcon
            variant="subtle"
            onClick={() => toggleColorScheme()}
            size="lg"
            aria-label="Toggle color scheme"
          >
            {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Group>
        
        <AddTodo onAdd={addTodo} />
        
        <Stack gap="md">
          {(() => {
            const incompleteTasks = todos.filter(todo => !todo.completed && !todo.deleted);
            const completedTasks = todos
              .filter(todo => todo.completed && !todo.deleted)
              .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
            const deletedTasks = todos
              .filter(todo => todo.deleted)
              .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
            
            return (
              <>
                {/* Incomplete Tasks */}
                <Paper withBorder p="md" radius="md">
                  <Stack gap={0}>
                    {incompleteTasks.length === 0 ? (
                      <Text ta="center" c="dimmed" p="xl" fw={500}>
                        No tasks yet. Add one above!
                      </Text>
                    ) : (
                      <AnimatePresence>
                        {incompleteTasks.map((todo, index) => (
                          <motion.div
                            key={todo.id}
                            layout
                            {...itemAnimation}
                          >
                            <TodoItem
                              todo={todo}
                              onToggle={toggleTodo}
                              onDelete={deleteTodo}
                            />
                            {index < incompleteTasks.length - 1 && <Divider my="sm" />}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </Stack>
                </Paper>

                {/* Completed Tasks */}
                <Paper withBorder p="md" radius="md">
                  <CollapsibleSection
                    title="Completed"
                    count={completedTasks.length}
                    data-testid="completed-section"
                    emptyMessage="No completed tasks yet"
                    onToggle={() => {}}
                    initialOpen={false}
                  >
                    <Stack gap={0}>
                      <AnimatePresence>
                        {completedTasks.map((todo, index) => (
                          <motion.div
                            key={todo.id}
                            layout
                            {...itemAnimation}
                          >
                            <TodoItem
                              todo={todo}
                              onToggle={toggleTodo}
                              onDelete={deleteTodo}
                            />
                            {index < completedTasks.length - 1 && <Divider my="sm" />}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </Stack>
                  </CollapsibleSection>
                </Paper>

                {/* Deleted Tasks */}
                <Paper withBorder p="md" radius="md">
                  <CollapsibleSection
                    title="Deleted"
                    count={deletedTasks.length}
                    showBulkDelete={true}
                    onBulkDelete={permanentDeleteAllDeleted}
                    emptyMessage="No deleted tasks"
                    onToggle={() => {}}
                    initialOpen={false}
                  >
                    <Stack gap={0}>
                      <AnimatePresence>
                        {deletedTasks.map((todo, index) => (
                          <motion.div
                            key={todo.id}
                            layout
                            {...itemAnimation}
                          >
                            <TodoItem
                              todo={todo}
                              onToggle={toggleTodo}
                              onRestore={restoreTodo}
                              onPermanentDelete={permanentDeleteTodo}
                            />
                            {index < deletedTasks.length - 1 && <Divider my="sm" />}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </Stack>
                  </CollapsibleSection>
                </Paper>
              </>
            );
          })()}
        </Stack>
      </Stack>
    </Container>
  );
}
