
import React, { useMemo, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, AlertTriangle, Settings2, Plus, Trash2, Save, X, Copy } from 'lucide-react';
import { getStatusColorClasses } from '../utils';
import { Task, SubOption } from '../types';

// Memoized Task Item Component
const TaskItem = React.memo(({ 
  task, 
  index,
  date, 
  isEditing,
  onUpdate,
  onUpdateStructure,
  onDelete
}: { 
  task: Task; 
  index: number;
  date: string; 
  isEditing: boolean;
  onUpdate: (date: string, taskId: string, updates: Partial<Task>) => void;
  onUpdateStructure: (taskId: string, newStructure: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}) => {
  
  // --- EDIT MODE RENDERING ---
  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-indigo-200 dark:border-indigo-800 overflow-hidden relative group">
        
        <div className="p-4 space-y-4">
          
          {/* Header Row: Number + Content */}
          <div className="flex items-start gap-3"> 
             {/* Number Column */}
             <div className="pt-8">
               <span className="font-mono text-slate-400 font-bold text-sm block w-6 text-center">#{index + 1}</span>
             </div>
             
             {/* Content Column */}
             <div className="flex-1 min-w-0">
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block">Task Name</label>
                
                <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={task.title}
                      onChange={(e) => onUpdateStructure(task.id, { title: e.target.value })}
                      className="flex-1 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Task Name"
                    />
                    <button
                        type="button"
                        onClick={() => onDelete(task.id)}
                        className="shrink-0 p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                        title="Delete Task"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
             </div>
          </div>

          {/* Configuration Row */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg ml-9">
             <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none w-full">
                <input 
                  type="checkbox"
                  checked={task.hasSubOptions}
                  onChange={(e) => onUpdateStructure(task.id, { hasSubOptions: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Use Sub-options (Time/Variants)
             </label>
          </div>

          {/* Sub Options / Base Points Area */}
          {task.hasSubOptions ? (
             <div className="space-y-3 pl-9 border-l-2 border-slate-100 dark:border-slate-800 ml-3">
                <p className="text-xs font-bold text-slate-400 uppercase">Options Configuration</p>
                {task.subOptions.map((opt, optIndex) => (
                   <div key={opt.id} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={opt.label}
                        onChange={(e) => {
                           const newOpts = [...task.subOptions];
                           newOpts[optIndex] = { ...opt, label: e.target.value };
                           onUpdateStructure(task.id, { subOptions: newOpts });
                        }}
                        className="flex-1 p-2 h-9 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-indigo-500 outline-none"
                        placeholder="Option Label (e.g. 30 Mins)"
                      />
                      <div className="flex items-center gap-1">
                         <input 
                            type="number" 
                            value={opt.points}
                            onChange={(e) => {
                               const newOpts = [...task.subOptions];
                               newOpts[optIndex] = { ...opt, points: parseInt(e.target.value) || 0 };
                               onUpdateStructure(task.id, { subOptions: newOpts });
                            }}
                            className="w-16 p-2 h-9 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-center focus:border-indigo-500 outline-none"
                            placeholder="Pts"
                         />
                         <span className="text-xs text-slate-400">pts</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                           const newOpts = task.subOptions.filter(o => o.id !== opt.id);
                           onUpdateStructure(task.id, { subOptions: newOpts });
                        }}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                      >
                         <X size={16} />
                      </button>
                   </div>
                ))}
                <button 
                  type="button"
                  onClick={() => {
                     const newOpt: SubOption = { 
                        id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
                        label: '', 
                        points: 5 
                     };
                     onUpdateStructure(task.id, { subOptions: [...task.subOptions, newOpt] });
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
                >
                   <Plus size={14} /> Add Option
                </button>
             </div>
          ) : (
             <div className="pl-9 ml-3">
                <div className="flex items-center gap-3">
                   <label className="text-sm text-slate-600 dark:text-slate-300">Points for completion:</label>
                   <input 
                      type="number"
                      value={task.basePoints}
                      onChange={(e) => onUpdateStructure(task.id, { basePoints: parseInt(e.target.value) || 0 })}
                      className="w-20 p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-center focus:border-indigo-500 outline-none"
                   />
                </div>
             </div>
          )}
        </div>
      </div>
    );
  }

  // --- NORMAL VIEW RENDERING ---
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md">
      <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
             {index + 1}
          </span>
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">{task.title}</h3>
        </div>
        {task.hasSubOptions ? (
          <span className="text-xs text-slate-400 dark:text-slate-500">Select option</span>
        ) : (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{task.basePoints} pts</span>
        )}
      </div>
      
      <div className="p-4">
        {task.hasSubOptions ? (
          // Radio Group for Tasks with sub-options
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {task.subOptions.map((option) => {
              const isSelected = task.selectedSubOptionId === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    // Toggle: if clicking selected, deselect it
                    const newValue = isSelected ? null : option.id;
                    onUpdate(date, task.id, { selectedSubOptionId: newValue });
                  }}
                  className={`relative flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="font-medium text-sm">{option.label}</span>
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-bold">{option.points} pts</span>
                     <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                       isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-300 dark:border-slate-600'
                     }`}>
                       {isSelected && <Check size={10} className="text-white" />}
                     </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          // Simple Checkbox for simple tasks
          <button
            onClick={() => onUpdate(date, task.id, { isCompleted: !task.isCompleted })}
            className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              task.isCompleted
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100'
                : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="font-medium">Complete Activity</span>
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
               task.isCompleted ? 'border-amber-500 bg-amber-500' : 'border-slate-300 dark:border-slate-600'
            }`}>
              {task.isCompleted && <Check size={16} className="text-white" />}
            </div>
          </button>
        )}
      </div>
    </div>
  );
});

const DailyView: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { getDay, updateTask, updateDayTasks, saveTaskTemplate } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  // Validate date param or default to today
  const targetDate = date || format(new Date(), 'yyyy-MM-dd');
  
  // Memoize data fetching
  const dayData = useMemo(() => getDay(targetDate), [getDay, targetDate]);
  
  const handlePrevDay = () => {
    navigate(`/day/${format(subDays(parseISO(targetDate), 1), 'yyyy-MM-dd')}`);
  };

  const handleNextDay = () => {
    navigate(`/day/${format(addDays(parseISO(targetDate), 1), 'yyyy-MM-dd')}`);
  };

  // Handler for checking/unchecking items (Normal Mode)
  const handleUpdateTask = useCallback((date: string, taskId: string, updates: Partial<Task>) => {
    updateTask(date, taskId, updates);
  }, [updateTask]);

  // Handler for Structural Updates (Edit Mode)
  const handleUpdateTaskStructure = useCallback((taskId: string, updates: Partial<Task>) => {
    const updatedTasks = dayData.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    updateDayTasks(targetDate, updatedTasks);
  }, [dayData.tasks, updateDayTasks, targetDate]);

  // Add New Task
  const handleAddTask = useCallback(() => {
    const newTask: Task = {
       id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
       title: 'New Activity',
       basePoints: 5,
       hasSubOptions: false,
       isCompleted: false,
       selectedSubOptionId: null,
       subOptions: []
    };
    updateDayTasks(targetDate, [...dayData.tasks, newTask]);
  }, [dayData.tasks, updateDayTasks, targetDate]);

  // Delete Task
  const handleDeleteTask = useCallback((taskId: string) => {
     if (window.confirm("Delete this task?")) {
        const updatedTasks = dayData.tasks.filter(t => t.id !== taskId);
        updateDayTasks(targetDate, updatedTasks);
     }
  }, [dayData.tasks, updateDayTasks, targetDate]);

  const handleSaveAsDefault = () => {
     saveTaskTemplate(dayData.tasks);
     alert("Current tasks saved as the default template for all new days!");
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center justify-between w-full md:w-auto gap-4 order-2 md:order-1">
          <button onClick={handlePrevDay} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <ChevronLeft size={24} />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {format(parseISO(targetDate), 'EEEE, MMM do')}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className={`font-semibold ${getStatusColorClasses(dayData.status)}`}>
                {dayData.totalPoints} Points
              </span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className={`text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getStatusColorClasses(dayData.status, true)}`}>
                {dayData.status}
              </span>
            </div>
          </div>

          <button onClick={handleNextDay} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Edit Toggle */}
        <div className="order-1 md:order-2 self-end md:self-auto flex gap-2">
           {isEditing && (
             <button 
               onClick={handleSaveAsDefault}
               className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
               title="Make these tasks the default for new days"
             >
               <Copy size={18} />
               <span className="hidden sm:inline">Save as Default</span>
             </button>
           )}
           <button 
             onClick={() => setIsEditing(!isEditing)}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
               isEditing 
                 ? 'bg-indigo-600 text-white shadow-md' 
                 : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
             }`}
           >
             {isEditing ? <Save size={18} /> : <Settings2 size={18} />}
             <span>{isEditing ? 'Done Editing' : 'Edit Tasks'}</span>
           </button>
        </div>
      </div>

      {/* Progress Bar (Hidden in Edit Mode to reduce clutter) */}
      {!isEditing && (
        <div className="bg-slate-200 dark:bg-slate-800 h-2 w-full rounded-full overflow-hidden mb-8 transition-colors">
          <div 
            className={`h-full transition-all duration-500 ease-out ${
              dayData.status === 'green' ? 'bg-emerald-500' :
              dayData.status === 'yellow' ? 'bg-amber-400' : 'bg-rose-500'
            }`}
            style={{ width: `${dayData.targetPoints > 0 ? Math.min((dayData.totalPoints / dayData.targetPoints) * 100, 100) : 0}%` }}
          />
        </div>
      )}

      {/* Task List */}
      <div className="space-y-4">
        {dayData.tasks.map((task, index) => (
          <TaskItem 
            key={task.id} 
            index={index}
            task={task} 
            date={targetDate} 
            isEditing={isEditing}
            onUpdate={handleUpdateTask} 
            onUpdateStructure={handleUpdateTaskStructure}
            onDelete={handleDeleteTask}
          />
        ))}

        {isEditing && (
          <button 
            onClick={handleAddTask}
            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-500 dark:hover:border-indigo-400 dark:hover:text-indigo-400 flex items-center justify-center gap-2 font-medium transition-all"
          >
             <Plus size={20} /> Add New Task
          </button>
        )}
      </div>

      {/* Empty State */}
      {dayData.tasks.length === 0 && !isEditing && (
        <div className="mt-8 text-center text-slate-400 dark:text-slate-500 py-12 bg-slate-100 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors">
           <AlertTriangle className="mx-auto mb-2 opacity-50" size={32} />
           <p>No tasks found for today.</p>
           <button onClick={() => setIsEditing(true)} className="text-indigo-600 dark:text-indigo-400 font-medium mt-2 hover:underline">
             Add your first task
           </button>
        </div>
      )}
    </div>
  );
};

export default DailyView;
