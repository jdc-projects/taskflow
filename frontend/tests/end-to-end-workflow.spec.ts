import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, getDeleteButton, getRestoreButton, getPermanentDeleteButton, expandSection, waitForAnimations, TEST_TASKS, expectTaskVisible, expectSectionCounts, completeTask, deleteTask, restoreTask, permanentDeleteTask } from './test-utils';

test.describe('TaskFlow App - End-to-End Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should handle task creation, completion, and restore workflow', async ({ page }) => {
    // Create task
    await addTask(page, TEST_TASKS.persistent);
    await expectTaskVisible(page, TEST_TASKS.persistent);
    
    // Complete task
    await completeTask(page);
    await waitForAnimations(page);
    
    // Verify task moved to completed section (collapsed by default)
    await expectSectionCounts(page, { completed: 1 });
    await expectTaskVisible(page, TEST_TASKS.persistent, false);
    
    // Uncomplete (restore to active)
    await expandSection(page, 'Completed', 1);
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Verify task back in active section
    await expectTaskVisible(page, TEST_TASKS.persistent);
    await expectSectionCounts(page, { completed: 0 });
  });

  test('should handle task deletion and restoration workflow', async ({ page }) => {
    // Create task
    await addTask(page, TEST_TASKS.persistent);
    await expectTaskVisible(page, TEST_TASKS.persistent);
    
    // Delete task
    await deleteTask(page);
    await waitForAnimations(page);
    
    // Verify task moved to deleted section
    await expectSectionCounts(page, { deleted: 1 });
    await expectTaskVisible(page, TEST_TASKS.persistent, false);
    
    // Restore from deleted
    await expandSection(page, 'Deleted', 1);
    await expectTaskVisible(page, TEST_TASKS.persistent);
    await restoreTask(page);
    await waitForAnimations(page);
    
    // Verify task back in active section
    await expectTaskVisible(page, TEST_TASKS.persistent);
    await expectSectionCounts(page, { deleted: 0 });
  });

  test('should handle permanent deletion workflow', async ({ page }) => {
    // Create and delete task
    await addTask(page, TEST_TASKS.persistent);
    await deleteTask(page);
    await waitForAnimations(page);
    
    // Verify in deleted section
    await expectSectionCounts(page, { deleted: 1 });
    
    // Permanently delete
    await expandSection(page, 'Deleted', 1);
    await permanentDeleteTask(page);
    await waitForAnimations(page);
    
    // Verify task is completely gone
    await expectTaskVisible(page, TEST_TASKS.persistent, false);
    await expectSectionCounts(page, { deleted: 0 });
  });

  test('should maintain state consistency through page reload', async ({ page }) => {
    // Simple workflow: create task, delete it, reload
    await addTask(page, TEST_TASKS.first);
    await expectTaskVisible(page, TEST_TASKS.first);
    
    // Delete task
    await deleteTask(page);
    await waitForAnimations(page);
    
    // Verify deleted
    await expectSectionCounts(page, { deleted: 1, active: 0 });
    
    // Wait for debounced localStorage save
    await page.waitForTimeout(500);
    
    // Reload page
    await page.reload();
    
    // Verify state persisted
    await expectSectionCounts(page, { deleted: 1, active: 0 });
    
    // Verify task is in deleted section
    await expandSection(page, 'Deleted', 1);
    await expectTaskVisible(page, TEST_TASKS.first);
  });
});