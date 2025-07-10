import { z } from 'zod';

/**
 * Zod schema for Todo validation
 */
export const TodoSchema = z.object({
  id: z.string().uuid('Invalid todo ID format'),
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
 * Schema for array of todos
 */
export const TodoArraySchema = z.array(TodoSchema);

/**
 * Type inference from schema
 */
export type ValidatedTodo = z.infer<typeof TodoSchema>;

/**
 * Validates a single todo object
 */
export function validateTodo(todo: unknown): { success: true; data: ValidatedTodo } | { success: false; error: string } {
  try {
    const validated = TodoSchema.parse(todo);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map(e => e.message).join(', ') };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Validates an array of todos
 */
export function validateTodoArray(todos: unknown): { success: true; data: ValidatedTodo[] } | { success: false; error: string } {
  try {
    const validated = TodoArraySchema.parse(todos);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map(e => e.message).join(', ') };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Safely validates and migrates todos from localStorage
 */
export function validateAndMigrateTodos(stored: unknown): ValidatedTodo[] {
  if (!Array.isArray(stored)) {
    console.warn('Stored todos is not an array, returning empty array');
    return [];
  }

  const validTodos: ValidatedTodo[] = [];
  
  for (const item of stored) {
    const validation = validateTodo(item);
    if (validation.success) {
      validTodos.push(validation.data);
    } else {
      console.warn('Invalid todo item found and skipped:', validation.error, item);
      
      // Attempt to salvage the todo if it has basic structure
      if (typeof item === 'object' && item !== null && 'text' in item) {
        try {
          const salvaged: ValidatedTodo = {
            id: 'id' in item && typeof item.id === 'string' ? item.id : crypto.randomUUID(),
            text: typeof item.text === 'string' ? item.text.trim() : 'Recovered task',
            completed: 'completed' in item ? Boolean(item.completed) : false,
            deleted: 'deleted' in item ? Boolean(item.deleted) : false,
            completedAt: 'completedAt' in item && typeof item.completedAt === 'number' ? item.completedAt : undefined,
            deletedAt: 'deletedAt' in item && typeof item.deletedAt === 'number' ? item.deletedAt : undefined,
          };
          
          // Validate the salvaged version
          const salvageValidation = validateTodo(salvaged);
          if (salvageValidation.success) {
            validTodos.push(salvageValidation.data);
            console.log('Successfully salvaged todo:', salvageValidation.data);
          }
        } catch (error) {
          console.warn('Failed to salvage todo item:', error);
        }
      }
    }
  }

  return validTodos;
}