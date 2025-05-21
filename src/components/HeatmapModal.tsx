import React from 'react';
import HeatMap from '@uiw/react-heat-map';
import { X } from 'lucide-react';
import { Day } from '../types';

interface HeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: Day[];
}

const HeatmapModal: React.FC<HeatmapModalProps> = ({ isOpen, onClose, days }) => {
  if (!isOpen) return null;

  const heatmapData = days.map(day => ({
    date: day.date.toISOString().split('T')[0],
    count: day.todos.filter(todo => todo.completed).length,
  })).filter(item => item.count > 0);
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Task Completion Heatmap</h2>
        
        <div className="overflow-x-auto">
          <div className="min-w-[600px] p-4 bg-white dark:bg-gray-800 rounded-lg">
            <HeatMap
            monthPlacement='bottom'
              value={heatmapData}
              width={600}
              style={{ color: '#ad001d' }}
              startDate={days[0]?.date}
              rectSize={12}
              rectProps={{
                rx: 2,
              }}
              legendRender={(props) => (
                <rect {...props} y={props.y !== undefined ? Number(props.y) + 10 : 10} className="dark:fill-current dark:text-gray-600" />
              )}
              rectRender={(props, data) => {
                return (
                  <rect
                    {...props}
                    className={`${
                      data.count > 0 
                        ? 'dark:opacity-90'
                        : 'dark:fill-gray-700'
                    }`}
                  />
                );
              }}
            />
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          The heatmap shows the number of tasks completed each day. Darker colors indicate more completed tasks.
        </p>
      </div>
    </div>
  );
};

export default HeatmapModal;