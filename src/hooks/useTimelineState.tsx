import { useState, useEffect } from 'react';
import { AppState, Day, Todo } from '../types';

const STORAGE_KEY = 'timeline-stepper-state';

// Initial state with example data
const getInitialState = (): AppState => {
  const today = new Date();
  
  const initialState: AppState = {
    days: [
      {
        id: 1,
        date: today,
        todos: [
          { id: '1', text: 'Create project plan', completed: false },
          { id: '2', text: 'Research competitors', completed: false },
        ],
      },
      {
        id: 2,
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        todos: [],
      },
      {
        id: 3,
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        todos: [],
      },
    ],
    goal: {
      text: 'Launch MVP in 30 days',
    },
    currentDayId: 1,
  };

  // Get saved state from localStorage if it exists
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      
      // Convert string dates back to Date objects
      parsedState.days.forEach((day: Day) => {
        day.date = new Date(day.date);
      });
      
      return parsedState;
    } catch (e) {
      console.error('Failed to parse saved state:', e);
      return initialState;
    }
  }
  
  return initialState;
};

export const useTimelineState = () => {
  const [state, setState] = useState<AppState>(getInitialState);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Advance to the next day
  const advanceDay = () => {
    setState((prevState) => {
      // Find the next day
      const nextDayId = prevState.currentDayId + 1;
      
      // Check if the next day exists
      const nextDayExists = prevState.days.some(day => day.id === nextDayId);
      
      // If the next day doesn't exist, create it
      if (!nextDayExists) {
        const lastDay = prevState.days[prevState.days.length - 1];
        const newDay: Day = {
          id: nextDayId,
          date: new Date(lastDay.date.getTime() + 24 * 60 * 60 * 1000),
          todos: [],
        };
        
        prevState.days.push(newDay);
      }
      
      // Get current day's todos
      const currentDay = prevState.days.find(day => day.id === prevState.currentDayId);
      if (!currentDay) return prevState;
      
      // Get next day
      const nextDay = prevState.days.find(day => day.id === nextDayId);
      if (!nextDay) return prevState;
      
      // Transfer incomplete todos to the next day
      const incompleteTodos = currentDay.todos.filter(todo => !todo.completed);
      
      // Generate new ids for transferred todos to avoid duplicate ids
      const transferredTodos: Todo[] = incompleteTodos.map(todo => ({
        ...todo,
        id: `${todo.id}-transferred-${Date.now()}`,
      }));
      
      // Add transferred todos to the next day
      nextDay.todos = [...nextDay.todos, ...transferredTodos];
      
      return {
        ...prevState,
        currentDayId: nextDayId,
      };
    });
  };

  // Add a new todo to the current day
  const addTodo = (text: string) => {
    setState((prevState) => {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
      };
      
      const updatedDays = prevState.days.map(day => {
        if (day.id === prevState.currentDayId) {
          return {
            ...day,
            todos: [...day.todos, newTodo],
          };
        }
        return day;
      });
      
      return {
        ...prevState,
        days: updatedDays,
      };
    });
  };

  // Update an existing todo
  const updateTodo = (dayId: number, todoId: string, updates: Partial<Todo>) => {
    setState((prevState) => {
      const updatedDays = prevState.days.map(day => {
        if (day.id === dayId) {
          const updatedTodos = day.todos.map(todo => {
            if (todo.id === todoId) {
              return { ...todo, ...updates };
            }
            return todo;
          });
          
          return {
            ...day,
            todos: updatedTodos,
          };
        }
        return day;
      });
      
      return {
        ...prevState,
        days: updatedDays,
      };
    });
  };

  // Delete a todo
  const deleteTodo = (dayId: number, todoId: string) => {
    setState((prevState) => {
      const updatedDays = prevState.days.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            todos: day.todos.filter(todo => todo.id !== todoId),
          };
        }
        return day;
      });
      
      return {
        ...prevState,
        days: updatedDays,
      };
    });
  };

  // Update the goal
  const updateGoal = (text: string) => {
    setState((prevState) => ({
      ...prevState,
      goal: { text },
    }));
  };

  return {
    state,
    addTodo,
    updateTodo,
    deleteTodo,
    advanceDay,
    updateGoal,
  };
};