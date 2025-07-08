import { Checkbox, Group, Text, ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <Group justify="space-between" align="center" py="xs">
      <Group align="center">
        <Checkbox
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          size="sm"
        />
        <Text
          size="sm"
          td={todo.completed ? 'line-through' : 'none'}
          c={todo.completed ? 'dimmed' : 'bright'}
          fw={500}
        >
          {todo.text}
        </Text>
      </Group>
      <ActionIcon
        variant="subtle"
        color="red"
        onClick={() => onDelete(todo.id)}
        size="sm"
        data-testid="delete-todo"
      >
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  );
}