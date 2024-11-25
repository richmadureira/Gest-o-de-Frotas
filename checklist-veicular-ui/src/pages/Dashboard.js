import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  IconButton 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import ChecklistIcon from '@mui/icons-material/CheckCircle';

function Dashboard({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const cardData = [
    {
      title: 'Preencher Checklist Diário',
      description: 'Acesse e preencha o checklist diário dos veículos.',
      icon: <ChecklistIcon fontSize="large" style={{ color: '#4caf50' }} />,
      action: () => navigate('/checklist'),
    },
    {
      title: 'Gerar Relatórios',
      description: 'Visualize e gere relatórios sobre a frota.',
      icon: <AssessmentIcon fontSize="large" style={{ color: '#2196f3' }} />,
      action: () => navigate('/reports'),
    },
    {
      title: 'Gestão de Veículos',
      description: 'Adicione ou edite informações sobre os veículos.',
      icon: <DirectionsCarIcon fontSize="large" style={{ color: '#ff9800' }} />,
      action: () => navigate('/vehicles'),
    },
    {
      title: 'Gerir Condutores',
      description: 'Gerencie os condutores da frota.',
      icon: <PeopleIcon fontSize="large" style={{ color: '#9c27b0' }} />,
      action: () => navigate('/drivers'),
    },
    {
      title: 'Solicitações de Manutenção',
      description: 'Inicie ou acompanhe solicitações de manutenção.',
      icon: <BuildIcon fontSize="large" style={{ color: '#f44336' }} />,
      action: () => navigate('/maintenance'),
    },
    {
      title: 'Configurações',
      description: 'Configure usuários, permissões e outros parâmetros do sistema.',
      icon: <SettingsIcon fontSize="large" style={{ color: '#3f51b5' }} />,
      action: () => navigate('/settings'),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gestão de Frota
          </Typography>
          <IconButton color="inherit" sx={{ marginRight: '1rem' }}>
            <NotificationsIcon />
          </IconButton>
          <Button color="inherit" onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      {/* Conteúdo Principal */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Bem-vindo ao Dashboard!
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center" gutterBottom>
          Acompanhe e gerencie todas as operações da frota de maneira eficiente.
        </Typography>

        {/* Grid de Cards */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {cardData.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  textAlign: 'center',
                  boxShadow: 3,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <CardContent>
                  {card.icon}
                  <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {card.description}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={card.action}
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Dashboard;
