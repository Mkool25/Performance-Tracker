import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DailyView from './pages/DailyView';
import WeeklyView from './pages/WeeklyView';
import MonthlyView from './pages/MonthlyView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const PublicRoute = () => {
    const { user, isLoading } = useAuth();
    
    if (isLoading) return null;

    if (user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Main App Routes (Publicly Accessible) */}
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/day/:date" element={<DailyView />} />
              <Route path="/weekly" element={<WeeklyView />} />
              <Route path="/monthly" element={<MonthlyView />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;