import { Checkbox, Group, Text, ActionIcon } from '@mantine/core';
import { IconTrash, IconRestore, IconTrashX } from '@tabler/icons-react';
import { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
}

export function TodoItem({ 
  todo, 
  onToggle, 
  onDelete, 
  onRestore, 
  onPermanentDelete 
}: TodoItemProps) {
  return (
    <Group justify="space-between" align="center" py="xs">
      <Group align="center">
        <Checkbox
          checked={todo.completed}
          onChange={() => onToggle?.(todo.id)}
          size="sm"
          disabled={todo.deleted}
        />
        <Text
          size="sm"
          td={todo.completed ? 'line-through' : 'none'}
          c={todo.deleted ? 'red' : todo.completed ? 'dimmed' : 'bright'}
          fw={500}
        >
          {todo.text}
        </Text>
      </Group>
      
      <Group gap="xs">
        {todo.deleted ? (
          <>
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => onRestore?.(todo.id)}
              size="sm"
              data-testid="restore-todo"
            >
              <IconRestore size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => onPermanentDelete?.(todo.id)}
              size="sm"
              data-testid="permanent-delete-todo"
            >
              <IconTrashX size={16} />
            </ActionIcon>
          </>
        ) : (
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => onDelete?.(todo.id)}
            size="sm"
            data-testid="delete-todo"
          >
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </Group>
    </Group>
  );
}