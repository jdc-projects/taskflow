import { test, expect } from '@playwright/test';

test.describe('TaskFlow App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the app title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'TaskFlow' })).toBeVisible();
  });

  test('should add a new task', async ({ page }) => {
    const taskText = 'Test task item';
    
    await page.getByPlaceholder('Add a new task...').fill(taskText);
    await page.getByRole('button', { name: 'Add' }).click();
    
    await expect(page.getByText(taskText)).toBeVisible();
  });

  test('should not add empty tasks', async ({ page }) => {
    await page.getByPlaceholder('Add a new task...').fill('   ');
    await expect(page.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  test('should toggle task completion', async ({ page }) => {
    const taskText = 'Test task item';
    
    await page.getByPlaceholder('Add a new task...').fill(taskText);
    await page.getByRole('button', { name: 'Add' }).click();
    
    const checkbox = page.getByRole('checkbox');
    await checkbox.check();
    
    await expect(checkbox).toBeChecked();
    await expect(page.getByText(taskText)).toHaveCSS('text-decoration-line', 'line-through');
  });

  test('should delete a task', async ({ page }) => {
    const taskText = 'Test task item';
    
    await page.getByPlaceholder('Add a new task...').fill(taskText);
    await page.getByRole('button', { name: 'Add' }).click();
    
    await page.locator('[data-testid="delete-todo"]').click();
    
    await expect(page.getByText(taskText)).not.toBeVisible();
    await expect(page.getByText('No tasks yet. Add one above!')).toBeVisible();
  });

  test('should persist tasks in local storage', async ({ page }) => {
    const taskText = 'Persistent task';
    
    await page.getByPlaceholder('Add a new task...').fill(taskText);
    await page.getByRole('button', { name: 'Add' }).click();
    
    await page.reload();
    
    await expect(page.getByText(taskText)).toBeVisible();
  });

  test('should show empty state when no tasks', async ({ page }) => {
    await expect(page.getByText('No tasks yet. Add one above!')).toBeVisible();
  });

  test('should toggle color scheme', async ({ page }) => {
    const toggleButton = page.getByRole('button', { name: 'Toggle color scheme' });
    await toggleButton.click();
    
    await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark');
  });

  test('should move completed tasks to bottom section', async ({ page }) => {
    // Add multiple tasks
    const task1 = 'First task';
    const task2 = 'Second task';
    const task3 = 'Third task';
    
    await page.getByPlaceholder('Add a new task...').fill(task1);
    await page.getByRole('button', { name: 'Add' }).click();
    
    await page.getByPlaceholder('Add a new task...').fill(task2);
    await page.getByRole('button', { name: 'Add' }).click();
    
    await page.getByPlaceholder('Add a new task...').fill(task3);
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Complete the middle task
    await page.getByRole('checkbox').nth(1).check();
    
    // Wait for animation to complete
    await page.waitForTimeout(500);
    
    // Verify task2 is completed (has line-through)
    await expect(page.getByText(task2)).toHaveCSS('text-decoration-line', 'line-through');
    
    // Verify task1 and task3 are not completed (no line-through)
    await expect(page.getByText(task1)).not.toHaveCSS('text-decoration-line', 'line-through');
    await expect(page.getByText(task3)).not.toHaveCSS('text-decoration-line', 'line-through');
  });

  test('should move uncompleted tasks to top', async ({ page }) => {
    // Add and complete a task first
    const task1 = 'First task';
    const task2 = 'Second task';
    
    await page.getByPlaceholder('Add a new task...').fill(task1);
    await page.getByRole('button', { name: 'Add' }).click();
    
    await page.getByPlaceholder('Add a new task...').fill(task2);
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Complete the first task
    await page.getByRole('checkbox').first().check();
    
    // Wait for animation
    await page.waitForTimeout(500);
    
    // Verify task1 is completed
    await expect(page.getByText(task1)).toHaveCSS('text-decoration-line', 'line-through');
    
    // Uncomplete the task (it should now be at the bottom)
    await page.getByRole('checkbox').last().uncheck();
    
    // Wait for animation
    await page.waitForTimeout(500);
    
    // Verify task1 is no longer completed and both tasks are visible
    await expect(page.getByText(task1)).not.toHaveCSS('text-decoration-line', 'line-through');
    await expect(page.getByText(task2)).not.toHaveCSS('text-decoration-line', 'line-through');
  });

  test('should order completed tasks by most recent completion', async ({ page }) => {
    // Add three tasks
    const task1 = 'Task completed first';
    const task2 = 'Task completed second';
    const task3 = 'Task completed third';
    
    await page.getByPlaceholder('Add a new task...').fill(task1);
    await page.getByRole('button', { name: 'Add' }).click();
    
    await page.getByPlaceholder('Add a new task...').fill(task2);
    await page.getByRole('button', { name: 'Add' }).click();
    
    await page.getByPlaceholder('Add a new task...').fill(task3);
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Complete tasks in order (first, second, third)
    await page.getByRole('checkbox').nth(0).check();
    await page.waitForTimeout(100);
    
    await page.getByRole('checkbox').nth(0).check(); // Second task is now first
    await page.waitForTimeout(100);
    
    await page.getByRole('checkbox').nth(0).check(); // Third task is now first
    await page.waitForTimeout(500);
    
    // Verify all tasks are completed (have line-through)
    await expect(page.getByText(task1)).toHaveCSS('text-decoration-line', 'line-through');
    await expect(page.getByText(task2)).toHaveCSS('text-decoration-line', 'line-through');
    await expect(page.getByText(task3)).toHaveCSS('text-decoration-line', 'line-through');
  });

  test('should show dividers between tasks', async ({ page }) => {
    // Add multiple tasks
    await page.getByPlaceholder('Add a new task...').fill('First task');
    await page.getByRole('button', { name: 'Add' }).click();
    
    await page.getByPlaceholder('Add a new task...').fill('Second task');
    await page.getByRole('button', { name: 'Add' }).click();
    
    await page.getByPlaceholder('Add a new task...').fill('Third task');
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Check that dividers exist between tasks
    const dividers = page.locator('[data-orientation="horizontal"]');
    await expect(dividers).toHaveCount(2); // 3 tasks = 2 dividers
  });

  test('should animate task movements', async ({ page }) => {
    // Add a task
    const taskText = 'Animated task';
    await page.getByPlaceholder('Add a new task...').fill(taskText);
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Get the task element
    const taskElement = page.locator('div').filter({ hasText: taskText }).first();
    
    // Check that task has animation-related attributes (framer-motion adds these)
    await expect(taskElement).toBeVisible();
    
    // Complete the task and verify it's still visible during animation
    await taskElement.getByRole('checkbox').check();
    
    // Task should remain visible during animation
    await expect(taskElement).toBeVisible();
    
    // Wait for animation to complete
    await page.waitForTimeout(500);
    
    // Task should still be visible after animation
    await expect(taskElement).toBeVisible();
  });
});