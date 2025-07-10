import { useState } from 'react';
import { Group, Text, ActionIcon, Stack, Button, Box } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { AnimatePresence, motion } from 'framer-motion';
import { ANIMATION_DURATIONS } from '@/constants/animations';

interface CollapsibleSectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
  showBulkDelete?: boolean;
  onBulkDelete?: () => void;
  'data-testid'?: string;
  emptyMessage?: string;
  onToggle?: (isOpen: boolean) => void;
  initialOpen?: boolean;
}

export function CollapsibleSection({ 
  title, 
  count, 
  children, 
  showBulkDelete = false, 
  onBulkDelete,
  'data-testid': dataTestId,
  emptyMessage = "Nothing here yet",
  onToggle,
  initialOpen = false
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const handleBulkDelete = () => {
    modals.openConfirmModal({
      title: 'Delete All Items',
      children: (
        <Text size="sm">
          Are you sure you want to permanently delete all {count} items? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete All', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => onBulkDelete?.(),
    });
  };

  // Always show the section, even when empty

  return (
    <Stack gap={0} data-testid={dataTestId}>
      <Group justify="space-between" align="center" py="xs">
        <Group 
          gap="xs" 
          style={{ cursor: 'pointer' }}
          onClick={() => {
            const newState = !isOpen;
            setIsOpen(newState);
            onToggle?.(newState);
          }}
        >
          <ActionIcon 
            variant="subtle" 
            size="sm"
            aria-label={isOpen ? 'Collapse section' : 'Expand section'}
          >
            {isOpen ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          </ActionIcon>
          <Text size="sm" fw={500} c="dimmed">
            {title} ({count})
          </Text>
        </Group>
        
        {showBulkDelete && isOpen && count > 0 && (
          <Button
            variant="subtle"
            color="red"
            size="xs"
            leftSection={<IconTrash size={14} />}
            onClick={handleBulkDelete}
          >
            Delete All
          </Button>
        )}
      </Group>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: ANIMATION_DURATIONS.SECTION_TOGGLE }}
          >
            <Box pl="md">
              {count === 0 ? (
                <Text ta="center" c="dimmed" p="md" fw={500}>
                  {emptyMessage}
                </Text>
              ) : (
                children
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
}