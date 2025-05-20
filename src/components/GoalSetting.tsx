import React, { useState } from 'react';
import { Goal } from '../types';
import { Target, Edit2, Check } from 'lucide-react';

interface GoalSettingProps {
  goal: Goal;
  onUpdateGoal: (text: string) => void;
}

const GoalSetting: React.FC<GoalSettingProps> = ({ goal, onUpdateGoal }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(goal.text);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdateGoal(editText);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(goal.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="mb-8 bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-800 dark:to-blue-700 p-6 rounded-lg text-white shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-6 w-6" />
        <h2 className="text-xl font-bold">Endgame Goal</h2>
      </div>
      
      {isEditing ? (
        <div className="mt-2">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 text-gray-800 dark:text-white bg-white dark:bg-gray-800 rounded border-2 border-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="What's your ultimate goal?"
            autoFocus
          />
          <div className="flex justify-end mt-2 gap-2">
            <button
              onClick={handleCancel}
              className="py-1 px-3 bg-indigo-700 dark:bg-indigo-900 hover:bg-indigo-800 dark:hover:bg-indigo-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="py-1 px-3 bg-white text-indigo-700 dark:bg-gray-200 dark:text-indigo-800 hover:bg-indigo-100 dark:hover:bg-gray-300 rounded flex items-center gap-1 transition-colors"
            >
              <Check size={16} />
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-lg font-medium">
            {goal.text || "Set your endgame goal..."}
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-indigo-700 dark:hover:bg-indigo-800 rounded-full transition-colors"
            aria-label="Edit goal"
          >
            <Edit2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalSetting;