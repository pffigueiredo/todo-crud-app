
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoInput } from '../schema';
import { updateTodo } from '../handlers/update_todo';
import { eq } from 'drizzle-orm';

describe('updateTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update todo text only', async () => {
    // Create a test todo first
    const createdTodo = await db.insert(todosTable)
      .values({
        text: 'Original todo',
        completed: false
      })
      .returning()
      .execute();

    const todoId = createdTodo[0].id;
    const originalCreatedAt = createdTodo[0].created_at;

    const updateInput: UpdateTodoInput = {
      id: todoId,
      text: 'Updated todo text'
    };

    const result = await updateTodo(updateInput);

    expect(result.id).toEqual(todoId);
    expect(result.text).toEqual('Updated todo text');
    expect(result.completed).toEqual(false); // Should remain unchanged
    expect(result.created_at).toEqual(originalCreatedAt); // Should remain unchanged
  });

  it('should update completion status only', async () => {
    // Create a test todo first
    const createdTodo = await db.insert(todosTable)
      .values({
        text: 'Test todo',
        completed: false
      })
      .returning()
      .execute();

    const todoId = createdTodo[0].id;

    const updateInput: UpdateTodoInput = {
      id: todoId,
      completed: true
    };

    const result = await updateTodo(updateInput);

    expect(result.id).toEqual(todoId);
    expect(result.text).toEqual('Test todo'); // Should remain unchanged
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update both text and completion status', async () => {
    // Create a test todo first
    const createdTodo = await db.insert(todosTable)
      .values({
        text: 'Original todo',
        completed: false
      })
      .returning()
      .execute();

    const todoId = createdTodo[0].id;

    const updateInput: UpdateTodoInput = {
      id: todoId,
      text: 'Updated todo text',
      completed: true
    };

    const result = await updateTodo(updateInput);

    expect(result.id).toEqual(todoId);
    expect(result.text).toEqual('Updated todo text');
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated todo to database', async () => {
    // Create a test todo first
    const createdTodo = await db.insert(todosTable)
      .values({
        text: 'Original todo',
        completed: false
      })
      .returning()
      .execute();

    const todoId = createdTodo[0].id;

    const updateInput: UpdateTodoInput = {
      id: todoId,
      text: 'Database update test',
      completed: true
    };

    await updateTodo(updateInput);

    // Verify the update was persisted to the database
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todoId))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].text).toEqual('Database update test');
    expect(todos[0].completed).toEqual(true);
  });

  it('should throw error when todo does not exist', async () => {
    const updateInput: UpdateTodoInput = {
      id: 999, // Non-existent ID
      text: 'This should fail'
    };

    await expect(updateTodo(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle partial updates correctly', async () => {
    // Create a test todo first
    const createdTodo = await db.insert(todosTable)
      .values({
        text: 'Original todo',
        completed: true
      })
      .returning()
      .execute();

    const todoId = createdTodo[0].id;

    // Update only the completion status
    const updateInput: UpdateTodoInput = {
      id: todoId,
      completed: false
    };

    const result = await updateTodo(updateInput);

    expect(result.id).toEqual(todoId);
    expect(result.text).toEqual('Original todo'); // Should remain unchanged
    expect(result.completed).toEqual(false); // Should be updated
    expect(result.created_at).toBeInstanceOf(Date);
  });
});
