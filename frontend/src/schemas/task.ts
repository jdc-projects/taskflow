import { z } from 'zod';

/**
 * Zod schema for Task validation
 */
export const TaskSchema = z.object({
  id: z.string().uuid('Invalid task ID format'),
  text: z.string()
    .min(1, 'Task text cannot be empty')
    .max(500, 'Task text cannot exceed 500 characters')
    .transform(text => text.trim()),
  completed: z.boolean(),
  deleted: z.boolean(),
  completedAt: z.number().optional(),
  deletedAt: z.number().optional(),
});

/**
 * Type inference from schema
 */
export type ValidatedTask = z.infer<typeof TaskSchema>;

/**
 * Validates a single task object
 */
export function validateTask(task: unknown): { success: true; data: ValidatedTask } | { success: false; error: string } {
  try {
    const validated = TaskSchema.parse(task);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map(e => e.message).join(', ') };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}


/**
 * Safely validates and migrates tasks from localStorage
 */
export function validateAndMigrateTasks(stored: unknown): ValidatedTask[] {
  if (!Array.isArray(stored)) {
    console.warn('Stored tasks is not an array, returning empty array');
    return [];
  }

  const validTasks: ValidatedTask[] = [];
  
  for (const item of stored) {
    const validation = validateTask(item);
    if (validation.success) {
      validTasks.push(validation.data);
    } else {
      console.warn('Invalid task item found and skipped:', validation.error, item);
      
      // Attempt to salvage the task if it has basic structure
      if (typeof item === 'object' && item !== null && 'text' in item) {
        try {
          const salvaged: ValidatedTask = {
            id: 'id' in item && typeof item.id === 'string' ? item.id : crypto.randomUUID(),
            text: typeof item.text === 'string' ? item.text.trim() : 'Recovered task',
            completed: 'completed' in item ? Boolean(item.completed) : false,
            deleted: 'deleted' in item ? Boolean(item.deleted) : false,
            completedAt: 'completedAt' in item && typeof item.completedAt === 'number' ? item.completedAt : undefined,
            deletedAt: 'deletedAt' in item && typeof item.deletedAt === 'number' ? item.deletedAt : undefined,
          };
          
          // Validate the salvaged version
          const salvageValidation = validateTask(salvaged);
          if (salvageValidation.success) {
            validTasks.push(salvageValidation.data);
            console.log('Successfully salvaged task:', salvageValidation.data);
          }
        } catch (error) {
          console.warn('Failed to salvage task item:', error);
        }
      }
    }
  }

  return validTasks;
}