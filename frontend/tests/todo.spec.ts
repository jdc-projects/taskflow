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
});