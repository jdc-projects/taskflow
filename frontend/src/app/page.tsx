'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Stack, Paper, Group, ActionIcon, Text, Divider } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
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
              todos.map((todo, index) => (
                <div key={todo.id}>
                  <TodoItem
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                  />
                  {index < todos.length - 1 && <Divider my="sm" />}
                </div>
              ))
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
