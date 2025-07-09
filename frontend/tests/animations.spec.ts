import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, getTaskByText, getTaskCheckbox, expandSection, waitForAnimations, TEST_TASKS } from './test-utils';

test.describe('TaskFlow App - Animations', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should animate task movements', async ({ page }) => {
    // Add a task
    await addTask(page, TEST_TASKS.animated);
    
    // Verify task is initially visible
    await expect(getTaskByText(page, TEST_TASKS.animated)).toBeVisible();
    
    // Complete the task
    await getTaskCheckbox(page, 0).click();
    
    // Wait for animation to complete
    await waitForAnimations(page);
    
    // Expand completed section to verify task moved there
    await expandSection(page, 'Completed', 1);
    
    // Task should be visible in completed section with line-through
    await expect(getTaskByText(page, TEST_TASKS.animated)).toBeVisible();
    await expect(getTaskByText(page, TEST_TASKS.animated)).toHaveCSS('text-decoration-line', 'line-through');
  });
});