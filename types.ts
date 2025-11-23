
export type PerformanceColor = 'red' | 'yellow' | 'green';

export interface User {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

export interface SubOption {
  id: string;
  label: string;
  points: number;
}

export interface Task {
  id: string;
  title: string;
  basePoints: number; // Used if no sub-options exist
  hasSubOptions: boolean;
  subOptions: SubOption[];
  // State
  isCompleted: boolean; // For simple checkbox tasks
  selectedSubOptionId: string | null; // For sub-option tasks
}

export interface DayEntry {
  date: string; // ISO format YYYY-MM-DD
  tasks: Task[];
  totalPoints: number;
  status: PerformanceColor;
  targetPoints: number;
}

export interface AppState {
  days: Record<string, DayEntry>; // Keyed by date string
  settings: {
    dailyTarget: number;
  };
  taskTemplate?: Task[]; // Custom default tasks for new days
}

export const DAILY_TARGET_DEFAULT = 20;

export const DEFAULT_TASKS_TEMPLATE: Task[] = [
  {
    id: 't1',
    title: 'Deep Work Session',
    basePoints: 0,
    hasSubOptions: true,
    isCompleted: false,
    selectedSubOptionId: null,
    subOptions: [
      { id: 't1-opt1', label: '1 Hour', points: 7 },
      { id: 't1-opt2', label: '30 Mins', points: 3 },
    ],
  },
  {
    id: 't2',
    title: 'Exercise',
    basePoints: 0,
    hasSubOptions: true,
    isCompleted: false,
    selectedSubOptionId: null,
    subOptions: [
      { id: 't2-opt1', label: 'Heavy Workout', points: 8 },
      { id: 't2-opt2', label: 'Light Cardio', points: 4 },
    ],
  },
  {
    id: 't3',
    title: 'Reading',
    basePoints: 3,
    hasSubOptions: false,
    isCompleted: false,
    selectedSubOptionId: null,
    subOptions: [],
  },
  {
    id: 't4',
    title: 'Meditation',
    basePoints: 2,
    hasSubOptions: false,
    isCompleted: false,
    selectedSubOptionId: null,
    subOptions: [],
  },
];
