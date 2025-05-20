import React, { useEffect } from 'react';
import TimelineStepper from './components/TimelineStepper';
import { useTimelineStore } from './store/timelineStore';

function App() {
  const isDarkMode = useTimelineStore(state => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <TimelineStepper />
    </div>
  );
}

export default App;