// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './GlobalStyle';
import { lightTheme, darkTheme } from './theme';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import MonthlyPlanner from './components/MonthlyPlanner';
import Settings from './components/Settings';
import VerifyEmail from './components/VerifyEmail'; // ✅ Import the new component

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/planner" replace /> : children;
};

function App() {
  const token = localStorage.getItem('token');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />
      <Router>
        <Navbar toggleTheme={toggleTheme} />
        <Routes>
        <Route path="/" element={token ? <Navigate to="/planner" replace /> : <Home />} />
          <Route path="/planner" element={<RequireAuth><MonthlyPlanner /></RequireAuth>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/verify" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} /> {/* New route */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
