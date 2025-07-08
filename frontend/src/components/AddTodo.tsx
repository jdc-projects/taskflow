import { useState } from 'react';
import { TextInput, Button, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface AddTodoProps {
  onAdd: (text: string) => void;
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Group align="end">
        <TextInput
          placeholder="Add a new task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1 }}
          size="sm"
          fw={500}
        />
        <Button 
          type="submit" 
          size="sm" 
          leftSection={<IconPlus size={16} />}
          disabled={!text.trim()}
        >
          Add
        </Button>
      </Group>
    </form>
  );
}