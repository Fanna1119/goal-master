import React, { useState } from 'react';
import { Todo } from '../types';
import { Check, Pencil, Save, Trash2, X, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TodoItemProps {
  todo: Todo;
  dayId: number;
  onUpdate: (dayId: number, todoId: string, updates: Partial<Todo>) => void;
  onDelete: (dayId: number, todoId: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, dayId, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggleComplete = () => {
    onUpdate(dayId, todo.id, { completed: !todo.completed });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(dayId, todo.id, { text: editText });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(dayId, todo.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded-lg transition-all duration-300 ${
        todo.completed
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500'
          : 'bg-white dark:bg-gray-800 border-l-4 border-blue-500'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      <button
        onClick={handleToggleComplete}
        className={`flex-shrink-0 w-5 h-5 rounded-full border ${
          todo.completed
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-gray-300 dark:border-gray-600 text-transparent hover:border-blue-500'
        } flex items-center justify-center transition-colors duration-200`}
        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {todo.completed && <Check size={14} />}
      </button>
      
      {isEditing ? (
        <div className="flex items-center gap-2 flex-grow">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow p-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
            aria-label="Save"
          >
            <Save size={16} />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            aria-label="Cancel"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <span className={`flex-grow ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
            {todo.text}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleEdit}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              aria-label="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TodoItem;