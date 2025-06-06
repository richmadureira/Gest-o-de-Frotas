import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, IconButton, Box, CssBaseline, useMediaQuery, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
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
import Sidebar from './components/Sidebar';
import { useAuth, UserRole } from './components/AuthContext';

const drawerWidth = 240;

const routePermissions = {
  '/checklist': ['admin', 'gestor', 'condutor'],
  '/reports': ['admin', 'gestor'],
  '/vehicles': ['admin', 'gestor'],
  '/summary': ['admin', 'gestor'],
  '/drivers': ['admin', 'gestor'],
  '/report-details': ['admin', 'gestor'],
  '/settings': ['admin'],
  '/maintenance': ['admin', 'gestor'],
};

function ProtectedRoute({ element, path }: { element: React.ReactElement, path: keyof typeof routePermissions }) {
  const { userRole } = useAuth();
  const allowedRoles = routePermissions[path];
  if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
    return <Navigate to="/" replace />;
  }
  return element;
}

function App() {
  const { isAuthenticated, login, logout, userRole } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('md'));

  const handleLogin = (token: string, role: UserRole) => {
    login(token, role);
  };

  const handleLogout = () => {
    logout();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        {isAuthenticated ? (
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
              position="fixed"
              sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                width: userRole === 'condutor' ? '100%' : { md: `calc(100% - ${drawerWidth}px)` },
                ml: userRole === 'condutor' ? 0 : { md: `${drawerWidth}px` },
              }}
            >
              <Toolbar>
                {userRole !== 'condutor' && !isDesktop && (
                  <IconButton
                    color="inherit"
                    aria-label="abrir menu"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2 }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                  Gestão de Frota
                </Typography>
                <Button color="inherit" onClick={handleLogout}>
                  Sair
                </Button>
              </Toolbar>
            </AppBar>
            {userRole !== 'condutor' && (
              <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
            )}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                width: userRole === 'condutor' ? '100%' : { md: `calc(100% - ${drawerWidth}px)` },
                ml: userRole === 'condutor' ? 0 : { md: `${drawerWidth}px` },
                mt: 8,
              }}
            >
              {userRole === 'condutor' ? (
                <Routes>
                  <Route path="/checklist" element={<Checklist />} />
                  <Route path="*" element={<Navigate to="/checklist" replace />} />
                </Routes>
              ) : (
                <Routes>
                  <Route path="/" element={<Dashboard onLogout={handleLogout} />} />
                  <Route path="/checklist" element={<ProtectedRoute path="/checklist" element={<Checklist />} />} />
                  <Route path="/reports" element={<ProtectedRoute path="/reports" element={<Reports />} />} />
                  <Route path="/vehicles" element={<ProtectedRoute path="/vehicles" element={<Vehicles />} />} />
                  <Route path="/summary" element={<ProtectedRoute path="/summary" element={<Summary />} />} />
                  <Route path="/drivers" element={<ProtectedRoute path="/drivers" element={<Drivers />} />} />
                  <Route path="/report-details" element={<ProtectedRoute path="/report-details" element={<ReportDetails />} />} />
                  <Route path="/settings" element={<ProtectedRoute path="/settings" element={<Settings />} />} />
                  <Route path="/maintenance" element={<ProtectedRoute path="/maintenance" element={<Maintenance />} />} />
                  <Route path="*" element={<Dashboard onLogout={handleLogout} />} />
                </Routes>
              )}
            </Box>
          </Box>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
