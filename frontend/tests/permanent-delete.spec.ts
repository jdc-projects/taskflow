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

  test('should bulk delete all tasks in deleted section', async ({ page }) => {
    // Add multiple tasks
    await addTask(page, TEST_TASKS.first);
    await addTask(page, TEST_TASKS.second);
    await waitForAnimations(page);
    
    // Delete both tasks
    const deleteButtons = await page.locator('[data-testid="delete-todo"]').all();
    await deleteButtons[0].click();
    await waitForAnimations(page);
    await deleteButtons[1].click();
    await waitForAnimations(page);
    
    // Verify we have 2 deleted tasks
    await expect(page.getByText('Deleted (2)')).toBeVisible();
    
    // Expand deleted section
    await expandSection(page, 'Deleted', 2);
    
    // Click Delete All button (in the section)
    await page.getByRole('button', { name: 'Delete All' }).first().click();
    await waitForAnimations(page);
    
    // Confirm in modal
    await page.getByRole('button', { name: 'Delete All' }).last().click();
    await waitForAnimations(page);
    
    // Verify all tasks are permanently deleted
    await expect(page.getByText('Deleted (0)')).toBeVisible();
    await expect(getTaskByText(page, TEST_TASKS.first)).not.toBeVisible();
    await expect(getTaskByText(page, TEST_TASKS.second)).not.toBeVisible();
  });

});