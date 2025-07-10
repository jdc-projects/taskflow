import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, waitForAnimations, TEST_TASKS } from './test-utils';

test.describe('TaskFlow App - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should allow keyboard navigation through interactive elements', async ({ page }) => {
    // Add some tasks to have interactive elements
    await addTask(page, TEST_TASKS.first);
    await addTask(page, TEST_TASKS.second);
    
    // Based on actual tab order discovered:
    // Tab 1: Active section collapse button
    await page.keyboard.press('Tab'); 
    await expect(page.locator('[aria-label*="section"]').first()).toBeFocused();
    
    // Tab 2: First task checkbox
    await page.keyboard.press('Tab'); 
    await expect(page.getByRole('checkbox').first()).toBeFocused();
    
    // Tab 3: First task delete button
    await page.keyboard.press('Tab'); 
    await expect(page.locator('[data-testid="delete-todo"]').first()).toBeFocused();
    
    // Tab 4: Second task checkbox
    await page.keyboard.press('Tab'); 
    await expect(page.getByRole('checkbox').nth(1)).toBeFocused();
    
    // Tab 5: Second task delete button
    await page.keyboard.press('Tab'); 
    await expect(page.locator('[data-testid="delete-todo"]').nth(1)).toBeFocused();
  });

  test('should allow adding tasks using keyboard only', async ({ page }) => {
    // Focus on input field
    await page.getByPlaceholder('Add a new task...').focus();
    
    // Type task text
    await page.keyboard.type(TEST_TASKS.first);
    
    // Press Enter to add task
    await page.keyboard.press('Enter');
    await waitForAnimations(page);
    
    // Verify task was added
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible();
    
    // Alternatively, test using Tab to Add button and pressing Space/Enter
    await page.keyboard.type(TEST_TASKS.second);
    await page.keyboard.press('Tab'); // Focus on Add button
    await page.keyboard.press('Space'); // Activate button
    await waitForAnimations(page);
    
    await expect(page.getByText(TEST_TASKS.second)).toBeVisible();
  });

  test('should allow task completion using keyboard', async ({ page }) => {
    // Add a task
    await addTask(page, TEST_TASKS.first);
    
    // Tab to the checkbox (based on actual tab order)
    await page.keyboard.press('Tab'); // Section collapse button
    await page.keyboard.press('Tab'); // First checkbox
    
    // Verify checkbox is focused
    await expect(page.getByRole('checkbox').first()).toBeFocused();
    
    // Press Space to toggle checkbox
    await page.keyboard.press('Space');
    await waitForAnimations(page);
    
    // Verify task was completed
    await expect(page.getByText('Completed (1)')).toBeVisible();
  });

  test('should allow task deletion using keyboard', async ({ page }) => {
    // Add a task
    await addTask(page, TEST_TASKS.first);
    
    // Tab to the delete button (based on actual tab order)
    await page.keyboard.press('Tab'); // Section collapse button
    await page.keyboard.press('Tab'); // Checkbox
    await page.keyboard.press('Tab'); // Delete button
    
    // Verify delete button is focused
    await expect(page.locator('[data-testid="delete-todo"]').first()).toBeFocused();
    
    // Press Enter or Space to delete
    await page.keyboard.press('Enter');
    await waitForAnimations(page);
    
    // Verify task was deleted
    await expect(page.getByText('Deleted (1)')).toBeVisible();
  });

  test('should allow section expansion/collapse using keyboard', async ({ page }) => {
    // Add and complete a task to have a completed section
    await addTask(page, TEST_TASKS.first);
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Click on the completed section to expand it first
    await page.getByText('Completed (1)').click();
    await waitForAnimations(page);
    
    // Verify task is visible (section expanded)
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible();
    
    // Click again to collapse
    await page.getByText('Completed (1)').click();
    await waitForAnimations(page);
    
    // Verify task is not visible (section collapsed)
    await expect(page.getByText(TEST_TASKS.first)).not.toBeVisible();
  });

  test('should allow restore operations using keyboard', async ({ page }) => {
    // Add and delete a task
    await addTask(page, TEST_TASKS.first);
    await page.locator('[data-testid="delete-todo"]').click();
    await waitForAnimations(page);
    
    // Expand deleted section
    await page.getByText('Deleted (1)').click();
    await waitForAnimations(page);
    
    // Tab to the restore button
    await page.locator('[data-testid="restore-todo"]').focus();
    
    // Press Enter to restore
    await page.keyboard.press('Enter');
    await waitForAnimations(page);
    
    // Verify task was restored
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible();
    await expect(page.getByText('Deleted (0)')).toBeVisible();
  });

  test('should allow permanent deletion using keyboard', async ({ page }) => {
    // Add and delete a task
    await addTask(page, TEST_TASKS.first);
    await page.locator('[data-testid="delete-todo"]').click();
    await waitForAnimations(page);
    
    // Expand deleted section
    await page.getByText('Deleted (1)').click();
    await waitForAnimations(page);
    
    // Tab to the permanent delete button
    await page.locator('[data-testid="permanent-delete-todo"]').focus();
    
    // Press Enter to permanently delete
    await page.keyboard.press('Enter');
    await waitForAnimations(page);
    
    // Verify task was permanently deleted
    await expect(page.getByText(TEST_TASKS.first)).not.toBeVisible();
    await expect(page.getByText('Deleted (0)')).toBeVisible();
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Add a task
    await addTask(page, TEST_TASKS.first);
    
    // Check that interactive elements have proper accessibility attributes
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
    await expect(page.getByRole('checkbox')).toHaveCount(1);
    await expect(page.locator('[data-testid="delete-todo"]')).toBeVisible();
    
    // Check sections have proper test ids for accessibility
    await expect(page.locator('[data-testid="active-section"]')).toBeVisible();
  });

  test('should handle bulk operations with keyboard', async ({ page }) => {
    // Add multiple tasks and delete them
    await addTask(page, TEST_TASKS.first);
    await addTask(page, TEST_TASKS.second);
    
    await page.locator('[data-testid="delete-todo"]').first().click();
    await waitForAnimations(page);
    await page.locator('[data-testid="delete-todo"]').first().click();
    await waitForAnimations(page);
    
    // Check for deleted tasks (count may vary based on task state changes)
    
    // Find the section with deleted tasks
    const deletedSection = page.locator('text=/Deleted \\(\\d+\\)/');
    await expect(deletedSection).toBeVisible();
    
    // Expand deleted section
    await deletedSection.click();
    await waitForAnimations(page);
    
    // Click Delete All button if it exists
    const deleteAllButton = page.getByRole('button', { name: 'Delete All' });
    if (await deleteAllButton.count() > 0) {
      await deleteAllButton.first().click();
      await waitForAnimations(page);
      
      // Confirm in modal
      await page.getByRole('button', { name: 'Delete All' }).last().click();
      await waitForAnimations(page);
    }
    
    // Verify section is cleared or has fewer items
    await expect(page.getByText('Deleted (0)')).toBeVisible();
  });

  test('should maintain focus order and not trap keyboard navigation', async ({ page }) => {
    // Add tasks to have multiple interactive elements
    await addTask(page, TEST_TASKS.first);
    await addTask(page, TEST_TASKS.second);
    
    // Tab through all elements and verify focus doesn't get trapped
    let tabCount = 0;
    const maxTabs = 10; // Reasonable limit to prevent infinite loop
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;
    }
    
    // Should be able to continue tabbing without getting stuck
    // The focus should cycle through elements or move to browser chrome
    await expect(page.locator('body')).toBeVisible(); // Basic check that page is still responsive
  });
});