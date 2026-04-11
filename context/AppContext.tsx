
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppState, DayEntry, Task, DAILY_TARGET_DEFAULT, DEFAULT_TASKS_TEMPLATE } from '../types';
import { calculatePoints, determineColor } from '../utils';
import { useAuth } from './AuthContext';

interface AppContextType {
  state: AppState;
  getDay: (date: string) => DayEntry;
  updateTask: (date: string, taskId: string, updates: Partial<Task>) => void;
  updateDayTasks: (date: string, newTasks: Task[]) => void;
  saveTaskTemplate: (tasks: Task[]) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>({
    days: {},
    settings: { dailyTarget: DAILY_TARGET_DEFAULT },
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('perf-tracker-theme');
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('perf-tracker-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Load data when user changes
  useEffect(() => {
    const key = user ? `perf-tracker-data-${user.id}` : 'perf-tracker-data';
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure structure matches AppState
        setState({
            ...parsed,
            days: parsed.days || {},
            settings: parsed.settings || { dailyTarget: DAILY_TARGET_DEFAULT }
        });
      } catch (e) {
        console.error("Failed to parse saved data", e);
        setState({ days: {}, settings: { dailyTarget: DAILY_TARGET_DEFAULT } });
      }
    } else {
      setState({ days: {}, settings: { dailyTarget: DAILY_TARGET_DEFAULT } });
    }
  }, [user]);

  // Debounced Save - Performance Optimization
  const stateRef = useRef(state);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const key = user ? `perf-tracker-data-${user.id}` : 'perf-tracker-data';
    
    const handler = setTimeout(() => {
      if (Object.keys(stateRef.current.days).length > 0 || stateRef.current.taskTemplate) {
        localStorage.setItem(key, JSON.stringify(stateRef.current));
      }
    }, 1000); 

    return () => {
      clearTimeout(handler);
    };
  }, [state, user]); 

  const getDay = useCallback((date: string): DayEntry => {
    if (state.days[date]) {
      return state.days[date];
    }
    
    // Create new day entry from template if it doesn't exist
    // Use stored custom template OR the hardcoded default
    const templateToUse = state.taskTemplate || DEFAULT_TASKS_TEMPLATE;
    const newTasks = JSON.parse(JSON.stringify(templateToUse));
    
    // Ensure the new tasks are reset (not completed)
    newTasks.forEach((t: Task) => {
        t.isCompleted = false;
        t.selectedSubOptionId = null;
    });
    
    return {
      date,
      tasks: newTasks,
      totalPoints: 0,
      status: 'red',
      targetPoints: state.settings.dailyTarget,
    };
  }, [state.days, state.settings.dailyTarget, state.taskTemplate]);

  const updateTask = useCallback((date: string, taskId: string, updates: Partial<Task>) => {
    setState((prev) => {
      let currentDay = prev.days[date];
      
      if (!currentDay) {
        const templateToUse = prev.taskTemplate || DEFAULT_TASKS_TEMPLATE;
        const newTasks = JSON.parse(JSON.stringify(templateToUse));
        currentDay = {
          date,
          tasks: newTasks,
          totalPoints: 0,
          status: 'red',
          targetPoints: prev.settings.dailyTarget,
        };
      }
      
      const updatedTasks = currentDay.tasks.map((t) => 
        t.id === taskId ? { ...t, ...updates } : t
      );
      
      const newPoints = calculatePoints(updatedTasks);
      const newStatus = determineColor(newPoints, currentDay.targetPoints, updatedTasks);

      return {
        ...prev,
        days: {
          ...prev.days,
          [date]: {
            ...currentDay,
            tasks: updatedTasks,
            totalPoints: newPoints,
            status: newStatus,
          },
        },
      };
    });
  }, []);

  const updateDayTasks = useCallback((date: string, newTasks: Task[]) => {
    setState((prev) => {
      let currentDay = prev.days[date];
      
      if (!currentDay) {
        currentDay = {
          date,
          tasks: [],
          totalPoints: 0,
          status: 'red',
          targetPoints: prev.settings.dailyTarget,
        };
      }

      const newPoints = calculatePoints(newTasks);
      const newStatus = determineColor(newPoints, currentDay.targetPoints, newTasks);

      return {
        ...prev,
        days: {
          ...prev.days,
          [date]: {
            ...currentDay,
            tasks: newTasks,
            totalPoints: newPoints,
            status: newStatus,
          },
        },
      };
    });
  }, []);

  const saveTaskTemplate = useCallback((tasks: Task[]) => {
    setState((prev) => ({
      ...prev,
      taskTemplate: tasks.map(t => ({
        ...t,
        isCompleted: false,
        selectedSubOptionId: null
      }))
    }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, []);

  const value = useMemo(() => ({
    state,
    getDay,
    updateTask,
    updateDayTasks,
    saveTaskTemplate,
    updateSettings,
    theme,
    toggleTheme
  }), [state, getDay, updateTask, updateDayTasks, saveTaskTemplate, updateSettings, theme, toggleTheme]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
