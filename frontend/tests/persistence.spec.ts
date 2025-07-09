import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, getTaskByText, TEST_TASKS } from './test-utils';

test.describe('TaskFlow App - Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should persist tasks in local storage', async ({ page }) => {
    await addTask(page, TEST_TASKS.persistent);
    
    // Reload the page
    await page.reload();
    
    // Verify task is still there after reload
    await expect(getTaskByText(page, TEST_TASKS.persistent)).toBeVisible();
  });
});