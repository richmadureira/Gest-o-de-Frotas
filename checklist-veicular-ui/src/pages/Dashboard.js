import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
            Dashboard - Gestão de Frota
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Sair</Button>
        </Toolbar>
      </AppBar>

      {/* Conteúdo Principal do Dashboard */}
      <Container maxWidth="md" style={{ marginTop: '2rem' }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Bem-vindo ao Dashboard!
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center" gutterBottom>
          Escolha uma das opções abaixo para gerenciar a frota de veículos.
        </Typography>

        {/* Cards para Opções do Dashboard */}
        <Grid container spacing={4} style={{ marginTop: '2rem' }}>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
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
        </Grid>
      </Container>
    </Box>
  );
}

export default Dashboard;
