
import { format, parseISO, isSameDay, subDays, addDays } from 'date-fns';
import { PerformanceColor, Task, DayEntry } from './types';

export const calculatePoints = (tasks: Task[]): number => {
  return tasks.reduce((total, task) => {
    if (task.hasSubOptions) {
      if (task.selectedSubOptionId) {
        const option = task.subOptions.find(o => o.id === task.selectedSubOptionId);
        return total + (option ? option.points : 0);
      }
      return total;
    } else {
      return total + (task.isCompleted ? task.basePoints : 0);
    }
  }, 0);
};

export const determineColor = (points: number, target: number, tasks: Task[]): PerformanceColor => {
  if (points === 0) return 'red';
  if (points >= target) return 'green';
  
  // Simplified logic: If you have ANY points but haven't hit target, it's Yellow (In Progress)
  return 'yellow';
};

export const getStatusColorClasses = (status: PerformanceColor, isBackground: boolean = false): string => {
  switch (status) {
    case 'green':
      return isBackground 
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' 
        : 'text-emerald-500 dark:text-emerald-400';
    case 'yellow':
      return isBackground 
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' 
        : 'text-amber-500 dark:text-amber-400';
    case 'red':
      return isBackground 
        ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400' 
        : 'text-rose-500 dark:text-rose-400';
    default:
      return 'text-slate-500 dark:text-slate-400';
  }
};

export const getStatusBg = (status: PerformanceColor): string => {
  switch (status) {
    case 'green': return 'bg-emerald-500';
    case 'yellow': return 'bg-amber-400';
    case 'red': return 'bg-rose-500';
  }
};

export const calculateStreak = (days: Record<string, DayEntry>): number => {
  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');
  
  // 1. Check Today
  const todayData = days[todayKey];
  const isTodayGreen = todayData && todayData.status === 'green';
  
  // 2. Check Backwards (Yesterday, Day Before...)
  let pastStreak = 0;
  let pastCheck = subDays(today, 1);
  while (true) {
    const key = format(pastCheck, 'yyyy-MM-dd');
    const dayData = days[key];
    
    if (dayData && dayData.status === 'green') {
      pastStreak++;
      pastCheck = subDays(pastCheck, 1);
    } else {
      break;
    }
  }

  // 3. Check Forwards (Tomorrow, Day After...)
  // We count future days to allow users to "bank" days or see progress if they are working ahead,
  // even if they missed today.
  let futureStreak = 0;
  let futureCheck = addDays(today, 1);
  while (true) {
    const key = format(futureCheck, 'yyyy-MM-dd');
    const dayData = days[key];
    
    if (dayData && dayData.status === 'green') {
      futureStreak++;
      futureCheck = addDays(futureCheck, 1);
    } else {
      break;
    }
  }

  if (isTodayGreen) {
    // Perfect chain: Past + Today + Future
    return pastStreak + 1 + futureStreak;
  } else {
    // Today is NOT green (Gap).
    // Logic: 
    // - If we have a past streak, that is the "Current Active Streak" (at risk).
    // - If we have NO past streak (0), but we have a future streak (started working ahead), show the future streak.
    // - If we have BOTH, technically the gap breaks the streak, but usually we prioritize the past streak until it's lost.
    if (pastStreak > 0) return pastStreak;
    return futureStreak;
  }
};
