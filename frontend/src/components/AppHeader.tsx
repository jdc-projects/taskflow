'use client';

import { Group, Title, ActionIcon } from '@mantine/core';
import { IconSun, IconMoon, IconBrandGithub } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';

export function AppHeader() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group justify="space-between" align="center">
      <Title order={1} c="dimmed">
        TaskFlow
      </Title>
      <Group gap="xs">
        <ActionIcon
          variant="subtle"
          component="a"
          href="https://github.com/jdc-projects/taskflow"
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
          aria-label="View source on GitHub"
          data-testid="github-link"
        >
          <IconBrandGithub size={20} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          onClick={() => toggleColorScheme()}
          size="lg"
          aria-label="Toggle color scheme"
          data-testid="color-scheme-toggle"
        >
          {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </ActionIcon>
      </Group>
    </Group>
  );
}