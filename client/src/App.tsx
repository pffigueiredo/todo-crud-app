
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit2, Save, X, Plus, CheckCircle2, Circle } from 'lucide-react';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../../server/src/schema';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // Load todos on component mount
  const loadTodos = useCallback(async () => {
    try {
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Create new todo
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    setIsLoading(true);
    try {
      const todoData: CreateTodoInput = {
        text: newTodoText.trim()
      };
      const newTodo = await trpc.createTodo.mutate(todoData);
      setTodos((prev: Todo[]) => [...prev, newTodo]);
      setNewTodoText('');
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle todo completion
  const handleToggleComplete = async (todo: Todo) => {
    try {
      const updateData: UpdateTodoInput = {
        id: todo.id,
        completed: !todo.completed
      };
      const updatedTodo = await trpc.updateTodo.mutate(updateData);
      setTodos((prev: Todo[]) =>
        prev.map((t: Todo) => (t.id === todo.id ? updatedTodo : t))
      );
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  // Start editing todo
  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  // Save edited todo
  const handleSaveEdit = async (id: number) => {
    if (!editText.trim()) return;

    try {
      const updateData: UpdateTodoInput = {
        id,
        text: editText.trim()
      };
      const updatedTodo = await trpc.updateTodo.mutate(updateData);
      setTodos((prev: Todo[]) =>
        prev.map((t: Todo) => (t.id === id ? updatedTodo : t))
      );
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // Delete todo
  const handleDeleteTodo = async (id: number) => {
    try {
      await trpc.deleteTodo.mutate({ id });
      setTodos((prev: Todo[]) => prev.filter((t: Todo) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const completedCount = todos.filter((t: Todo) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <CheckCircle2 className="h-10 w-10 text-blue-600" />
            Todo App
          </h1>
          <p className="text-gray-600">Stay organized and get things done! ✨</p>
        </div>

        {/* Create Todo Form */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-green-600" />
              Add New Todo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTodo} className="flex gap-2">
              <Input
                placeholder="What needs to be done? 🎯"
                value={newTodoText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewTodoText(e.target.value)
                }
                className="flex-1"
                required
              />
              <Button type="submit" disabled={isLoading || !newTodoText.trim()}>
                {isLoading ? 'Adding...' : 'Add Todo'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats */}
        {totalCount > 0 && (
          <div className="flex justify-center gap-4 mb-6">
            <Badge variant="secondary" className="px-4 py-2">
              Total: {totalCount}
            </Badge>
            <Badge variant="default" className="px-4 py-2 bg-green-600">
              Completed: {completedCount}
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              Pending: {totalCount - completedCount}
            </Badge>
          </div>
        )}

        {/* Todo List */}
        {totalCount === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <Circle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No todos yet! 🌟</p>
              <p className="text-gray-400">Create one above to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todos.map((todo: Todo) => (
              <Card key={todo.id} className={`shadow-md transition-all hover:shadow-lg ${
                todo.completed ? 'bg-green-50 border-green-200' : 'bg-white'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(todo)}
                      className="h-5 w-5"
                    />

                    {/* Todo Content */}
                    <div className="flex-1">
                      {editingId === todo.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editText}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setEditText(e.target.value)
                            }
                            className="flex-1"
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(todo.id);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(todo.id)}
                            disabled={!editText.trim()}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <p className={`font-medium ${
                            todo.completed 
                              ? 'line-through text-gray-500' 
                              : 'text-gray-800'
                          }`}>
                            {todo.text}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {todo.created_at.toLocaleDateString()} at{' '}
                            {todo.created_at.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {editingId !== todo.id && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(todo)}
                          disabled={todo.completed}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Progress indicator */}
        {totalCount > 0 && (
          <div className="mt-8 text-center">
            <Separator className="mb-4" />
            <div className="text-sm text-gray-600">
              {completedCount === totalCount ? (
                <span className="text-green-600 font-medium">
                  🎉 All done! Great job!
                </span>
              ) : (
                <span>
                  Keep going! {totalCount - completedCount} more to complete.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
