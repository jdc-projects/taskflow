import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, waitForAnimations, TEST_TASKS, expectTaskVisible, expectSectionCounts, completeTask, deleteTask } from './test-utils';

test.describe('TaskFlow App - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should handle localStorage failures gracefully', async ({ page }) => {
    // Mock localStorage to throw errors
    await page.evaluate(() => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('localStorage quota exceeded');
      };
    });
    
    // Add task - should still work despite localStorage error
    await addTask(page, TEST_TASKS.first);
    await expectTaskVisible(page, TEST_TASKS.first);
    
    // Complete task - should still work
    await completeTask(page);
    await waitForAnimations(page);
    await expectSectionCounts(page, { completed: 1 });
    
    // The app should continue functioning despite localStorage errors
    // (errors should be caught and logged, not crash the app)
  });

  test('should handle localStorage read failures gracefully', async ({ page }) => {
    // Mock localStorage getItem to throw errors
    await page.evaluate(() => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = () => {
        throw new Error('localStorage read error');
      };
    });
    
    // Reload page to trigger localStorage read during initialization
    await page.reload();
    
    // App should still load and function with default state
    await expect(page.getByText('TaskFlow')).toBeVisible();
    await expect(page.getByPlaceholder('Add a new task...')).toBeVisible();
    
    // Should be able to add tasks
    await addTask(page, TEST_TASKS.simple);
    await expectTaskVisible(page, TEST_TASKS.simple);
  });

  test('should handle corrupted localStorage data gracefully', async ({ page }) => {
    // Set corrupted data in localStorage
    await page.evaluate(() => {
      localStorage.setItem('taskflow-todos', 'invalid json data');
      localStorage.setItem('taskflow-collapse-states', '{invalid json}');
    });
    
    // Reload page to trigger localStorage read
    await page.reload();
    
    // App should still load with default state despite corrupted data
    await expect(page.getByText('TaskFlow')).toBeVisible();
    await expect(page.getByPlaceholder('Add a new task...')).toBeVisible();
    
    // Should be able to add tasks
    await addTask(page, TEST_TASKS.simple);
    await expectTaskVisible(page, TEST_TASKS.simple);
  });

  test('should handle network failures during external operations', async ({ page }) => {
    // Go offline to simulate network failures
    await page.context().setOffline(true);
    
    // App should still function normally for local operations
    await addTask(page, TEST_TASKS.first);
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible();
    
    // Complete task
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    await expect(page.getByText('Completed (1)')).toBeVisible();
    
    // Delete the task from active by adding another and deleting it
    await addTask(page, TEST_TASKS.second);
    await deleteTask(page);
    await waitForAnimations(page);
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Go back online
    await page.context().setOffline(false);
    
    // App should continue working normally
    await addTask(page, TEST_TASKS.third);
    await expect(page.getByText(TEST_TASKS.third)).toBeVisible();
  });

  test('should handle console errors gracefully', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Add task
    await addTask(page, TEST_TASKS.first);
    await expect(page.getByText(TEST_TASKS.first)).toBeVisible();
    
    // Complete task
    await page.getByRole('checkbox').click();
    await waitForAnimations(page);
    await expect(page.getByText('Completed (1)')).toBeVisible();
    
    // Add another task and delete it
    await addTask(page, TEST_TASKS.second);
    await deleteTask(page);
    await waitForAnimations(page);
    
    // App should be functioning without critical console errors
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    
    // Filter out expected/non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Failed to load') && 
      !error.includes('manifest') &&
      !error.includes('favicon') &&
      !error.includes('404') &&
      !error.includes('NetworkError') &&
      !error.includes('Loading module') &&
      !error.includes('hydrated but some attributes') &&
      !error.includes('hydration-mismatch')
    );
    
    // Should not have critical errors
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }
    expect(criticalErrors.length).toBe(0);
  });
});