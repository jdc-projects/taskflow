import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, expandSection, waitForAnimations, TEST_TASKS } from './test-utils';

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
    
    // Delete the task
    await page.locator('[data-testid="active-section"] [data-testid="delete-todo"]').click();
    await waitForAnimations(page);
    
    // Verify counts updated
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Add another task and delete it
    await addTask(page, TEST_TASKS.second);
    await page.locator('[data-testid="active-section"] [data-testid="delete-todo"]').click();
    await waitForAnimations(page);
    
    // Verify both tasks are deleted
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Deleted (2)')).toBeVisible();
  });

  test('should maintain expanded section state during operations', async ({ page }) => {
    // Add and complete a task
    await addTask(page, TEST_TASKS.first);
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Expand completed section
    await expandSection(page, 'Completed', 1);
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible();
    
    // Add another task and complete it while section is expanded
    await addTask(page, TEST_TASKS.second);
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Section should remain expanded and show both tasks
    await expect(page.getByText('Completed (2)')).toBeVisible();
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible();
    await expect(page.getByText(TEST_TASKS.second)).toBeVisible();
  });

  test('should maintain collapsed section state during operations', async ({ page }) => {
    // Add and complete a task (completed section starts collapsed)
    await addTask(page, TEST_TASKS.first);
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Verify completed section is collapsed (task not visible)
    await expect(page.getByText('Completed (1)')).toBeVisible();
    await expect(page.getByText(TEST_TASKS.first)).not.toBeVisible();
    
    // Add another task and complete it
    await addTask(page, TEST_TASKS.second);
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Section should remain collapsed
    await expect(page.getByText('Completed (2)')).toBeVisible();
    await expect(page.getByText(TEST_TASKS.first)).not.toBeVisible();
    await expect(page.getByText(TEST_TASKS.second)).not.toBeVisible();
  });

  test('should update section visibility when count changes to zero', async ({ page }) => {
    // Add and complete a task
    await addTask(page, TEST_TASKS.first);
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Verify completed section shows (1)
    await expect(page.getByText('Completed (1)')).toBeVisible();
    
    // Restore the task back to active
    await expandSection(page, 'Completed', 1);
    await page.locator('[data-testid="completed-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Verify completed section shows (0)
    await expect(page.getByText('Completed (0)')).toBeVisible();
    await expect(page.getByText('Active (1)')).toBeVisible();
  });

  test('should handle section state during restore operations', async ({ page }) => {
    // Add and delete a task
    await addTask(page, TEST_TASKS.first);
    await page.locator('[data-testid="active-section"] [data-testid="delete-todo"]').click();
    await waitForAnimations(page);
    
    // Verify deleted section count
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    await expect(page.getByText('Active (0)')).toBeVisible();
    
    // Expand deleted section
    await expandSection(page, 'Deleted', 1);
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible();
    
    // Restore the task
    await page.locator('[data-testid="restore-todo"]').click();
    await waitForAnimations(page);
    
    // Verify counts updated
    await expect(page.getByText('Active (1)')).toBeVisible();
    await expect(page.getByText('Deleted (0)')).toBeVisible();
    
    // Task should be visible in active section
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible();
  });

  test('should handle section state during permanent deletion', async ({ page }) => {
    // Add and delete one task
    await addTask(page, TEST_TASKS.first);
    await page.locator('[data-testid="active-section"] [data-testid="delete-todo"]').click();
    await waitForAnimations(page);
    
    // Verify deleted section count
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Expand deleted section
    await expandSection(page, 'Deleted', 1);
    
    // Permanently delete the task
    await page.locator('[data-testid="permanent-delete-todo"]').click();
    await waitForAnimations(page);
    
    // Verify count updated
    await expect(page.getByText('Deleted (0)')).toBeVisible();
    
    // No tasks should be visible in deleted section - check for todo items specifically
    const visibleTasks = await page.locator('[data-testid="deleted-section"] [data-testid="todo-item"]').count();
    expect(visibleTasks).toBe(0);
  });

  test('should handle section state during bulk operations', async ({ page }) => {
    // Add one task, delete it, then use bulk delete
    await addTask(page, TEST_TASKS.first);
    await page.locator('[data-testid="active-section"] [data-testid="delete-todo"]').click();
    await waitForAnimations(page);
    
    // Add another task and delete it
    await addTask(page, TEST_TASKS.second);
    await page.locator('[data-testid="active-section"] [data-testid="delete-todo"]').click();
    await waitForAnimations(page);
    
    // Verify deleted section count
    await expect(page.getByText('Deleted (2)')).toBeVisible();
    
    // Expand deleted section
    await expandSection(page, 'Deleted', 2);
    
    // Perform bulk delete
    await page.getByRole('button', { name: 'Delete All' }).first().click();
    await waitForAnimations(page);
    await page.getByRole('button', { name: 'Delete All' }).last().click();
    await waitForAnimations(page);
    
    // Verify section updated to show (0)
    await expect(page.getByText('Deleted (0)')).toBeVisible();
    await expect(page.getByText('Active (0)')).toBeVisible();
  });

  test('should maintain section state across mixed operations', async ({ page }) => {
    // Add one task and complete it
    await addTask(page, TEST_TASKS.first);
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Add another task and delete it
    await addTask(page, TEST_TASKS.second);
    await page.locator('[data-testid="active-section"] [data-testid="delete-todo"]').click();
    await waitForAnimations(page);
    
    // Verify all sections have correct counts
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Completed (1)')).toBeVisible();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Expand completed section and restore task
    await expandSection(page, 'Completed', 1);
    await page.locator('[data-testid="completed-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Verify updated counts
    await expect(page.getByText('Active (1)')).toBeVisible();
    await expect(page.getByText('Completed (0)')).toBeVisible();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Expand deleted section and restore deleted task
    await expandSection(page, 'Deleted', 1);
    await page.locator('[data-testid="restore-todo"]').click();
    await waitForAnimations(page);
    
    // Verify final state - both tasks are now active
    await expect(page.getByText('Active (2)')).toBeVisible();
    await expect(page.getByText('Completed (0)')).toBeVisible();
    await expect(page.getByText('Deleted (0)')).toBeVisible();
  });

  test('should handle section state when operations result in empty sections', async ({ page }) => {
    // Add a single task
    await addTask(page, TEST_TASKS.simple);
    
    // Complete it
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Verify states
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Completed (1)')).toBeVisible();
    
    // Delete the completed task by first restoring then deleting
    await expandSection(page, 'Completed', 1);
    await page.locator('[data-testid="completed-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Now delete it
    await page.locator('[data-testid="active-section"] [data-testid="delete-todo"]').click();
    await waitForAnimations(page);
    
    // Verify states
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Completed (0)')).toBeVisible();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Permanently delete it
    await expandSection(page, 'Deleted', 1);
    await page.locator('[data-testid="permanent-delete-todo"]').click();
    await waitForAnimations(page);
    
    // All sections should show (0)
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Completed (0)')).toBeVisible();
    await expect(page.getByText('Deleted (0)')).toBeVisible();
  });

  test('should maintain section expansion state during page reload', async ({ page }) => {
    // Add and complete one task
    await addTask(page, TEST_TASKS.first);
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Add and complete another task  
    await addTask(page, TEST_TASKS.second);
    await page.locator('[data-testid="active-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Expand completed section
    await expandSection(page, 'Completed', 2);
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible();
    await expect(page.getByText(TEST_TASKS.second)).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Section should remain expanded (expansion state is persisted)
    await expect(page.getByText('Completed (2)')).toBeVisible();
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible();
    await expect(page.getByText(TEST_TASKS.second)).toBeVisible();
    
    // Counts should be preserved
    await expect(page.getByText('Active (0)')).toBeVisible();
    await expect(page.getByText('Completed (2)')).toBeVisible();
    await expect(page.getByText('Deleted (0)')).toBeVisible();
  });
});