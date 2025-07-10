'use client';

import { Group, Title, ActionIcon } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';

export function AppHeader() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
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
        {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
      </ActionIcon>
    </Group>
  );
}