import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, getTaskByText, getDeleteButton, getPermanentDeleteButton, expandSection, waitForAnimations, TEST_TASKS } from './test-utils';

test.describe('TaskFlow App - Permanent Delete Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should permanently delete a single task', async ({ page }) => {
    // Add a task
    await addTask(page, TEST_TASKS.simple);
    
    // Delete the task
    await getDeleteButton(page).click();
    await waitForAnimations(page);
    
    // Expand deleted section
    await expandSection(page, 'Deleted', 1);
    
    // Verify task is in deleted section
    await expect(getTaskByText(page, TEST_TASKS.simple)).toBeVisible();
    
    // Permanently delete the task
    await getPermanentDeleteButton(page).click();
    await waitForAnimations(page);
    
    // Verify task is completely gone
    await expect(getTaskByText(page, TEST_TASKS.simple)).not.toBeVisible();
    
    // Verify deleted section count is 0
    await expect(page.getByText('Deleted (0)')).toBeVisible();
  });

  test('should show permanent delete button only for deleted tasks', async ({ page }) => {
    // Add a task
    await addTask(page, TEST_TASKS.simple);
    
    // Verify permanent delete button is not visible for active tasks
    await expect(getPermanentDeleteButton(page)).not.toBeVisible();
    
    // Delete the task
    await getDeleteButton(page).click();
    await waitForAnimations(page);
    
    // Expand deleted section and verify permanent delete button is visible
    await expandSection(page, 'Deleted', 1);
    await expect(getPermanentDeleteButton(page)).toBeVisible();
  });
});