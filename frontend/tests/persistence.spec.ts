import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, getTaskByText, TEST_TASKS, expectTaskVisible } from './test-utils';

test.describe('TaskFlow App - Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should persist tasks in local storage', async ({ page }) => {
    await addTask(page, TEST_TASKS.persistent);
    
    // Wait for debounced localStorage save (300ms debounce + buffer)
    await page.waitForTimeout(500);
    
    // Reload the page
    await page.reload();
    
    // Verify task is still there after reload
    await expectTaskVisible(page, TEST_TASKS.persistent);
  });
});