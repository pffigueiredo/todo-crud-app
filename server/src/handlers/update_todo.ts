
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoInput, type Todo } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTodo = async (input: UpdateTodoInput): Promise<Todo> => {
  try {
    // Build update values object dynamically based on provided fields
    const updateValues: Partial<typeof todosTable.$inferInsert> = {};
    
    if (input.text !== undefined) {
      updateValues.text = input.text;
    }
    
    if (input.completed !== undefined) {
      updateValues.completed = input.completed;
    }

    // Update the todo record
    const result = await db.update(todosTable)
      .set(updateValues)
      .where(eq(todosTable.id, input.id))
      .returning()
      .execute();

    // Check if todo was found and updated
    if (result.length === 0) {
      throw new Error(`Todo with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Todo update failed:', error);
    throw error;
  }
};
