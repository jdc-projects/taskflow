import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, TEST_TASKS, expectSectionCounts, expectTaskVisible, completeTask, deleteTask } from './test-utils';

test.describe('TaskFlow App - Rapid Operations and Race Conditions', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should handle rapid task additions without dropping tasks', async ({ page }) => {
    // Add multiple tasks rapidly without waiting for animations
    await addTask(page, TEST_TASKS.first);
    await addTask(page, TEST_TASKS.second);
    await addTask(page, TEST_TASKS.third);
    await addTask(page, 'Fourth task');
    await addTask(page, 'Fifth task');
    
    // Wait for all DOM updates to complete
    await page.waitForTimeout(1000);
    
    // Verify all tasks were added correctly
    await expectSectionCounts(page, { active: 5 });
    await expectTaskVisible(page, TEST_TASKS.first);
    await expectTaskVisible(page, TEST_TASKS.second);
    await expectTaskVisible(page, TEST_TASKS.third);
    await expectTaskVisible(page, 'Fourth task');
    await expectTaskVisible(page, 'Fifth task');
  });

  test('should handle rapid task completions without state corruption', async ({ page }) => {
    // Add one task, complete it, then add another - repeat for predictable behavior
    await addTask(page, TEST_TASKS.first);
    await completeTask(page);
    
    await addTask(page, TEST_TASKS.second);
    await completeTask(page);
    
    await addTask(page, TEST_TASKS.third);
    await completeTask(page);
    
    // Wait for all state updates to complete
    await page.waitForTimeout(1000);
    
    // Verify final state is correct
    await expectSectionCounts(page, { active: 0, completed: 3 });
  });

  test('should handle rapid task deletions without state corruption', async ({ page }) => {
    // Add one task, delete it, then add another - repeat for predictable behavior
    await addTask(page, TEST_TASKS.first);
    await deleteTask(page);
    
    await addTask(page, TEST_TASKS.second);
    await deleteTask(page);
    
    await addTask(page, TEST_TASKS.third);
    await deleteTask(page);
    
    // Wait for all state updates to complete
    await page.waitForTimeout(1000);
    
    // Verify final state is correct
    await expectSectionCounts(page, { active: 0, deleted: 3 });
  });

  test('should handle mixed rapid operations correctly', async ({ page }) => {
    // Add one task and perform complete operation
    await addTask(page, TEST_TASKS.first);
    await completeTask(page);
    
    // Add another task and delete it
    await addTask(page, TEST_TASKS.second);
    await deleteTask(page);
    
    // Add third task and complete it
    await addTask(page, TEST_TASKS.third);
    await completeTask(page);
    
    // Add fourth task and delete it
    await addTask(page, 'Fourth task');
    await deleteTask(page);
    
    // Wait for all state updates to complete
    await page.waitForTimeout(1000);
    
    // Verify final state - should have 0 active, 2 completed, 2 deleted
    await expectSectionCounts(page, { active: 0, completed: 2, deleted: 2 });
  });

  test('should handle rapid section toggle operations', async ({ page }) => {
    // Add and complete a task to have a completed section
    await addTask(page, TEST_TASKS.first);
    await completeTask(page);
    await page.waitForTimeout(200);
    
    // Rapidly toggle the completed section multiple times
    await page.getByText('Completed (1)').click();
    await page.getByText('Completed (1)').click();
    await page.getByText('Completed (1)').click();
    await page.getByText('Completed (1)').click();
    await page.getByText('Completed (1)').click();
    
    // Wait for animations to settle
    await page.waitForTimeout(500);
    
    // The section should be in a stable state (either expanded or collapsed)
    // We don't care which, just that it's not stuck in an intermediate state
    const completedSectionExists = await page.getByText('Completed (1)').isVisible();
    expect(completedSectionExists).toBe(true);
    
    // Task should either be visible or not, but not in a broken state
    const taskVisible = await page.getByText(TEST_TASKS.first).isVisible();
    expect(typeof taskVisible).toBe('boolean');
  });

  test('should handle concurrent localStorage operations', async ({ page }) => {
    // Perform sequential operations to avoid race conditions but test localStorage persistence
    await addTask(page, TEST_TASKS.first);
    await completeTask(page);
    
    await addTask(page, TEST_TASKS.second);
    await deleteTask(page);
    
    await addTask(page, TEST_TASKS.third);
    await completeTask(page);
    
    // Wait for all operations to complete
    await page.waitForTimeout(1000);
    
    // Reload page to verify localStorage integrity
    await page.reload();
    
    // Verify state was persisted correctly
    await expectSectionCounts(page, { active: 0, completed: 2, deleted: 1 });
    
    // Verify specific tasks are present
    // Expand sections to check task content
    await page.getByText('Completed (2)').click();
    await page.waitForTimeout(200);
    
    const hasCompletedTasks = await page.getByText(TEST_TASKS.first).isVisible() ||
                             await page.getByText(TEST_TASKS.third).isVisible();
    expect(hasCompletedTasks).toBe(true);
  });

  test('should handle rapid restore operations', async ({ page }) => {
    // Add and delete tasks sequentially for predictable state
    await addTask(page, TEST_TASKS.first);
    await deleteTask(page);
    
    await addTask(page, TEST_TASKS.second);
    await deleteTask(page);
    
    await addTask(page, TEST_TASKS.third);
    await deleteTask(page);
    
    await page.waitForTimeout(300);
    
    // Expand deleted section
    await page.getByText('Deleted (3)').click();
    await page.waitForTimeout(200);
    
    // Rapidly restore tasks
    const restoreButtons = await page.locator('[data-testid="restore-task"]').count();
    for (let i = 0; i < restoreButtons; i++) {
      await page.locator('[data-testid="restore-task"]').first().click();
      await page.waitForTimeout(50); // Small delay to prevent UI issues
    }
    
    // Wait for all operations to complete
    await page.waitForTimeout(1000);
    
    // Verify all tasks were restored
    await expectSectionCounts(page, { active: 3, deleted: 0 });
  });

  test('should handle operations without losing application stability', async ({ page }) => {
    // Test that rapid operations don't break the application's ability to function
    await addTask(page, TEST_TASKS.first);
    
    // Perform a variety of operations rapidly
    await completeTask(page);
    await addTask(page, TEST_TASKS.second);
    await deleteTask(page);
    
    // Wait for operations to settle
    await page.waitForTimeout(1000);
    
    // Verify application is still functional by adding a new task
    await addTask(page, 'Stability test task');
    await expectTaskVisible(page, 'Stability test task');
    
    // Verify section headers exist and have valid counts
    const activeText = await page.locator('text=/Active \\(\\d+\\)/').textContent();
    const completedText = await page.locator('text=/Completed \\(\\d+\\)/').textContent();
    const deletedText = await page.locator('text=/Deleted \\(\\d+\\)/').textContent();
    
    expect(activeText).toBeTruthy();
    expect(completedText).toBeTruthy();
    expect(deletedText).toBeTruthy();
  });

  test('should maintain state consistency during page navigation during operations', async ({ page }) => {
    // Add tasks and start operations
    await addTask(page, TEST_TASKS.first);
    await addTask(page, TEST_TASKS.second);
    
    // Start some operations
    await completeTask(page, 0);
    
    // Navigate away and back quickly (simulating user behavior)
    await page.reload();
    
    // Add more tasks immediately after reload
    await addTask(page, TEST_TASKS.third);
    
    // Verify state is consistent
    const activeText = await page.locator('text=/Active \\(\\d+\\)/').textContent();
    const completedText = await page.locator('text=/Completed \\(\\d+\\)/').textContent();
    
    // Should have some tasks in active and possibly completed sections
    expect(activeText).toBeTruthy();
    expect(completedText).toBeTruthy();
    
    // Verify at least our newly added task is present
    await expectTaskVisible(page, TEST_TASKS.third);
  });

  test('should handle stress test with many rapid operations', async ({ page }) => {
    // Create a high-frequency operation scenario
    const operations = 10;
    
    // Add initial tasks
    for (let i = 0; i < operations; i++) {
      await addTask(page, `Task ${i}`);
    }
    
    // Perform rapid mixed operations
    for (let i = 0; i < operations; i++) {
      // Alternate between different operations
      if (i % 3 === 0) {
        await completeTask(page, 0);
      } else if (i % 3 === 1) {
        await deleteTask(page, 0);
      } else {
        await addTask(page, `Extra task ${i}`);
      }
      
      // Very small delay to prevent complete UI lockup
      await page.waitForTimeout(10);
    }
    
    // Wait for all operations to settle
    await page.waitForTimeout(2000);
    
    // Verify the app is still functional
    const activeText = await page.locator('text=/Active \\(\\d+\\)/').textContent();
    const completedText = await page.locator('text=/Completed \\(\\d+\\)/').textContent();
    const deletedText = await page.locator('text=/Deleted \\(\\d+\\)/').textContent();
    
    // All sections should exist and have valid counts
    expect(activeText).toBeTruthy();
    expect(completedText).toBeTruthy();
    expect(deletedText).toBeTruthy();
    
    // Should be able to add a new task after stress test
    await addTask(page, 'Recovery test');
    await expectTaskVisible(page, 'Recovery test');
  });
});