import React, { useState } from 'react';
import DayStep from './DayStep';
import GoalSetting from './GoalSetting';
import HeatmapModal from './HeatmapModal';
import { useTimelineStore } from '../store/timelineStore';
import { ArrowRight, Calendar, Plus, Moon, Sun, BarChart2, CheckCheck } from 'lucide-react';

const TimelineStepper: React.FC = () => {
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
  const state = useTimelineStore();
  const { addTodo, updateTodo, deleteTodo, advanceDay, updateGoal, addDay, toggleDarkMode } = useTimelineStore();

  const handleAdvanceDay = () => {
    if (window.confirm('Are you sure you want to advance to the next day? Incomplete tasks will be transferred.')) {
      advanceDay();
    }
  };

  // Calculate overall progress
  const totalTodos = state.days.reduce((sum, day) => sum + day.todos.length, 0);
  const completedTodos = state.days.reduce((sum, day) => 
    sum + day.todos.filter(todo => todo.completed).length, 0);
  const overallProgress = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <div className="flex justify-end mb-4 gap-2">
          <button
            onClick={() => setIsHeatmapOpen(true)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            aria-label="Show heatmap"
          >
            <BarChart2 size={20} />
            <span>Activity</span>
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={state.isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {state.isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          <CheckCheck color='#5fe081' size={32} className="inline-block mr-2" />
          Goal Master
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Track your progress day by day towards your ultimate goal</p>
        
        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{completedTodos}/{totalTodos} tasks completed</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                overallProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </header>

      <GoalSetting goal={state.goal} onUpdateGoal={updateGoal} />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Your Timeline</h2>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => addDay()}
            className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            <span>Add Day</span>
          </button>
          <button
            onClick={handleAdvanceDay}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <span>Next Day</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {state.days.map((day, index) => (
          <DayStep
            key={day.id}
            day={day}
            isCurrent={day.id === state.currentDayId}
            isLast={index === state.days.length - 1}
            onUpdateTodo={updateTodo}
            onDeleteTodo={deleteTodo}
            onAddTodo={addTodo}
          />
        ))}
      </div>

      <HeatmapModal
        isOpen={isHeatmapOpen}
        onClose={() => setIsHeatmapOpen(false)}
        days={state.days}
      />
    </div>
  );
};

export default TimelineStepper;