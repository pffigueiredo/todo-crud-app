
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: DeleteTodoInput = {
  id: 1
};

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing todo', async () => {
    // Create a todo first
    await db.insert(todosTable)
      .values({
        text: 'Test todo to delete',
        completed: false
      })
      .execute();

    const result = await deleteTodo(testInput);

    expect(result.success).toBe(true);
  });

  it('should remove todo from database', async () => {
    // Create a todo first
    await db.insert(todosTable)
      .values({
        text: 'Test todo to delete',
        completed: false
      })
      .execute();

    await deleteTodo(testInput);

    // Verify the todo was deleted
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, testInput.id))
      .execute();

    expect(todos).toHaveLength(0);
  });

  it('should return false for non-existent todo', async () => {
    const result = await deleteTodo({ id: 999 });

    expect(result.success).toBe(false);
  });

  it('should not affect other todos when deleting', async () => {
    // Create multiple todos
    await db.insert(todosTable)
      .values([
        { text: 'First todo', completed: false },
        { text: 'Second todo', completed: true }
      ])
      .execute();

    // Delete the first todo (id: 1)
    await deleteTodo({ id: 1 });

    // Verify only one todo remains
    const remainingTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(remainingTodos).toHaveLength(1);
    expect(remainingTodos[0].text).toEqual('Second todo');
    expect(remainingTodos[0].id).toEqual(2);
  });
});
