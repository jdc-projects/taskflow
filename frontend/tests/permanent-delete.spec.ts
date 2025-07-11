import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, getTaskByText, getDeleteButton, getPermanentDeleteButton, expandSection, waitForAnimations, TEST_TASKS, expectTaskVisible, expectSectionCounts, deleteTask, permanentDeleteTask } from './test-utils';

test.describe('TaskFlow App - Permanent Delete Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should permanently delete a single task', async ({ page }) => {
    // Add a task
    await addTask(page, TEST_TASKS.simple);
    
    // Delete the task
    await deleteTask(page);
    await waitForAnimations(page);
    
    // Expand deleted section
    await expandSection(page, 'Deleted', 1);
    
    // Verify task is in deleted section
    await expectTaskVisible(page, TEST_TASKS.simple);
    
    // Permanently delete the task
    await permanentDeleteTask(page);
    await waitForAnimations(page);
    
    // Verify task is completely gone
    await expectTaskVisible(page, TEST_TASKS.simple, false);
    
    // Verify deleted section count is 0
    await expectSectionCounts(page, { deleted: 0 });
  });

  test('should show permanent delete button only for deleted tasks', async ({ page }) => {
    // Add a task
    await addTask(page, TEST_TASKS.simple);
    
    // Verify permanent delete button is not visible for active tasks
    await expect(getPermanentDeleteButton(page)).not.toBeVisible();
    
    // Delete the task
    await deleteTask(page);
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
    const deleteButtons = await page.locator('[data-testid="delete-task"]').all();
    await deleteButtons[0].click();
    await waitForAnimations(page);
    await deleteButtons[1].click();
    await waitForAnimations(page);
    
    // Verify we have 2 deleted tasks
    await expectSectionCounts(page, { deleted: 2 });
    
    // Expand deleted section
    await expandSection(page, 'Deleted', 2);
    
    // Click Delete All button (in the section)
    await page.getByRole('button', { name: 'Delete All' }).first().click();
    await waitForAnimations(page);
    
    // Confirm in modal
    await page.getByRole('button', { name: 'Delete All' }).last().click();
    await waitForAnimations(page);
    
    // Verify all tasks are permanently deleted
    await expectSectionCounts(page, { deleted: 0 });
    await expectTaskVisible(page, TEST_TASKS.first, false);
    await expectTaskVisible(page, TEST_TASKS.second, false);
  });

});