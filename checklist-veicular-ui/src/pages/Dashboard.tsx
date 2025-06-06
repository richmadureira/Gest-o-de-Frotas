import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Modal,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../components/AuthContext';
import translogLogo from '../image/translog.png';

interface DashboardProps {
  onLogout?: () => void;
  userName?: string;
}

// Mock data for condutor
const checklistData = {
  status: 'Pendente',
  lastCheck: '2024-06-07 08:30',
};

const pendingItems = [
  { id: 1, description: 'Há 2 avarias não registradas', type: 'avaria', link: '/checklist' },
  { id: 2, description: 'Checklist de ontem faltando foto de avaria', type: 'foto', link: '/checklist' },
];

const chartData = [
  { day: 'Seg', preenchidos: 1, naoPreenchidos: 0 },
  { day: 'Ter', preenchidos: 1, naoPreenchidos: 0 },
  { day: 'Qua', preenchidos: 0, naoPreenchidos: 1 },
  { day: 'Qui', preenchidos: 1, naoPreenchidos: 0 },
  { day: 'Sex', preenchidos: 1, naoPreenchidos: 0 },
  { day: 'Sáb', preenchidos: 0, naoPreenchidos: 1 },
  { day: 'Dom', preenchidos: 1, naoPreenchidos: 0 },
];

const recentPhotos = [
  { id: 1, vehicle: 'Fiat Strada', date: '2024-06-07 08:30', url: 'https://via.placeholder.com/150', desc: 'Avaria no para-choque' },
  { id: 2, vehicle: 'Volkswagen Gol', date: '2024-06-06 15:45', url: 'https://via.placeholder.com/150', desc: 'Risco na porta' },
  { id: 3, vehicle: 'Chevrolet Onix', date: '2024-06-05 10:20', url: 'https://via.placeholder.com/150', desc: 'Trinca no vidro' },
];

const condutorMenu = [
  { text: 'Início', icon: <HomeIcon />, path: '/' },
  { text: 'Preencher Checklist', icon: <AssignmentIcon />, path: '/checklist', highlight: true },
  { text: 'Histórico de Checklists', icon: <HistoryIcon />, path: '/historico' },
  { text: 'Perfil', icon: <PersonIcon />, path: '/perfil' },
];

const Dashboard: React.FC<DashboardProps> = ({ onLogout, userName }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { userRole, logout } = useAuth();

  // Helper: get full user name if available
  const displayName = userName || 'Usuário';

  // Condutor view
  if (userRole === 'condutor') {
    return (
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          ml: { md: '240px' },
          mt: 8,
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <Grid container spacing={3}>
          {/* Card 1: Checklist de Hoje */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Checklist de Hoje
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Status: {checklistData.status}
                </Typography>
                <Button
                  variant="contained"
                  color={checklistData.status === 'Pendente' ? 'primary' : 'secondary'}
                  fullWidth
                  sx={{ mt: 2 }}
                  href="/checklist"
                >
                  {checklistData.status === 'Pendente' ? 'Preencher agora' : 'Ver detalhes'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Botão de Contato Suporte fixo */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: { xs: 24, md: 264 }, // 240px drawer + 24px
            zIndex: 1300,
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SupportIcon />}
            onClick={() => setSupportModalOpen(true)}
          >
            Contato Suporte
          </Button>
        </Box>
        {/* Modal de Suporte */}
        <Modal
          open={supportModalOpen}
          onClose={() => setSupportModalOpen(false)}
          aria-labelledby="support-modal"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Contato Suporte
            </Typography>
            <Typography>Email: suporte@translog.com.br</Typography>
            <Typography>Telefone: (11) 1234-5678</Typography>
          </Box>
        </Modal>
      </Box>
    );
  }

  // Visão padrão para admin/gestor (mantém como está)
  const quickSummary = [
    {
      label: 'Veículos',
      value: 24,
      icon: <HomeIcon color="primary" fontSize="large" />,
    },
    {
      label: 'Checklists Pendentes',
      value: 3,
      icon: <AssignmentIcon color="warning" fontSize="large" />,
    },
    {
      label: 'Manutenções',
      value: 2,
      icon: <HistoryIcon color="secondary" fontSize="large" />,
    },
    {
      label: 'Alertas',
      value: 1,
      icon: <PersonIcon color="error" fontSize="large" />,
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} mb={3}>
        {quickSummary.map((item: any) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: { xs: 1.5, sm: 2 },
                minHeight: { xs: 80, sm: 100 },
                boxShadow: 3,
                borderRadius: 2,
              }}
            >
              <Box sx={{ mr: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center' }}>{item.icon}</Box>
              <CardContent sx={{ flex: 1, p: '8px !important' }}>
                <Typography variant="h5" sx={{ fontSize: { xs: '1.3rem', sm: '1.7rem' } }}>{item.value}</Typography>
                <Typography color="textSecondary" sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>{item.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* ...restante do dashboard admin/gestor... */}
    </Box>
  );
};

export default Dashboard;
