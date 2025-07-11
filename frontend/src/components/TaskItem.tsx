import { Checkbox, Group, Text, ActionIcon } from '@mantine/core';
import { IconTrash, IconRestore, IconTrashX } from '@tabler/icons-react';
import { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
}

export function TaskItem({ 
  task, 
  onToggle, 
  onDelete, 
  onRestore, 
  onPermanentDelete 
}: TaskItemProps) {
  return (
    <Group justify="space-between" align="center" py="xs" data-task-id={task.id} data-testid="task-item">
      <Group align="center">
        <Checkbox
          checked={task.completed}
          onChange={() => onToggle?.(task.id)}
          size="sm"
          disabled={task.deleted}
        />
        <Text
          size="sm"
          td={task.completed ? 'line-through' : 'none'}
          c={task.deleted ? 'red' : task.completed ? 'dimmed' : 'bright'}
          fw={500}
        >
          {task.text}
        </Text>
      </Group>
      
      <Group gap="xs">
        {task.deleted ? (
          <>
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => onRestore?.(task.id)}
              size="sm"
              data-testid="restore-task"
            >
              <IconRestore size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => onPermanentDelete?.(task.id)}
              size="sm"
              data-testid="permanent-delete-task"
            >
              <IconTrashX size={16} />
            </ActionIcon>
          </>
        ) : (
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => onDelete?.(task.id)}
            size="sm"
            data-testid="delete-task"
          >
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </Group>
    </Group>
  );
}