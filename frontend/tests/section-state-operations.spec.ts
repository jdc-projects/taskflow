import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, waitForAnimations, expandSection, getDeleteButton, getRestoreButton, getPermanentDeleteButton, TEST_TASKS } from './test-utils';

test.describe('TaskFlow App - Section State During Operations', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should maintain section counts when completing tasks', async ({ page }) => {
    // Add one task and complete it
    await addTask(page, TEST_TASKS.first);
    
    // Verify initial state
    await expect(page.getByText('Active (1)')).toBeVisible();
    await expect(page.getByText('Completed (0)')).toBeVisible();
    
    // Complete the task
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Verify counts updated
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Completed (1)')).toBeVisible();
    
    // Add another task and complete it
    await addTask(page, TEST_TASKS.second);
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Verify both tasks are completed
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Completed (2)')).toBeVisible();
  });

  test('should maintain section counts when deleting tasks', async ({ page }) => {
    // Add one task and delete it
    await addTask(page, TEST_TASKS.first);
    
    // Verify initial state
    await expect(page.getByText('Active (1)')).toBeVisible();
    await expect(page.getByText('Deleted (0)')).toBeVisible();
    
    // Delete the task using delete button
    await getDeleteButton(page).click();
    await waitForAnimations(page);
    
    // Verify counts updated
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Add another task and delete it
    await addTask(page, TEST_TASKS.second);
    await getDeleteButton(page).click();
    await waitForAnimations(page);
    
    // Verify both tasks are deleted
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Deleted (2)')).toBeVisible();
  });

  test('should maintain expanded section state during operations', async ({ page }) => {
    // Add task and complete it
    await addTask(page, TEST_TASKS.first);
    
    // Expand completed section (it should be collapsed by default)
    await expandSection(page, 'Completed', 0);
    
    // Complete task while section is expanded
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Verify completed section remains expanded and shows task
    await expect(page.getByText('Completed (1)')).toBeVisible();
    await expect(page.locator('[data-testid="completed-section"]').getByText(TEST_TASKS.first)).toBeVisible();
  });

  test('should maintain collapsed section state during operations', async ({ page }) => {
    // Add and complete task
    await addTask(page, TEST_TASKS.first);
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Ensure completed section is collapsed (default state)
    await expect(page.getByText('Completed (1)')).toBeVisible();
    // Task should not be visible since section is collapsed
    await expect(page.locator('[data-testid="completed-section"]').getByText(TEST_TASKS.first)).not.toBeVisible();
    
    // Add and complete another task
    await addTask(page, TEST_TASKS.second);
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Section should remain collapsed
    await expect(page.getByText('Completed (2)')).toBeVisible();
    await expect(page.locator('[data-testid="completed-section"]').getByText(TEST_TASKS.second)).not.toBeVisible();
  });

  test('should update section visibility when count changes to zero', async ({ page }) => {
    // Add task
    await addTask(page, TEST_TASKS.first);
    
    // Verify active section is visible
    await expect(page.getByText('Active (1)')).toBeVisible();
    
    // Delete the task (moves to deleted section)
    await getDeleteButton(page).click();
    await waitForAnimations(page);
    
    // Active section should show 0 count
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Restore the task
    await expandSection(page, 'Deleted', 1);
    await getRestoreButton(page).click();
    await waitForAnimations(page);
    
    // Counts should be restored
    await expect(page.getByText('Active (1)')).toBeVisible();
    await expect(page.getByText('Deleted (0)')).toBeVisible();
  });

  test('should handle section state during restore operations', async ({ page }) => {
    // Create workflow: add -> complete -> delete -> restore
    await addTask(page, TEST_TASKS.first);
    
    // Complete task
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Delete completed task
    await expandSection(page, 'Completed', 1);
    await getDeleteButton(page).click();
    await waitForAnimations(page);
    
    // Verify state
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Completed (0)')).toBeVisible();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Restore task
    await expandSection(page, 'Deleted', 1);
    await getRestoreButton(page).click();
    await waitForAnimations(page);
    
    // Task should be restored to completed state
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Completed (1)')).toBeVisible();
    await expect(page.getByText('Deleted (0)')).toBeVisible();
  });

  test('should handle section state during permanent deletion', async ({ page }) => {
    // Add and delete tasks
    await addTask(page, TEST_TASKS.first);
    await addTask(page, TEST_TASKS.second);
    
    // Delete both tasks
    await getDeleteButton(page).first().click();
    await waitForAnimations(page);
    await getDeleteButton(page).first().click();
    await waitForAnimations(page);
    
    // Verify both in deleted section
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Deleted (2)')).toBeVisible();
    
    // Permanently delete one task
    await expandSection(page, 'Deleted', 2);
    await getPermanentDeleteButton(page).first().click();
    await waitForAnimations(page);
    
    // Verify count updated
    await expect(page.getByText('Deleted (1)')).toBeVisible();
  });

  test('should handle section state during bulk operations', async ({ page }) => {
    // Add multiple tasks and delete them
    await addTask(page, TEST_TASKS.first);
    await addTask(page, TEST_TASKS.second);
    await addTask(page, TEST_TASKS.third);
    
    // Delete all tasks
    await getDeleteButton(page).first().click();
    await waitForAnimations(page);
    await getDeleteButton(page).first().click();
    await waitForAnimations(page);
    await getDeleteButton(page).first().click();
    await waitForAnimations(page);
    
    // Verify all in deleted section
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Deleted (3)')).toBeVisible();
    
    // Use bulk delete all deleted
    await expandSection(page, 'Deleted', 3);
    await page.getByRole('button', { name: 'Delete All' }).click();
    await waitForAnimations(page);
    
    // Verify all permanently deleted
    await expect(page.getByText('Deleted (0)')).toBeVisible();
  });

  test('should maintain section state across mixed operations', async ({ page }) => {
    // Create complex workflow
    await addTask(page, TEST_TASKS.first);
    await addTask(page, TEST_TASKS.second);
    await addTask(page, TEST_TASKS.third);
    
    // Complete first task
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').first().click();
    await waitForAnimations(page);
    
    // Delete one active task (one of the remaining two)
    await getDeleteButton(page).first().click();
    await waitForAnimations(page);
    
    // Verify counts: 1 active (third task), 1 completed (first task), 1 deleted (second task)
    await expect(page.getByText('Active (1)')).toBeVisible();
    await expect(page.getByText('Completed (1)')).toBeVisible();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Complete remaining active task
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Final state verification
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Completed (2)')).toBeVisible();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
  });

  test('should maintain section expansion state during page reload', async ({ page }) => {
    // Add and complete some tasks
    await addTask(page, TEST_TASKS.first);
    await addTask(page, TEST_TASKS.second);
    
    // Complete both tasks
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').first().click();
    await waitForAnimations(page);
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').first().click();
    await waitForAnimations(page);
    
    // Expand completed section
    await expandSection(page, 'Completed', 2);
    
    // Verify tasks are visible
    await expect(page.locator('[data-testid="completed-section"]').getByText(TEST_TASKS.first)).toBeVisible();
    await expect(page.locator('[data-testid="completed-section"]').getByText(TEST_TASKS.second)).toBeVisible();
    
    // Reload page
    await page.reload();
    await waitForAnimations(page);
    
    // Completed section should remain expanded (state persisted)
    await expect(page.getByText('Completed (2)')).toBeVisible();
    await expect(page.locator('[data-testid="completed-section"]').getByText(TEST_TASKS.first)).toBeVisible();
    await expect(page.locator('[data-testid="completed-section"]').getByText(TEST_TASKS.second)).toBeVisible();
  });
});