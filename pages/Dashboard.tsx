
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateStreak, calculateYellowStreak, getStatusColorClasses, getStatusBg, getStatusDistribution } from '../utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trophy, Flame, TrendingUp, AlertCircle, Info, Zap } from 'lucide-react';
import { subDays, format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addDays } from 'date-fns';

type TimeRange = 'week' | 'month' | 'year';

const Dashboard: React.FC = () => {
  const { state, getDay, theme } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  
  const greenStreak = calculateStreak(state.days);
  const yellowStreak = calculateYellowStreak(state.days);
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayData = getDay(todayKey);

  // Weekly Insights
  const weeklyInsights = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }).map((_, i) => {
      const dateStr = format(addDays(start, i), 'yyyy-MM-dd');
      return getDay(dateStr);
    });
    return getStatusDistribution(days);
  }, [state.days, getDay]);

  // Memoize chart data calculation
  const chartData = useMemo(() => {
    const today = new Date();
    const dailyTarget = state.settings.dailyTarget;

    if (timeRange === 'year') {
      // Last 12 Months (Average Daily Score per Month)
      return Array.from({ length: 12 }).map((_, i) => {
        const date = subMonths(today, 11 - i); // Go back 11 months to today
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
        
        let totalPoints = 0;
        let recordedDays = 0;

        daysInMonth.forEach(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          if (state.days[dayStr]) {
            totalPoints += state.days[dayStr].totalPoints;
            recordedDays++;
          }
        });

        // Calculate average. If no data recorded for that month, 0.
        // We divide by daysInMonth to show "Average Daily Performance" so it matches the target line scale
        const avgPoints = recordedDays > 0 ? (totalPoints / daysInMonth.length) : 0;

        return {
          name: format(date, 'MMM'),
          points: parseFloat(avgPoints.toFixed(1)), // Keep decimals for averages
          target: dailyTarget,
          fullDate: format(date, 'MMMM yyyy')
        };
      });
    } else if (timeRange === 'week') {
      // Current Calendar Week (Mon - Sun)
      // This allows seeing future planned days if they fall in the current week
      const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
      
      return Array.from({ length: 7 }).map((_, i) => {
        const date = addDays(start, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const entry = state.days[dateStr];
        
        return {
          name: format(date, 'EEE'), // Mon
          points: entry ? entry.totalPoints : 0,
          target: dailyTarget,
          fullDate: format(date, 'MMM do, yyyy')
        };
      });
    } else {
      // Last 30 Days (Rolling)
      const daysCount = 30;
      return Array.from({ length: daysCount }).map((_, i) => {
        const date = subDays(today, (daysCount - 1) - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const entry = state.days[dateStr];
        
        return {
          name: format(date, 'dd'),
          points: entry ? entry.totalPoints : 0,
          target: dailyTarget,
          fullDate: format(date, 'MMM do, yyyy')
        };
      });
    }
  }, [timeRange, state.days, state.settings.dailyTarget]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400">Your performance overview</p>
        </div>
        
        {/* Subtle Legend */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Goal Met</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">No Progress</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Green Streak Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-1 bg-emerald-500/10 rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity">
            <Info size={12} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Green Streak</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{greenStreak}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">Perfect</span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${greenStreak > 0 ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'}`}>
            <Flame size={24} />
          </div>
        </div>

        {/* Yellow Streak Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-1 bg-amber-500/10 rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity">
            <Info size={12} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Yellow Streak</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-amber-600 dark:text-amber-500">{yellowStreak}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">Consistency</span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${yellowStreak > 0 ? 'bg-amber-100 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'}`}>
            <Zap size={24} />
          </div>
        </div>

        {/* Today's Points Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Today's Points</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-bold ${getStatusColorClasses(todayData.status)}`}>
                {todayData.totalPoints}
              </span>
              <span className="text-sm text-slate-400 dark:text-slate-500">/ {state.settings.dailyTarget}</span>
            </div>
          </div>
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Trophy size={24} />
          </div>
        </div>

        {/* Weekly Insights Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Weekly Insights</p>
          <div className="flex items-center gap-1 h-8">
            {Array.from({ length: weeklyInsights.green }).map((_, i) => (
              <div key={`g-${i}`} className="flex-1 h-full bg-emerald-500 rounded-sm" title="Perfect Day"></div>
            ))}
            {Array.from({ length: weeklyInsights.yellow }).map((_, i) => (
              <div key={`y-${i}`} className="flex-1 h-full bg-amber-400 rounded-sm" title="In Progress"></div>
            ))}
            {Array.from({ length: weeklyInsights.red }).map((_, i) => (
              <div key={`r-${i}`} className="flex-1 h-full bg-rose-500 rounded-sm" title="No Progress"></div>
            ))}
            {Array.from({ length: 7 - (weeklyInsights.green + weeklyInsights.yellow + weeklyInsights.red) }).map((_, i) => (
              <div key={`u-${i}`} className="flex-1 h-full bg-slate-100 dark:bg-slate-800 rounded-sm"></div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
            <span>{weeklyInsights.green}G</span>
            <span>{weeklyInsights.yellow}Y</span>
            <span>{weeklyInsights.red}R</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {timeRange === 'year' ? 'Monthly Average Performance' : (timeRange === 'week' ? 'This Week Performance' : 'Performance Trend')}
          </h3>
          
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex text-sm font-medium">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                timeRange === 'week' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                timeRange === 'month' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                timeRange === 'year' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12}}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                          {payload[0].payload.fullDate}
                        </p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                          {timeRange === 'year' ? 'Avg: ' : 'Points: '}
                          <span className="font-bold">{payload[0].value}</span>
                        </p>
                        <p className="text-xs text-slate-400">Target: {payload[0].payload.target}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="points" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: theme === 'dark' ? '#1e293b' : '#fff' }} 
                activeDot={{ r: 6 }} 
                animationDuration={1000}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} 
                strokeDasharray="5 5" 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
