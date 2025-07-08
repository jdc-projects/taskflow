'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Stack, Paper, Group, ActionIcon, Text, Divider } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useTodos } from '@/hooks/useTodos';
import { AddTodo } from '@/components/AddTodo';
import { TodoItem } from '@/components/TodoItem';

export default function Home() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        
        <Paper withBorder p="md" radius="md">
          <Stack gap={0}>
            {todos.length === 0 ? (
              <Text ta="center" c="dimmed" p="xl" fw={500}>
                No tasks yet. Add one above!
              </Text>
            ) : (
              (() => {
                const incompleteTasks = todos.filter(todo => !todo.completed);
                const completedTasks = todos
                  .filter(todo => todo.completed)
                  .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
                const allTasks = [...incompleteTasks, ...completedTasks];
                
                return (
                  <AnimatePresence>
                    {allTasks.map((todo, index) => (
                      <motion.div
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        transition={{ 
                          layout: { duration: 0.3 },
                          opacity: { duration: 0.2 },
                          y: { duration: 0.2 },
                          x: { duration: 0.2 }
                        }}
                      >
                        <TodoItem
                          todo={todo}
                          onToggle={toggleTodo}
                          onDelete={deleteTodo}
                        />
                        {index < allTasks.length - 1 && <Divider my="sm" />}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                );
              })()
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
