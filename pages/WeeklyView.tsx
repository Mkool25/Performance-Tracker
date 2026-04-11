import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStatusColorClasses, getStatusBg, getStatusDistribution } from '../utils';

const WeeklyView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getDay } = useApp();
  const navigate = useNavigate();

  const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  const daysInWeek = useMemo(() => eachDayOfInterval({ start, end }), [start, end]);

  // Calculate Week Totals
  const weekStats = useMemo(() => {
    const days = daysInWeek.map(day => getDay(format(day, 'yyyy-MM-dd')));
    const distribution = getStatusDistribution(days);
    const totalPoints = days.reduce((acc, d) => acc + d.totalPoints, 0);
    
    return {
      totalPoints,
      ...distribution
    };
  }, [daysInWeek, getDay]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Review</h2>
          <p className="text-slate-500 dark:text-slate-400">
            {format(start, 'MMM d')} - {format(end, 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 self-start transition-colors">
          <button 
            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-2 text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Calendar size={16} />
            {format(start, 'MMMM')}
          </span>
          <button 
            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Week Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-indigo-600 dark:bg-indigo-700 text-white p-5 rounded-2xl shadow-md transition-colors">
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Total Points</p>
            <p className="text-3xl font-bold mt-1">{weekStats.totalPoints}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors flex items-center justify-between">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Perfect Days</p>
              <p className="text-3xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{weekStats.green}</p>
            </div>
            <CheckCircle2 className="text-emerald-500/20" size={40} />
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors flex items-center justify-between">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">In Progress</p>
              <p className="text-3xl font-bold mt-1 text-amber-500 dark:text-amber-400">{weekStats.yellow}</p>
            </div>
            <Clock className="text-amber-500/20" size={40} />
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors flex items-center justify-between">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">No Progress</p>
              <p className="text-3xl font-bold mt-1 text-rose-500 dark:text-rose-400">{weekStats.red}</p>
            </div>
            <XCircle className="text-rose-500/20" size={40} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-semibold">Day</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-right">Points</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {daysInWeek.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const data = getDay(dateStr);
                const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

                return (
                  <tr 
                    key={dateStr} 
                    onClick={() => navigate(`/day/${dateStr}`)}
                    className={`group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                  >
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-200">
                      {format(day, 'EEEE')}
                      {isToday && <span className="ml-2 text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold">TODAY</span>}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{format(day, 'MMM do')}</td>
                    <td className="p-4 text-right font-mono font-medium text-slate-700 dark:text-slate-300">{data.totalPoints}</td>
                    <td className="p-4 text-center">
                       <span className={`inline-block w-3 h-3 rounded-full ${getStatusBg(data.status)} shadow-sm`}></span>
                    </td>
                    <td className="p-4 text-center">
                      <ChevronRight size={16} className="inline text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeeklyView;