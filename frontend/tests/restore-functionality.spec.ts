import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, getTaskByText, getDeleteButton, getRestoreButton, expandSection, waitForAnimations, TEST_TASKS, expectTaskVisible, expectSectionCounts, deleteTask, restoreTask } from './test-utils';

test.describe('TaskFlow App - Restore Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should restore a deleted task', async ({ page }) => {
    // Add a task
    await addTask(page, TEST_TASKS.simple);
    
    // Delete the task
    await deleteTask(page);
    await waitForAnimations(page);
    
    // Expand deleted section
    await expandSection(page, 'Deleted', 1);
    
    // Verify task is in deleted section
    const deletedTask = getTaskByText(page, TEST_TASKS.simple);
    await expectTaskVisible(page, TEST_TASKS.simple);
    await expect(deletedTask).toHaveCSS('color', 'rgb(250, 82, 82)');
    
    // Restore the task
    await restoreTask(page);
    await waitForAnimations(page);
    
    // Verify task is back in active section (Active section should be open by default)
    const restoredTask = getTaskByText(page, TEST_TASKS.simple);
    await expectTaskVisible(page, TEST_TASKS.simple);
    await expect(restoredTask).not.toHaveCSS('color', 'rgb(250, 82, 82)');
    
    // Verify deleted section count is now 0
    await expectSectionCounts(page, { deleted: 0 });
  });

  test('should show restore button only for deleted tasks', async ({ page }) => {
    // Add a task
    await addTask(page, TEST_TASKS.simple);
    
    // Verify restore button is not visible for active tasks
    await expect(getRestoreButton(page)).not.toBeVisible();
    
    // Delete the task
    await deleteTask(page);
    await waitForAnimations(page);
    
    // Expand deleted section and verify restore button is visible
    await expandSection(page, 'Deleted', 1);
    await expect(getRestoreButton(page)).toBeVisible();
  });
});