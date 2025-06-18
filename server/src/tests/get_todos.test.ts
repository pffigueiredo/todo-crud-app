
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no todos exist', async () => {
    const result = await getTodos();
    
    expect(result).toEqual([]);
  });

  it('should return all todos from database', async () => {
    // Create test todos
    await db.insert(todosTable)
      .values([
        { text: 'First todo', completed: false },
        { text: 'Second todo', completed: true },
        { text: 'Third todo', completed: false }
      ])
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(3);
    expect(result[0].text).toEqual('First todo');
    expect(result[0].completed).toBe(false);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);

    expect(result[1].text).toEqual('Second todo');
    expect(result[1].completed).toBe(true);
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);

    expect(result[2].text).toEqual('Third todo');
    expect(result[2].completed).toBe(false);
    expect(result[2].id).toBeDefined();
    expect(result[2].created_at).toBeInstanceOf(Date);
  });

  it('should return todos in insertion order', async () => {
    // Create test todos with distinct text
    await db.insert(todosTable)
      .values([
        { text: 'Alpha todo', completed: false },
        { text: 'Beta todo', completed: true },
        { text: 'Gamma todo', completed: false }
      ])
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(3);
    expect(result[0].text).toEqual('Alpha todo');
    expect(result[1].text).toEqual('Beta todo');
    expect(result[2].text).toEqual('Gamma todo');
  });
});
