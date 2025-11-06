import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, IconButton, Box, CssBaseline, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import theme from './theme';
import Dashboard from './pages/Dashboard';
import Checklist from './pages/Checklist';
import Vehicles from './pages/Vehicles';
import Login from './components/Login';
import Summary from './pages/Summary'; // Importa a nova página de resumo
import Drivers from './pages/Drivers'; // Certifique-se de que a grafia corresponde ao nome real do arquivo
import ReportDetails from './pages/ReportDetails'; // Importa a nova página de detalhes do relatório
 // Importa a nova página de configurações
import Maintenance from './pages/Maintenance';
import MaintenanceSAP from './pages/MaintenanceSAP'; 
import Sidebar from './components/Sidebar';
import { useAuth } from './components/AuthContext';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import ChecklistManagement from './pages/ChecklistManagement';
import CondutorHome from './pages/CondutorHome';
import AuditLogs from './pages/AuditLogs';
import VehicleHistory from './pages/VehicleHistory';
import ChangePasswordDialog from './components/ChangePasswordDialog';
import CnhAlert from './components/CnhAlert';

const drawerWidth = 240;

const routePermissions = {
  '/checklist': ['admin', 'gestor', 'condutor'],
  '/vehicles': ['admin', 'gestor'],
  '/summary': ['admin', 'gestor'],
  '/drivers': ['admin', 'gestor'],
  '/report-details': ['admin', 'gestor'],
  '/maintenance': ['admin', 'gestor'],
  '/audit-logs': ['admin'],
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
  const { isAuthenticated, logout, userRole, primeiroLogin, user } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = React.useState(false);
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('md'));

  // Verificar se precisa mostrar dialog de troca de senha
  React.useEffect(() => {
    console.log('[App] useEffect - isAuthenticated:', isAuthenticated, 'primeiroLogin:', primeiroLogin);
    
    if (isAuthenticated && primeiroLogin) {
      console.log('[App] Primeiro login detectado! Abrindo dialog...');
      setShowChangePasswordDialog(true);
    } else {
      setShowChangePasswordDialog(false);
    }
  }, [isAuthenticated, primeiroLogin]);

  const handleLogout = () => {
    logout();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Interface específica para condutores (sem sidebar)
  const CondutorLayout = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Checklist Diário - Gestão de Frota
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* Alerta de CNH para condutores */}
      {user?.cnhVencida !== undefined && (
        <CnhAlert cnhVencida={user.cnhVencida} cnhVenceEm={user.cnhVenceEm} />
      )}
      <Box component="main" sx={{ flexGrow: 1, mt: user?.cnhVencida || (user?.cnhVenceEm !== null && user?.cnhVenceEm !== undefined && user?.cnhVenceEm <= 30) ? 16 : 8, p: 0 }}>
        <Routes>
          <Route path="/" element={<CondutorHome />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );

  // Interface padrão para admin/gestor (com sidebar)
  const AdminGestorLayout = () => (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          {!isDesktop && (
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
          <IconButton color="inherit" onClick={handleLogout} aria-label="Sair">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* Alerta de CNH para admin/gestor que são condutores */}
      {user?.cnhVencida !== undefined && (
        <CnhAlert cnhVencida={user.cnhVencida} cnhVenceEm={user.cnhVenceEm} />
      )}
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          mt: user?.cnhVencida || (user?.cnhVenceEm !== null && user?.cnhVenceEm !== undefined && user?.cnhVenceEm <= 30) ? 16 : 8,
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard onLogout={handleLogout} />} />
          <Route path="/checklist" element={<ProtectedRoute path="/checklist" element={<ChecklistManagement />} />} />
          <Route path="/vehicles" element={<ProtectedRoute path="/vehicles" element={<Vehicles />} />} />
          <Route path="/vehicles/:id/historico" element={<ProtectedRoute path="/vehicles" element={<VehicleHistory />} />} />
          <Route path="/summary" element={<ProtectedRoute path="/summary" element={<Summary />} />} />
          <Route path="/drivers" element={<ProtectedRoute path="/drivers" element={<Drivers />} />} />
          <Route path="/report-details" element={<ProtectedRoute path="/report-details" element={<ReportDetails />} />} />
        <Route path="/maintenance" element={<ProtectedRoute path="/maintenance" element={<Maintenance />} />} />
        <Route path="/maintenance/new" element={<ProtectedRoute path="/maintenance" element={<Maintenance />} />} />
          <Route path="/audit-logs" element={<ProtectedRoute path="/audit-logs" element={<AuditLogs />} />} />
          <Route path="*" element={<Dashboard onLogout={handleLogout} />} />
        </Routes>
        <Box sx={{ position: 'fixed', bottom: 16, right: 24, zIndex: 1300 }}>
          <Typography variant="caption" color="textSecondary">
            v1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  const handlePasswordChangeComplete = () => {
    console.log('[App] Senha alterada com sucesso, fechando dialog');
    setShowChangePasswordDialog(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        {isAuthenticated ? (
          userRole === 'condutor' ? <CondutorLayout /> : <AdminGestorLayout />
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </Router>
      
      {/* Dialog de troca de senha no primeiro login - renderizado globalmente */}
      <ChangePasswordDialog
        open={showChangePasswordDialog}
        onClose={handlePasswordChangeComplete}
        obrigatorio={true}
      />
    </ThemeProvider>
  );
}

export default App;
