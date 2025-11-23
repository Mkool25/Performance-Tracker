
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';
import { LogOut, User as UserIcon, Calendar, Trophy, Target, Save } from 'lucide-react';
import { DayEntry } from '../types';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { state, updateSettings } = useApp();
  const [targetInput, setTargetInput] = useState(state.settings.dailyTarget.toString());
  const [savedMsg, setSavedMsg] = useState('');

  if (!user) return null;

  const totalPoints = Object.values(state.days).reduce((acc: number, day: DayEntry) => acc + day.totalPoints, 0);
  const totalDays = Object.keys(state.days).length;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(targetInput);
    if (!isNaN(val) && val > 0) {
      updateSettings({ dailyTarget: val });
      setSavedMsg('Saved!');
      setTimeout(() => setSavedMsg(''), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage your account and settings</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-24"></div>
        <div className="px-6 pb-6">
          <div className="relative -mt-10 mb-4">
             <div className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-2xl font-bold shadow-md">
                {user.name.charAt(0).toUpperCase()}
             </div>
          </div>
          
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 text-sm">
                   <UserIcon size={14} /> {user.email}
                </p>
                <p className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-1 text-sm">
                   <Calendar size={14} /> Joined {format(parseISO(user.joinedAt), 'MMM dd, yyyy')}
                </p>
             </div>
             <button 
               onClick={logout}
               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 font-medium transition-colors text-sm"
             >
                <LogOut size={16} />
                Sign Out
             </button>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
           <Target size={20} className="text-indigo-500" />
           Goal Settings
        </h3>
        <form onSubmit={handleSaveSettings} className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Daily Point Target
            </label>
            <input 
              type="number"
              min="1"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button 
            type="submit" 
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            Save
          </button>
        </form>
        {savedMsg && (
          <p className="mt-2 text-sm text-emerald-500 font-medium">{savedMsg}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg">
                   <Trophy size={20} />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Lifetime Points</span>
             </div>
             <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalPoints}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                   <Calendar size={20} />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Days Tracked</span>
             </div>
             <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalDays}</p>
         </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-center transition-colors">
         <p className="text-sm text-slate-500 dark:text-slate-400">
            Current Application Version: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">1.0.1</span>
         </p>
         <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Your data is locally stored and tied to your user ID.
         </p>
      </div>
    </div>
  );
};

export default Profile;
