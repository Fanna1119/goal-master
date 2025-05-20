export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface Day {
  id: number;
  date: Date;
  todos: Todo[];
}

export interface Goal {
  text: string;
}

export interface AppState {
  days: Day[];
  goal: Goal;
  currentDayId: number;
}