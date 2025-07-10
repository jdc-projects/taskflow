import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, expandSection, waitForAnimations, TEST_TASKS, expectSectionCounts, expectTaskVisible, completeTask, deleteTask } from './test-utils';

test.describe('TaskFlow App - Restore Completed Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should restore a single completed task to active state', async ({ page }) => {
    // Add and complete a task
    await addTask(page, TEST_TASKS.first);
    await completeTask(page);
    await waitForAnimations(page);
    
    // Verify task is in completed section
    await expectSectionCounts(page, { completed: 1, active: 0 });
    
    // Expand completed section
    await expandSection(page, 'Completed', 1);
    await expectTaskVisible(page, TEST_TASKS.first);
    
    // Uncheck the completed task to restore it
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Verify task is back in active section
    await expectSectionCounts(page, { active: 1, completed: 0 });
    await expectTaskVisible(page, TEST_TASKS.first);
  });

  test('should handle multiple task completion and restoration', async ({ page }) => {
    // Add and complete one task
    await addTask(page, TEST_TASKS.first);
    await completeTask(page);
    await waitForAnimations(page);
    
    // Verify completed
    await expectSectionCounts(page, { completed: 1 });
    
    // Add and complete second task  
    await addTask(page, TEST_TASKS.second);
    await completeTask(page);
    await waitForAnimations(page);
    
    // Verify both completed
    await expectSectionCounts(page, { completed: 2 });
    
    // Restore one task
    await expandSection(page, 'Completed', 2);
    await page.locator('[data-testid="completed-section"] input[type="checkbox"]').first().click();
    await waitForAnimations(page);
    
    // Verify one restored
    await expectSectionCounts(page, { active: 1, completed: 1 });
  });

  test('should maintain task visibility when restoring completed tasks', async ({ page }) => {
    // Add and complete one task
    await addTask(page, TEST_TASKS.first);
    await completeTask(page);
    await waitForAnimations(page);
    
    // Verify completed
    await expectSectionCounts(page, { completed: 1 });
    
    // Add second task (remains active)
    await addTask(page, TEST_TASKS.second);
    
    // Verify state: one active, one completed
    await expectSectionCounts(page, { active: 1, completed: 1 });
    
    // Verify second task is visible in active section
    await expectTaskVisible(page, TEST_TASKS.second);
    
    // Expand completed section and restore the first task
    await expandSection(page, 'Completed', 1);
    await page.locator('[data-testid="completed-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Verify both tasks are now in active section
    await expectSectionCounts(page, { active: 2, completed: 0 });
    await expectTaskVisible(page, TEST_TASKS.first);
    await expectTaskVisible(page, TEST_TASKS.second);
  });

  test('should preserve task content and state when restoring', async ({ page }) => {
    // Add a task with specific content
    const taskContent = 'Task with specific content for restoration test';
    await addTask(page, taskContent);
    
    // Complete the task
    await completeTask(page);
    await waitForAnimations(page);
    
    // Verify task is in completed section with correct content
    await expandSection(page, 'Completed', 1);
    await expectTaskVisible(page, taskContent);
    
    // Restore the task
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Verify task content is preserved in active section
    await expectTaskVisible(page, taskContent);
    await expectSectionCounts(page, { active: 1 });
    
    // Verify checkbox is unchecked in active section
    await expect(page.getByRole('checkbox')).not.toBeChecked();
  });

  test('should handle completion and restoration cycle', async ({ page }) => {
    // Add a task
    await addTask(page, TEST_TASKS.animated);
    
    // Complete task
    await completeTask(page);
    await waitForAnimations(page);
    
    // Verify completed
    await expectSectionCounts(page, { completed: 1, active: 0 });
    
    // Restore task
    await expandSection(page, 'Completed', 1);
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Verify restored
    await expectSectionCounts(page, { active: 1, completed: 0 });
    
    // Complete again
    await completeTask(page);
    await waitForAnimations(page);
    
    // Verify final state
    await expectSectionCounts(page, { completed: 1, active: 0 });
  });

  test('should handle restoration mixed with other operations', async ({ page }) => {
    // Add and complete a task
    await addTask(page, TEST_TASKS.first);
    await completeTask(page);
    await waitForAnimations(page);
    
    // Add another task
    await addTask(page, TEST_TASKS.second);
    
    // Delete the active task
    await deleteTask(page);
    await waitForAnimations(page);
    
    // We should have: Active (0), Completed (1), Deleted (1)
    await expectSectionCounts(page, { active: 0, completed: 1, deleted: 1 });
    
    // Restore the completed task
    await expandSection(page, 'Completed', 1);
    await page.locator('[data-testid="completed-section"] input[type="checkbox"]').click();
    await waitForAnimations(page);
    
    // Verify final state: Active (1), Completed (0), Deleted (1)
    await expect(page.getByText('Active (1)')).toBeVisible();
    await expect(page.getByText('Completed (0)')).toBeVisible();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
  });

  test('should persist restored task state through page reload', async ({ page }) => {
    // Add and complete a task
    await addTask(page, TEST_TASKS.persistent);
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Verify completed
    await expect(page.getByText('Completed (1)')).toBeVisible();
    
    // Restore the task
    await expandSection(page, 'Completed', 1);
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Verify restored to active
    await expect(page.getByText('Active (1)')).toBeVisible();
    await expect(page.getByText('Completed (0)')).toBeVisible();
    
    // Wait for debounced localStorage save
    await page.waitForTimeout(500);
    
    // Reload page
    await page.reload();
    
    // Verify state persisted after reload
    await expect(page.getByText('Active (1)')).toBeVisible();
    await expect(page.getByText('Completed (0)')).toBeVisible();
    await expect(page.getByText(TEST_TASKS.persistent)).toBeVisible();
    
    // Verify checkbox is unchecked
    await expect(page.getByRole('checkbox')).not.toBeChecked();
  });

  test('should handle sequential completion and restoration', async ({ page }) => {
    // Add and complete first task
    await addTask(page, TEST_TASKS.first);
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Add and complete second task
    await addTask(page, TEST_TASKS.second);
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Verify both are completed
    await expect(page.getByText('Completed (2)')).toBeVisible();
    await expect(page.getByText('Active (0)')).toBeVisible();
    
    // Restore one task
    await expandSection(page, 'Completed', 2);
    await page.locator('[data-testid="completed-section"] input[type="checkbox"]').first().click();
    await waitForAnimations(page);
    
    // Verify one task restored
    await expect(page.getByText('Active (1)')).toBeVisible();
    await expect(page.getByText('Completed (1)')).toBeVisible();
  });

  test('should handle edge case of restoring last completed task', async ({ page }) => {
    // Add and complete a single task
    await addTask(page, TEST_TASKS.simple);
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Verify it's the only completed task
    await expect(page.getByText('Completed (1)')).toBeVisible();
    await expect(page.getByText('Active (0)')).toBeVisible();
    
    // Expand and restore the only completed task
    await expandSection(page, 'Completed', 1);
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Verify completed section is now empty
    await expect(page.getByText('Active (1)')).toBeVisible();
    await expect(page.getByText('Completed (0)')).toBeVisible();
    
    // The completed section should collapse or show empty state
    await expect(page.getByText(TEST_TASKS.simple)).toBeVisible();
  });

  test('should maintain checkbox visual state correctly during restoration', async ({ page }) => {
    // Add a task
    await addTask(page, TEST_TASKS.first);
    
    // Verify checkbox starts unchecked
    await expect(page.getByRole('checkbox')).not.toBeChecked();
    
    // Complete the task
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Expand completed section
    await expandSection(page, 'Completed', 1);
    
    // Verify checkbox is checked in completed section
    await expect(page.getByRole('checkbox')).toBeChecked();
    
    // Restore the task
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Verify checkbox is unchecked again in active section
    await expect(page.getByRole('checkbox')).not.toBeChecked();
    
    // Verify task text doesn't have strikethrough
    const taskElement = page.getByText(TEST_TASKS.first);
    await expect(taskElement).toBeVisible();
    await expect(taskElement).not.toHaveCSS('text-decoration-line', 'line-through');
  });
});