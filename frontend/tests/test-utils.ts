import { Page, expect } from '@playwright/test';
import { ANIMATION_DURATIONS } from '../src/constants/animations';

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
export async function waitForAnimations(page: Page, duration: number = ANIMATION_DURATIONS.TEST_WAIT) {
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
export function getDeleteButton(page: Page, testId: string = 'delete-task') {
  return page.locator(`[data-testid="${testId}"]`);
}

/**
 * Get the restore button for a deleted task
 */
export function getRestoreButton(page: Page) {
  return page.locator('[data-testid="restore-task"]');
}

/**
 * Get the permanent delete button for a deleted task
 */
export function getPermanentDeleteButton(page: Page) {
  return page.locator('[data-testid="permanent-delete-task"]');
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

/**
 * Assertion helpers for common test patterns
 */

/**
 * Assert that a section has the expected count
 */
export async function expectSectionCount(page: Page, sectionName: string, count: number) {
  await expect(page.getByText(`${sectionName} (${count})`)).toBeVisible();
}

/**
 * Assert multiple section counts at once
 */
export async function expectSectionCounts(page: Page, counts: { active?: number; completed?: number; deleted?: number }) {
  if (counts.active !== undefined) {
    await expectSectionCount(page, 'Active', counts.active);
  }
  if (counts.completed !== undefined) {
    await expectSectionCount(page, 'Completed', counts.completed);
  }
  if (counts.deleted !== undefined) {
    await expectSectionCount(page, 'Deleted', counts.deleted);
  }
}

/**
 * Assert that a task is visible in a specific section
 */
export async function expectTaskInSection(page: Page, taskText: string, sectionTestId: string, shouldBeVisible: boolean = true) {
  const assertion = expect(page.locator(`[data-testid="${sectionTestId}"]`).getByText(taskText));
  if (shouldBeVisible) {
    await assertion.toBeVisible();
  } else {
    await assertion.not.toBeVisible();
  }
}

/**
 * Complete a task by clicking its checkbox in the active section
 */
export async function completeTask(page: Page, taskIndex: number = 0) {
  await page.locator('[data-testid="active-section"] input[type="checkbox"]').nth(taskIndex).click();
}

/**
 * Delete a task using the delete button in the specified section
 */
export async function deleteTask(page: Page, taskIndex: number = 0, section: 'active' | 'completed' = 'active') {
  const sectionTestId = section === 'active' ? 'active-section' : 'completed-section';
  await page.locator(`[data-testid="${sectionTestId}"] [data-testid="delete-task"]`).nth(taskIndex).click();
}

/**
 * Restore a task from the deleted section
 */
export async function restoreTask(page: Page, taskIndex: number = 0) {
  await page.locator('[data-testid="deleted-section"] [data-testid="restore-task"]').nth(taskIndex).click();
}

/**
 * Permanently delete a task from the deleted section
 */
export async function permanentDeleteTask(page: Page, taskIndex: number = 0) {
  await page.locator('[data-testid="deleted-section"] [data-testid="permanent-delete-task"]').nth(taskIndex).click();
}

/**
 * Assert that a task is visible anywhere on the page
 */
export async function expectTaskVisible(page: Page, taskText: string, shouldBeVisible: boolean = true) {
  const assertion = expect(page.getByText(taskText));
  if (shouldBeVisible) {
    await assertion.toBeVisible();
  } else {
    await assertion.not.toBeVisible();
  }
}