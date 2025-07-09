import { test, expect } from '@playwright/test';
import { navigateToApp, addTasks, TEST_TASKS, SELECTORS } from './test-utils';

test.describe('TaskFlow App - UI & Visual', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should show empty state when no tasks', async ({ page }) => {
    await expect(page.getByText(SELECTORS.emptyState)).toBeVisible();
  });

  test('should toggle color scheme', async ({ page }) => {
    // Check initial light mode
    await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'light');
    
    // Click color scheme toggle
    await page.getByRole('button', { name: 'Toggle color scheme' }).click();
    
    // Check dark mode is applied
    await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark');
  });

  test('should show dividers between tasks', async ({ page }) => {
    // Add multiple tasks
    const tasks = [TEST_TASKS.first, TEST_TASKS.second, TEST_TASKS.third];
    await addTasks(page, tasks);
    
    // Check for dividers between tasks (Mantine Divider component)
    const dividers = page.locator('[data-orientation="horizontal"]');
    await expect(dividers).toHaveCount(2); // 3 tasks = 2 dividers
  });
});