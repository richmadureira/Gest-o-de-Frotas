import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  useTheme,
  useMediaQuery,
  ListItemButton,
  Box
} from '@mui/material';
import ChecklistIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import translogLogo from '../image/translog.png';

const drawerWidth = 240;

const gestorAdminMenu = [
  { text: 'Início', icon: <HomeIcon />, path: '/' },
  { text: 'Checklists', icon: <AssignmentIcon />, path: '/checklist' },
  { text: 'Usuários', icon: <PersonIcon />, path: '/drivers' },
  { text: 'Veículos', icon: <DirectionsCarIcon />, path: '/vehicles' },
  { text: 'Manutenções', icon: <BuildIcon />, path: '/maintenance' },
];

const permissions = {
  admin: ['', 'checklist', 'vehicles', 'drivers', 'maintenance'],
  gestor: ['', 'checklist', 'vehicles', 'drivers', 'maintenance'],
  condutor: ['checklist'],
};

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onDrawerToggle }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const allowedNavItems = userRole && permissions[userRole] 
    ? gestorAdminMenu.filter(item => permissions[userRole].includes(item.path.split('/')[1])) 
    : [];

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 64 }}>
        <img src={translogLogo} alt="Logo TransLog" style={{ height: 40, maxHeight: 48, width: 'auto' }} />
      </Toolbar>
      <Divider />
      <List>
        {allowedNavItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (!isDesktop) onDrawerToggle();
              }}
              aria-label={`Ir para ${item.text}`}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <nav aria-label="Menu principal">
      {/* Drawer temporário para mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Drawer permanente para desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </nav>
  );
};

export default Sidebar; 