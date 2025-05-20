import React, { useState } from 'react';
import { Day } from '../types';
import TodoItem from './TodoItem';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTimelineStore } from '../store/timelineStore';

interface DayStepProps {
  day: Day;
  isCurrent: boolean;
  isLast: boolean;
  onUpdateTodo: (dayId: number, todoId: string, updates: Partial<{ text: string; completed: boolean }>) => void;
  onDeleteTodo: (dayId: number, todoId: string) => void;
  onAddTodo: (dayId: number, text: string) => void;
}

const DayStep: React.FC<DayStepProps> = ({
  day,
  isCurrent,
  isLast,
  onUpdateTodo,
  onDeleteTodo,
  onAddTodo,
}) => {
  const [expanded, setExpanded] = useState(isCurrent);
  const [newTodoText, setNewTodoText] = useState('');
  const reorderTodos = useTimelineStore(state => state.reorderTodos);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short', 
    day: 'numeric'
  }).format(day.date);
  
  const completedCount = day.todos.filter(todo => todo.completed).length;
  const progress = day.todos.length > 0
    ? Math.round((completedCount / day.todos.length) * 100)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      onAddTodo(day.id, newTodoText.trim());
      setNewTodoText('');
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = day.todos.findIndex(todo => todo.id === active.id);
      const newIndex = day.todos.findIndex(todo => todo.id === over.id);
      
      const newTodos = arrayMove(day.todos, oldIndex, newIndex);
      reorderTodos(day.id, newTodos);
    }
  };

  return (
    <div className={`relative ${isLast ? '' : 'pb-8'}`}>
      {!isLast && (
        <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
      )}
      
      <div className="flex items-start gap-4">
        <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
          isCurrent ? 'bg-blue-600 text-white' : (
            progress === 100 ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          )
        }`}>
          {day.id}
        </div>
        
        <div className="flex-grow">
          <div 
            className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={toggleExpanded}
          >
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Day {day.id}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formattedDate}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {day.todos.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{completedCount}/{day.todos.length}</span>
                </div>
              )}
              <button 
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                aria-label={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
          
          {expanded && (
            <div className="mt-3 space-y-3 animate-fadeIn">
              {day.todos.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic p-3">No tasks for this day yet</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={day.todos}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {day.todos.map(todo => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          dayId={day.id}
                          onUpdate={onUpdateTodo}
                          onDelete={onDeleteTodo}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
              
              <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!newTodoText.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayStep;