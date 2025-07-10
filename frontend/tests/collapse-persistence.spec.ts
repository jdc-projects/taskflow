import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, getDeleteButton, expandSection, waitForAnimations, TEST_TASKS } from './test-utils';

test.describe('TaskFlow App - Collapse State Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should persist default collapse states after reload', async ({ page }) => {
    // Add and complete a task
    await addTask(page, TEST_TASKS.first);
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    
    // Verify completed section shows (1) and is collapsed by default
    await expect(page.getByText('Completed (1)')).toBeVisible();
    await expect(page.getByText(TEST_TASKS.first)).not.toBeVisible();
    
    // Wait for debounced localStorage save
    await page.waitForTimeout(500);
    
    // Reload the page
    await page.reload();
    
    // After reload, completed section should maintain default state (collapsed) 
    await expect(page.getByText('Completed (1)')).toBeVisible();
    await expect(page.getByText(TEST_TASKS.first)).not.toBeVisible();
    
    // Verify localStorage has correct default states
    const collapseStates = await page.evaluate(() => 
      localStorage.getItem('taskflow-collapse-states')
    );
    expect(JSON.parse(collapseStates || '{}')).toEqual({
      active: true,
      completed: false,
      deleted: false
    });
  });

  test('should expand and collapse sections while maintaining state', async ({ page }) => {
    // Add and delete a task
    await addTask(page, TEST_TASKS.second);
    await getDeleteButton(page).click();
    await waitForAnimations(page);
    
    // Verify deleted section shows (1) and is collapsed by default
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    await expect(page.getByText(TEST_TASKS.second)).not.toBeVisible();
    
    // Expand the deleted section
    await expandSection(page, 'Deleted', 1);
    await expect(page.getByText(TEST_TASKS.second)).toBeVisible();
    
    // Click to collapse the section again
    await page.getByText('Deleted (1)').click();
    await waitForAnimations(page);
    
    // Task should not be visible again
    await expect(page.getByText(TEST_TASKS.second)).not.toBeVisible();
    
    // Reload - should maintain default collapsed state
    await page.reload();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    await expect(page.getByText(TEST_TASKS.second)).not.toBeVisible();
  });

  test('should maintain active section as open by default', async ({ page }) => {
    // Add tasks to verify active section stays open
    await addTask(page, TEST_TASKS.first);
    await addTask(page, TEST_TASKS.second);
    
    // Both tasks should be visible in the active section (which is open by default)
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible();
    await expect(page.getByText(TEST_TASKS.second)).toBeVisible();
    
    // Wait for debounced localStorage save
    await page.waitForTimeout(500);
    
    // Reload page
    await page.reload();
    
    // Tasks should still be visible (active section remains open)
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible();
    await expect(page.getByText(TEST_TASKS.second)).toBeVisible();
    
    // Verify localStorage maintains active section as open
    const collapseStates = await page.evaluate(() => 
      localStorage.getItem('taskflow-collapse-states')
    );
    const states = JSON.parse(collapseStates || '{}');
    expect(states.active).toBe(true);
  });
});