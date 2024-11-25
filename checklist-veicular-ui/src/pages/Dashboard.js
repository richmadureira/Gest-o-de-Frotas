import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Grid, Card, CardContent, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';

function Dashboard({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* AppBar (Barra de Navegação Superior) */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gestão de Frota
          </Typography>
          <IconButton color="inherit" sx={{ marginRight: '1rem' }}>
            <NotificationsIcon />
          </IconButton>
          <Button color="inherit" onClick={handleLogout}>Sair</Button>
        </Toolbar>
      </AppBar>

      {/* Conteúdo Principal do Dashboard */}
      <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Bem-vindo ao Dashboard!
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center" gutterBottom>
          Acompanhe e gerencie todas as operações da frota de maneira eficiente.
        </Typography>

        {/* Cards para Opções do Dashboard */}
        <Grid container spacing={4} style={{ marginTop: '2rem' }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  Preencher Checklist Diário
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Acesse e preencha o checklist diário dos veículos.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  style={{ marginTop: '1rem' }}
                  onClick={() => navigate('/checklist')}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  Gerar Relatórios
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Visualize e gere relatórios sobre a frota.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  style={{ marginTop: '1rem' }}
                  onClick={() => navigate('/reports')}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  Gestão de Veículos
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Adicione ou edite informações sobre os veículos.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  style={{ marginTop: '1rem' }}
                  onClick={() => navigate('/vehicles')}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  Gerir Condutores
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Gerencie os condutores da frota.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  style={{ marginTop: '1rem' }}
                  onClick={() => navigate('/drivers')}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  Solicitações de Manutenção
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Inicie ou acompanhe solicitações de manutenção.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  style={{ marginTop: '1rem' }}
                  onClick={() => navigate('/maintenance')}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  Configurações
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Configure usuários, permissões e outros parâmetros do sistema.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  style={{ marginTop: '1rem' }}
                  onClick={() => navigate('/settings')}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Dashboard;
