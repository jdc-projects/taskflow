'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Stack, Paper, Group, ActionIcon, Text, Divider } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
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
  
  // Persistent collapse state
  const [collapseStates, setCollapseStates] = useState({
    active: true,
    completed: false,
    deleted: false
  });

  useEffect(() => {
    setMounted(true);
    
    // Load collapse states from localStorage
    try {
      const stored = localStorage.getItem('taskflow-collapse-states');
      if (stored) {
        const loadedStates = JSON.parse(stored);
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
        localStorage.setItem('taskflow-collapse-states', JSON.stringify(collapseStates));
      } catch (error) {
        console.error('Failed to save collapse states to localStorage:', error);
      }
    }
  }, [collapseStates, mounted]);


  // Single animation duration for consistency
  const animationDuration = 0.3;
  
  // Animation for items with layoutId for cross-section movement
  const itemAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: animationDuration }
  };

  // Simple section computation
  const incompleteTasks = todos.filter(todo => !todo.completed && !todo.deleted);
  const completedTasks = todos.filter(todo => todo.completed && !todo.deleted)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  const deletedTasks = todos.filter(todo => todo.deleted)
    .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
  
  // Toggle functions for each section
  const toggleActiveSection = () => {
    setCollapseStates(prev => ({ ...prev, active: !prev.active }));
  };
  
  const toggleCompletedSection = () => {
    setCollapseStates(prev => ({ ...prev, completed: !prev.completed }));
  };
  
  const toggleDeletedSection = () => {
    setCollapseStates(prev => ({ ...prev, deleted: !prev.deleted }));
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
        
        <LayoutGroup>
          <Stack gap="md">
            {/* Active Tasks */}
            <motion.div 
              layout
              transition={{ type: "spring", bounce: 0, duration: animationDuration }}
            >
              <Paper withBorder p="md" radius="md">
                <CollapsibleSection
                  title="Active"
                  count={incompleteTasks.length}
                  data-testid="active-section"
                  emptyMessage="No tasks yet. Add one above!"
                  onToggle={toggleActiveSection}
                  initialOpen={collapseStates.active}
                >
                  <Stack gap={0}>
                    <AnimatePresence>
                      {incompleteTasks.map((todo, index) => (
                        <motion.div
                          key={todo.id}
                          layoutId={todo.id}
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
                  </Stack>
                </CollapsibleSection>
              </Paper>
            </motion.div>

            {/* Completed Tasks */}
            <motion.div 
              layout
              transition={{ type: "spring", bounce: 0, duration: animationDuration }}
            >
              <Paper withBorder p="md" radius="md">
                <CollapsibleSection
                  title="Completed"
                  count={completedTasks.length}
                  data-testid="completed-section"
                  emptyMessage="No completed tasks yet"
                  onToggle={toggleCompletedSection}
                  initialOpen={collapseStates.completed}
                >
                  <Stack gap={0}>
                    <AnimatePresence>
                      {completedTasks.map((todo, index) => (
                        <motion.div
                          key={todo.id}
                          layoutId={todo.id}
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
            </motion.div>

            {/* Deleted Tasks */}
            <motion.div 
              layout
              transition={{ type: "spring", bounce: 0, duration: animationDuration }}
            >
              <Paper withBorder p="md" radius="md">
                <CollapsibleSection
                  title="Deleted"
                  count={deletedTasks.length}
                  showBulkDelete={true}
                  onBulkDelete={permanentDeleteAllDeleted}
                  emptyMessage="No deleted tasks"
                  onToggle={toggleDeletedSection}
                  initialOpen={collapseStates.deleted}
                >
                  <Stack gap={0}>
                    <AnimatePresence>
                      {deletedTasks.map((todo, index) => (
                        <motion.div
                          key={todo.id}
                          layoutId={todo.id}
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
            </motion.div>
          </Stack>
        </LayoutGroup>
      </Stack>
    </Container>
  );
}
