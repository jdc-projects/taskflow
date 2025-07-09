import { Page } from '@playwright/test';

/**
 * Common test utilities for TaskFlow application
 */

/**
 * Navigate to the TaskFlow application
 */
export async function navigateToApp(page: Page) {
  await page.goto('/');
}

/**
 * Add a new task to the application
 */
export async function addTask(page: Page, taskText: string) {
  await page.getByPlaceholder('Add a new task...').fill(taskText);
  await page.getByRole('button', { name: 'Add' }).click();
}

/**
 * Add multiple tasks in sequence
 */
export async function addTasks(page: Page, taskTexts: string[]) {
  for (const taskText of taskTexts) {
    await addTask(page, taskText);
  }
}

/**
 * Expand a collapsible section by name
 */
export async function expandSection(page: Page, sectionName: string, count: number) {
  await page.getByText(`${sectionName} (${count})`).click();
  await page.waitForTimeout(200); // Wait for expand animation
}

/**
 * Wait for animations to complete
 */
export async function waitForAnimations(page: Page, duration: number = 200) {
  await page.waitForTimeout(duration);
}

/**
 * Get a task element by text
 */
export function getTaskByText(page: Page, taskText: string) {
  return page.getByText(taskText);
}

/**
 * Get a checkbox for a specific task
 */
export function getTaskCheckbox(page: Page, index: number) {
  return page.getByRole('checkbox').nth(index);
}

/**
 * Get the delete button for a task
 */
export function getDeleteButton(page: Page, testId: string = 'delete-todo') {
  return page.locator(`[data-testid="${testId}"]`);
}

/**
 * Get the restore button for a deleted task
 */
export function getRestoreButton(page: Page) {
  return page.locator('[data-testid="restore-todo"]');
}

/**
 * Get the permanent delete button for a deleted task
 */
export function getPermanentDeleteButton(page: Page) {
  return page.locator('[data-testid="permanent-delete-todo"]');
}

/**
 * Common test data
 */
export const TEST_TASKS = {
  simple: 'Test task item',
  first: 'First task',
  second: 'Second task', 
  third: 'Third task',
  completed: {
    first: 'Task completed first',
    second: 'Task completed second',
    third: 'Task completed third'
  },
  animated: 'Animated task',
  persistent: 'Persistent task'
};

/**
 * Common selectors
 */
export const SELECTORS = {
  addInput: 'Add a new task...',
  addButton: 'Add',
  emptyState: 'No tasks yet. Add one above!',
  completedSection: '[data-testid="completed-section"]',
  deletedSection: '[data-testid="deleted-section"]'
} as const;