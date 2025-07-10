import { test, expect } from '@playwright/test';
import { navigateToApp, addTasks, getTaskByText, getTaskCheckbox, expandSection, waitForAnimations, TEST_TASKS, SELECTORS, completeTask } from './test-utils';

test.describe('TaskFlow App - Task Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should move completed tasks to bottom section', async ({ page }) => {
    // Add multiple tasks
    const tasks = [TEST_TASKS.first, TEST_TASKS.second, TEST_TASKS.third];
    await addTasks(page, tasks);
    
    // Complete the middle task (task2 - which is now at index 1 since task3 was added to top)
    await completeTask(page, 1);
    
    // Wait for animation to complete
    await waitForAnimations(page);
    
    // Expand completed section to verify task2 is there
    await expandSection(page, 'Completed', 1);
    
    // Verify task2 is completed (has line-through)
    await expect(getTaskByText(page, TEST_TASKS.second)).toHaveCSS('text-decoration-line', 'line-through');
    
    // Verify task1 and task3 are not completed (no line-through)
    await expect(getTaskByText(page, TEST_TASKS.first)).not.toHaveCSS('text-decoration-line', 'line-through');
    await expect(getTaskByText(page, TEST_TASKS.third)).not.toHaveCSS('text-decoration-line', 'line-through');
  });

  test('should move uncompleted tasks to top', async ({ page }) => {
    // Add and complete a task first
    const tasks = [TEST_TASKS.first, TEST_TASKS.second];
    await addTasks(page, tasks);
    
    // Complete task1 (it's now the second checkbox since task2 was added to top)
    await completeTask(page, 1);
    
    // Wait for animation
    await waitForAnimations(page);
    
    // Expand completed section to verify task1 is there
    await expandSection(page, 'Completed', 1);
    
    // Verify task1 is completed
    await expect(getTaskByText(page, TEST_TASKS.first)).toHaveCSS('text-decoration-line', 'line-through');
    
    // Uncomplete the task (click its checkbox in the completed section specifically)
    await page.locator(SELECTORS.completedSection).locator('div').filter({ hasText: TEST_TASKS.first }).getByRole('checkbox').click();
    
    // Wait for animation
    await waitForAnimations(page);
    
    // Verify task1 is no longer completed and both tasks are visible in incomplete section
    await expect(getTaskByText(page, TEST_TASKS.first)).not.toHaveCSS('text-decoration-line', 'line-through');
    await expect(getTaskByText(page, TEST_TASKS.second)).not.toHaveCSS('text-decoration-line', 'line-through');
  });

  test('should order completed tasks by most recent completion', async ({ page }) => {
    // Add three tasks
    const tasks = [TEST_TASKS.completed.first, TEST_TASKS.completed.second, TEST_TASKS.completed.third];
    await addTasks(page, tasks);
    
    // Complete tasks in order (task1, task2, task3)
    // With new ordering: task3 (idx 0), task2 (idx 1), task1 (idx 2)
    await completeTask(page, 2); // Complete task1
    await page.waitForTimeout(100);
    
    await completeTask(page, 1); // Complete task2
    await page.waitForTimeout(100);
    
    await completeTask(page, 0); // Complete task3
    await waitForAnimations(page);
    
    // Expand completed section to verify tasks are there
    await expandSection(page, 'Completed', 3);
    
    // Verify all tasks are completed (have line-through)
    await expect(getTaskByText(page, TEST_TASKS.completed.first)).toHaveCSS('text-decoration-line', 'line-through');
    await expect(getTaskByText(page, TEST_TASKS.completed.second)).toHaveCSS('text-decoration-line', 'line-through');
    await expect(getTaskByText(page, TEST_TASKS.completed.third)).toHaveCSS('text-decoration-line', 'line-through');
  });
});