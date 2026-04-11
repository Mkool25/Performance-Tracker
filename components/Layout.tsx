import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, BarChart2, CheckSquare, User, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CheckSquare, label: 'Today', path: `/day/${today}` },
    { icon: Calendar, label: 'Weekly', path: '/weekly' },
    { icon: BarChart2, label: 'Monthly', path: '/monthly' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed h-full z-10 transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            PerfTracker
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Consistency is key</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {!user && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 mb-2">
              <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium mb-2">Guest Mode</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">Your progress is saved locally. Sign up to sync across devices.</p>
              <Link to="/signup" className="block text-center py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors">
                Sign Up Now
              </Link>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400"
          >
             {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             <span className="text-sm font-medium">
               {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
             </span>
          </button>

          <Link 
            to={user ? "/profile" : "/login"}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200"
          >
             <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                {user ? user.name.charAt(0).toUpperCase() : 'G'}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user ? user.name : 'Guest User'}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user ? 'View Profile' : 'Sign In'}</p>
             </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 flex justify-around p-2 pb-safe transition-colors">
        {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-lg ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Icon size={24} />
                <span className="text-[10px] mt-1">{item.label}</span>
              </Link>
            );
        })}
        <Link
          to={user ? "/profile" : "/login"}
          className={`flex flex-col items-center p-2 rounded-lg ${
             location.pathname === '/profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <User size={24} />
          <span className="text-[10px] mt-1">{user ? 'Profile' : 'Sign In'}</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;