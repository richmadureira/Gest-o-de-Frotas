import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import Dashboard from './pages/Dashboard';
import Checklist from './pages/Checklist';
import Reports from './pages/Reports';
import Vehicles from './pages/Vehicles';
import Login from './components/Login';
import Summary from './pages/Summary'; // Importa a nova página de resumo
import Drivers from './pages/Drivers'; // Certifique-se de que a grafia corresponde ao nome real do arquivo
import ReportDetails from './pages/ReportDetails'; // Importa a nova página de detalhes do relatório
import Settings from './pages/Settings'; // Importa a nova página de configurações
import Maintenance from './pages/Maintenance'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />
          <Route
            path="/checklist"
            element={isAuthenticated ? <Checklist /> : <Navigate to="/login" />}
          />
          <Route
            path="/reports"
            element={isAuthenticated ? <Reports /> : <Navigate to="/login" />}
          />
          <Route
            path="/vehicles"
            element={isAuthenticated ? <Vehicles /> : <Navigate to="/login" />}
          />
          <Route
            path="/summary"
            element={isAuthenticated ? <Summary /> : <Navigate to="/login" />}
          />
          <Route
            path="/drivers"
            element={isAuthenticated ? <Drivers /> : <Navigate to="/login" />}
          />
          <Route
            path="/report-details"
            element={isAuthenticated ? <ReportDetails /> : <Navigate to="/login" />}
          />
            <Route
            path="/settings"
            element={isAuthenticated ? <Settings /> : <Navigate to="/login" />}
          />
            <Route
            path="/maintenance"
            element={isAuthenticated ? <Maintenance /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
