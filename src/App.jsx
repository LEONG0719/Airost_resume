import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import useSessionTimeout from './hooks/useSessionTimeout';


import './css/style.css';
import './charts/ChartjsConfig';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ActivityDashboard from './pages/ActivityDashboard';
import TeamDashboard from './pages/TeamDashboard';
import EditActivity from './pages/EditActivity';
import CalendarPage from './pages/CalendarPage';
import Inbox from './pages/Inbox';
import SearchPage from './pages/SearchPage';
import Reports from './pages/Reports';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Logout logic
  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    Cookies.remove('internalId');
    Cookies.remove('user_name');
    Cookies.remove('user_avatar');
    navigate('/login');
  };

  // Session timeout hook
  const { showWarning, extendSession } = useSessionTimeout(handleLogout);

  // Scroll reset
  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html').style.scrollBehavior = '';
  }, [location.pathname]);


  // Token validation on route change
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          Cookies.remove('token');
          Cookies.remove('role');
        }
      } catch (err) {
        console.error('Invalid token', err);
        Cookies.remove('token');
        Cookies.remove('role');
      }
    }
  }, [location.pathname]);

  // Auto-redirect to dashboard if logged in

  useEffect(() => {
    const token = Cookies.get('token');
    const role = Cookies.get('role');
    if (token && (location.pathname === '/' || location.pathname === '/login')) {
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return (
    <>
      {/* Extend session warning */}
      {showWarning && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-900 px-4 py-3 rounded shadow-lg z-50">
          <p className="mb-2">Your session is about to expire.</p>
          <button
            className="text-blue-600 underline text-sm"
            onClick={extendSession}
          >
            Extend Session
          </button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/activity" element={<ActivityDashboard />} />
        <Route path="/team" element={<TeamDashboard />} />
        <Route path="/edit" element={<EditActivity />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </>
  );
}

export default App;
