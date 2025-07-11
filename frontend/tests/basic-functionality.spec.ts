import { test, expect } from '@playwright/test';
import { navigateToApp, addTask, getTaskByText, getTaskCheckbox, getDeleteButton, expandSection, waitForAnimations, TEST_TASKS, SELECTORS, expectTaskVisible, completeTask, deleteTask } from './test-utils';

test.describe('TaskFlow App - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('should display the app title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'TaskFlow' })).toBeVisible();
  });

  test('should display GitHub link with correct URL', async ({ page }) => {
    const githubLink = page.getByTestId('github-link');
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/jdc-projects/taskflow');
    await expect(githubLink).toHaveAttribute('target', '_blank');
    await expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(githubLink).toHaveAttribute('aria-label', 'View source on GitHub');
  });

  test('should display color scheme toggle button', async ({ page }) => {
    const colorSchemeToggle = page.getByTestId('color-scheme-toggle');
    await expect(colorSchemeToggle).toBeVisible();
    await expect(colorSchemeToggle).toHaveAttribute('aria-label', 'Toggle color scheme');
  });

  test('should add a new task', async ({ page }) => {
    await addTask(page, TEST_TASKS.simple);
    
    await expectTaskVisible(page, TEST_TASKS.simple);
  });

  test('should not add empty tasks', async ({ page }) => {
    // Verify button is disabled when input is empty
    await expect(page.getByRole('button', { name: SELECTORS.addButton })).toBeDisabled();
    
    // Try to add whitespace-only task
    await page.getByPlaceholder(SELECTORS.addInput).fill('   ');
    await expect(page.getByRole('button', { name: SELECTORS.addButton })).toBeDisabled();
  });

  test('should toggle task completion', async ({ page }) => {
    await addTask(page, TEST_TASKS.simple);
    
    // Click the checkbox to complete the task
    await completeTask(page);
    
    // Wait for animation to complete
    await waitForAnimations(page);
    
    // Task should move to completed section - need to click the collapse to expand it
    await expandSection(page, 'Completed', 1);
    
    // Now check if the task is marked as completed
    const completedTask = getTaskByText(page, TEST_TASKS.simple);
    await expect(completedTask).toHaveCSS('text-decoration-line', 'line-through');
  });

  test('should delete a task', async ({ page }) => {
    await addTask(page, TEST_TASKS.simple);
    
    await deleteTask(page);
    
    // Wait for animation
    await waitForAnimations(page);
    
    // Task should move to deleted section - need to click the collapse to expand it
    await expandSection(page, 'Deleted', 1);
    
    // Check if task is in deleted section (should be red text)
    const deletedTask = getTaskByText(page, TEST_TASKS.simple);
    await expect(deletedTask).toHaveCSS('color', 'rgb(250, 82, 82)'); // Mantine red color
    
    // Check that "No tasks yet" message is shown in the main area
    await expect(page.getByText(SELECTORS.emptyState)).toBeVisible();
  });
});