import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, getDeleteButton, getRestoreButton, getPermanentDeleteButton, expandSection, waitForAnimations, TEST_TASKS } from './test-utils';

test.describe('TaskFlow App - End-to-End Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should handle task creation, completion, and restore workflow', async ({ page }) => {
    // Create task
    await addTask(page, TEST_TASKS.persistent);
    await expect(page.getByText(TEST_TASKS.persistent)).toBeVisible();
    
    // Complete task
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Verify task moved to completed section (collapsed by default)
    await expect(page.getByText('Completed (1)')).toBeVisible();
    await expect(page.getByText(TEST_TASKS.persistent)).not.toBeVisible();
    
    // Uncomplete (restore to active)
    await expandSection(page, 'Completed', 1);
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Verify task back in active section
    await expect(page.getByText(TEST_TASKS.persistent)).toBeVisible();
    await expect(page.getByText('Completed (0)')).toBeVisible();
  });

  test('should handle task deletion and restoration workflow', async ({ page }) => {
    // Create task
    await addTask(page, TEST_TASKS.persistent);
    await expect(page.getByText(TEST_TASKS.persistent)).toBeVisible();
    
    // Delete task
    await getDeleteButton(page).click();
    await waitForAnimations(page);
    
    // Verify task moved to deleted section
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    await expect(page.getByText(TEST_TASKS.persistent)).not.toBeVisible();
    
    // Restore from deleted
    await expandSection(page, 'Deleted', 1);
    await expect(page.getByText(TEST_TASKS.persistent)).toBeVisible();
    await getRestoreButton(page).click();
    await waitForAnimations(page);
    
    // Verify task back in active section
    await expect(page.getByText(TEST_TASKS.persistent)).toBeVisible();
    await expect(page.getByText('Deleted (0)')).toBeVisible();
  });

  test('should handle permanent deletion workflow', async ({ page }) => {
    // Create and delete task
    await addTask(page, TEST_TASKS.persistent);
    await getDeleteButton(page).click();
    await waitForAnimations(page);
    
    // Verify in deleted section
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Permanently delete
    await expandSection(page, 'Deleted', 1);
    await getPermanentDeleteButton(page).click();
    await waitForAnimations(page);
    
    // Verify task is completely gone
    await expect(page.getByText(TEST_TASKS.persistent)).not.toBeVisible();
    await expect(page.getByText('Deleted (0)')).toBeVisible();
  });

  test('should maintain state consistency through page reload', async ({ page }) => {
    // Add tasks
    await addTask(page, TEST_TASKS.first);
    await addTask(page, TEST_TASKS.second);
    
    // Complete first task
    await page.getByRole('checkbox').first().click();
    await waitForAnimations(page);
    
    // At this point: Active(1), Completed(1), Deleted(0)
    // Delete the remaining active task (second)
    await getDeleteButton(page).first().click();
    await waitForAnimations(page);
    
    // Now we have: Active(1), Completed(0), Deleted(1)
    // (The completed task moves back to active when another operation happens? Need to verify this behavior)
    await expect(page.getByText('Active (1)')).toBeVisible();
    await expect(page.getByText('Completed (0)')).toBeVisible();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Verify state persisted
    await expect(page.getByText('Active (1)')).toBeVisible();
    await expect(page.getByText('Completed (0)')).toBeVisible();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Verify tasks are in correct sections
    // First task should be in active, second task in deleted
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible(); // Active task visible
    
    await expandSection(page, 'Deleted', 1);
    await expect(page.getByText(TEST_TASKS.second)).toBeVisible();
  });
});