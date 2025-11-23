
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { format, startOfYear, eachMonthOfInterval, endOfYear, startOfMonth, endOfMonth, eachDayOfInterval, addYears, subYears } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const MonthlyView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const { state, theme } = useApp();

  const months = useMemo(() => eachMonthOfInterval({
    start: startOfYear(new Date(year, 0, 1)),
    end: endOfYear(new Date(year, 0, 1))
  }), [year]);

  // Memoize the heavy calculation of monthly data
  const monthlyData = useMemo(() => {
    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      let totalPoints = 0;
      let potentialPoints = days.length * state.settings.dailyTarget;
      
      days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        // Direct state access is faster than calling getDay for bulk operations
        const entry = state.days[dateStr];
        if (entry) {
          totalPoints += entry.totalPoints;
        }
      });

      const percentage = potentialPoints > 0 ? Math.round((totalPoints / potentialPoints) * 100) : 0;
      
      return {
        month,
        daysCount: days.length,
        totalPoints,
        potentialPoints,
        percentage,
        chartData: [
          { name: 'Completed', value: totalPoints },
          { name: 'Remaining', value: Math.max(0, potentialPoints - totalPoints) }
        ]
      };
    });
  }, [months, state.days, state.settings.dailyTarget]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Monthly Performance</h2>
          <p className="text-slate-500 dark:text-slate-400">Breakdown for {year}</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 self-start transition-colors">
          <button 
            onClick={() => setCurrentDate(subYears(currentDate, 1))}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            {year}
          </span>
          <button 
            onClick={() => setCurrentDate(addYears(currentDate, 1))}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {monthlyData.map((data) => {
          const isCurrentMonth = format(new Date(), 'MMM yyyy') === format(data.month, 'MMM yyyy');

          return (
            <div key={data.month.toString()} className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border transition-colors ${isCurrentMonth ? 'border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-50 dark:ring-indigo-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{format(data.month, 'MMMM')}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{data.daysCount} days</p>
                </div>
                {isCurrentMonth && <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full">CURRENT</span>}
              </div>

              <div className="flex items-center gap-4">
                 <div className="h-16 w-16 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.chartData}
                          innerRadius={22}
                          outerRadius={30}
                          paddingAngle={5}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          stroke="none"
                        >
                          <Cell key="cell-0" fill={data.percentage > 80 ? '#10b981' : data.percentage > 40 ? '#fbbf24' : '#f43f5e'} />
                          <Cell key="cell-1" fill={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                      {data.percentage}%
                    </div>
                 </div>
                 
                 <div>
                   <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.totalPoints}</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400">Points Earned</p>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyView;
