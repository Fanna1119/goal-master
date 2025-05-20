import { create } from 'zustand';
import { AppState, Day, Todo } from '../types';

const STORAGE_KEY = 'timeline-stepper-state';
const THEME_KEY = 'timeline-theme';

interface TimelineStore extends AppState {
  isDarkMode: boolean;
  addTodo: (dayId: number, text: string) => void;
  updateTodo: (dayId: number, todoId: string, updates: Partial<Todo>) => void;
  deleteTodo: (dayId: number, todoId: string) => void;
  advanceDay: () => void;
  updateGoal: (text: string) => void;
  addDay: () => void;
  reorderTodos: (dayId: number, todos: Todo[]) => void;
  toggleDarkMode: () => void;
}

// Get initial state from localStorage or use default
const getInitialState = (): AppState & { isDarkMode: boolean } => {
  const today = new Date();
  
  const initialState: AppState & { isDarkMode: boolean } = {
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
    isDarkMode: localStorage.getItem(THEME_KEY) === 'dark',
  };

  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      parsedState.days.forEach((day: Day) => {
        day.date = new Date(day.date);
      });
      return {
        ...parsedState,
        isDarkMode: localStorage.getItem(THEME_KEY) === 'dark',
      };
    } catch (e) {
      console.error('Failed to parse saved state:', e);
      return initialState;
    }
  }
  
  return initialState;
};

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  ...getInitialState(),

  addTodo: (dayId: number, text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    
    set((state) => {
      const updatedDays = state.days.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            todos: [...day.todos, newTodo],
          };
        }
        return day;
      });
      
      const newState = {
        ...state,
        days: updatedDays,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  },

  updateTodo: (dayId: number, todoId: string, updates: Partial<Todo>) => {
    set((state) => {
      const updatedDays = state.days.map(day => {
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
      
      const newState = {
        ...state,
        days: updatedDays,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  },

  deleteTodo: (dayId: number, todoId: string) => {
    set((state) => {
      const updatedDays = state.days.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            todos: day.todos.filter(todo => todo.id !== todoId),
          };
        }
        return day;
      });
      
      const newState = {
        ...state,
        days: updatedDays,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  },

  advanceDay: () => {
    set((state) => {
      const nextDayId = state.currentDayId + 1;
      const nextDayExists = state.days.some(day => day.id === nextDayId);
      
      let updatedDays = [...state.days];
      
      if (!nextDayExists) {
        const lastDay = state.days[state.days.length - 1];
        const newDay: Day = {
          id: nextDayId,
          date: new Date(lastDay.date.getTime() + 24 * 60 * 60 * 1000),
          todos: [],
        };
        
        updatedDays.push(newDay);
      }
      
      const currentDay = state.days.find(day => day.id === state.currentDayId);
      if (!currentDay) return state;
      
      const nextDay = updatedDays.find(day => day.id === nextDayId);
      if (!nextDay) return state;
      
      // Separate completed and incomplete todos
      const completedTodos = currentDay.todos.filter(todo => todo.completed);
      const incompleteTodos = currentDay.todos.filter(todo => !todo.completed);
      
      // Create new IDs for transferred todos
      const transferredTodos: Todo[] = incompleteTodos.map(todo => ({
        ...todo,
        id: `${todo.id}-transferred-${Date.now()}`,
      }));
      
      updatedDays = updatedDays.map(day => {
        if (day.id === state.currentDayId) {
          // Keep only completed todos in the current day
          return {
            ...day,
            todos: completedTodos,
          };
        }
        if (day.id === nextDayId) {
          // Add transferred todos to the next day
          return {
            ...day,
            todos: [...day.todos, ...transferredTodos],
          };
        }
        return day;
      });
      
      const newState = {
        ...state,
        days: updatedDays,
        currentDayId: nextDayId,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  },

  updateGoal: (text: string) => {
    set((state) => {
      const newState = {
        ...state,
        goal: { text },
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  },

  addDay: () => {
    set((state) => {
      const lastDay = state.days[state.days.length - 1];
      const newDay: Day = {
        id: lastDay.id + 1,
        date: new Date(lastDay.date.getTime() + 24 * 60 * 60 * 1000),
        todos: [],
      };

      const newState = {
        ...state,
        days: [...state.days, newDay],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  },

  reorderTodos: (dayId: number, todos: Todo[]) => {
    set((state) => {
      const updatedDays = state.days.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            todos,
          };
        }
        return day;
      });

      const newState = {
        ...state,
        days: updatedDays,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  },

  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.isDarkMode;
      localStorage.setItem(THEME_KEY, newDarkMode ? 'dark' : 'light');
      return { ...state, isDarkMode: newDarkMode };
    });
  },
}));