import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  DirectionsCar as DirectionsCarIcon,
  AttachMoney as AttachMoneyIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../components/AuthContext';
import { getMeuChecklistHoje, getDashboardData } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  onLogout?: () => void;
  userName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, userName }) => {
  const [checklistHoje, setChecklistHoje] = useState<any>(null);
  const [loadingChecklist, setLoadingChecklist] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const { userRole } = useAuth();
  const navigate = useNavigate();

  // Carregar checklist do dia para condutores
  useEffect(() => {
    const carregarChecklistHoje = async () => {
      try {
        setLoadingChecklist(true);
        const resultado = await getMeuChecklistHoje();
        setChecklistHoje(resultado);
      } catch (err) {
        console.error('Erro ao carregar checklist:', err);
      } finally {
        setLoadingChecklist(false);
      }
    };

    if (userRole === 'condutor') {
      carregarChecklistHoje();
    }
  }, [userRole]);

  // Carregar dados do dashboard para gestores/admin
  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        setLoadingDashboard(true);
        console.log('[Dashboard] Carregando dados do dashboard...');
        const data = await getDashboardData();
        console.log('[Dashboard] Dados recebidos:', data);
        setDashboardData(data);
      } catch (err: any) {
        console.error('[Dashboard] Erro ao carregar dashboard:', err);
        console.error('[Dashboard] Detalhes do erro:', err.response?.data);
      } finally {
        setLoadingDashboard(false);
      }
    };

    if (userRole === 'gestor' || userRole === 'admin') {
      console.log('[Dashboard] userRole detectado:', userRole);
      carregarDashboard();
    }
  }, [userRole]);

  // Condutor view
  if (userRole === 'condutor') {
    return (
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 4 },
          width: '100%',
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Bem-vindo, Condutor!
        </Typography>
        <Typography variant="body1">
          Use o menu para acessar o checklist diário.
        </Typography>
      </Box>
    );
  }

  // Visão padrão para admin/gestor
  if (userRole === 'gestor' || userRole === 'admin') {
    console.log('[Dashboard] Renderizando com dashboardData:', dashboardData);

    return (
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        {loadingDashboard ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
              Dashboard - Gestão de Frotas
            </Typography>

            {/* Seção Superior - KPIs */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Card 1: Frota Ativa */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <DirectionsCarIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        Frota Ativa
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {dashboardData?.kpis.frota.disponiveis || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      de {dashboardData?.kpis.frota.total || 0} veículos
                    </Typography>
                    <Typography variant="caption" color="success.main" fontWeight="bold">
                      {dashboardData?.kpis.frota.taxaDisponibilidade || 0}% disponível
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 2: Checklists Hoje */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <AssignmentTurnedInIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        Checklists Hoje
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {dashboardData?.kpis.checklists.concluidos || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      de {dashboardData?.kpis.checklists.total || 0} concluídos
                    </Typography>
                    <Typography variant="caption" color="primary.main" fontWeight="bold">
                      {dashboardData?.kpis.checklists.taxaConclusao || 0}% taxa
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 3: Manutenções */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <BuildIcon color="warning" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        Manutenções
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {dashboardData?.kpis.manutencoes.ativas || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ativas
                    </Typography>
                    {(dashboardData?.kpis.manutencoes.atrasadas || 0) > 0 && (
                      <Typography variant="caption" color="error.main" fontWeight="bold">
                        {dashboardData?.kpis.manutencoes.atrasadas} atrasadas
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 4: Custos Mês */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <AttachMoneyIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        Custos Mês
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      R$ {(dashboardData?.kpis.custos.mesAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      manutenções
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Seção Central - Alertas */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Alertas Críticos */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', minHeight: 300 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <WarningIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="h6">Alertas Críticos</Typography>
                    </Box>

                    {/* CNH Vencida */}
                    {dashboardData?.alertas.cnhVencidas && dashboardData.alertas.cnhVencidas.length > 0 ? (
                      <>
                        <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                          CNH Vencida ({dashboardData.alertas.cnhVencidas.length})
                        </Typography>
                        <List dense>
                          {dashboardData.alertas.cnhVencidas.map((alerta: any) => (
                            <ListItem key={alerta.id}>
                              <ListItemIcon>
                                <PersonIcon color="error" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={alerta.nome}
                                secondary={`Vencida há ${alerta.diasVencida} dias`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    ) : null}

                    {/* Manutenções Atrasadas */}
                    {dashboardData?.alertas.manutencoesAtrasadas && dashboardData.alertas.manutencoesAtrasadas.length > 0 ? (
                      <>
                        <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1, mt: dashboardData?.alertas.cnhVencidas?.length > 0 ? 2 : 0 }}>
                          Manutenções Atrasadas ({dashboardData.alertas.manutencoesAtrasadas.length})
                        </Typography>
                        <List dense>
                          {dashboardData.alertas.manutencoesAtrasadas.map((alerta: any) => (
                            <ListItem key={alerta.id}>
                              <ListItemIcon>
                                <BuildIcon color="warning" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={`${alerta.placa} - ${alerta.modelo}`}
                                secondary={`${alerta.diasAtraso} dias atrasada`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    ) : null}

                    {(!dashboardData?.alertas.cnhVencidas || dashboardData.alertas.cnhVencidas.length === 0) &&
                     (!dashboardData?.alertas.manutencoesAtrasadas || dashboardData.alertas.manutencoesAtrasadas.length === 0) && (
                      <Typography variant="body2" color="textSecondary">
                        Nenhum alerta crítico no momento
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Ações Pendentes */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', minHeight: 300 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Ações Pendentes</Typography>
                    </Box>

                    {dashboardData?.alertas.checklistsPendentes && dashboardData.alertas.checklistsPendentes.length > 0 ? (
                      <>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                          Checklists Atrasados ({dashboardData.alertas.checklistsPendentes.length})
                        </Typography>
                        <List dense>
                          {dashboardData.alertas.checklistsPendentes.map((alerta: any) => (
                            <ListItem key={alerta.id}>
                              <ListItemIcon>
                                <AccessTimeIcon color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={alerta.motorista}
                                secondary={`${alerta.veiculo} - ${alerta.horasAtraso}h atraso`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Nenhum checklist pendente atrasado
                      </Typography>
                    )}

                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/checklist')}
                    >
                      Ver todos os checklists
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Seção Inferior - Gráfico de Tendências */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                      Tendência de Checklists (Últimos 7 Dias)
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData?.tendencias.checklistsSemana || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dia" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="aprovados" fill="#4caf50" name="Aprovados" stackId="a" />
                        <Bar dataKey="rejeitados" fill="#f44336" name="Rejeitados" stackId="a" />
                        <Bar dataKey="pendentes" fill="#ff9800" name="Pendentes" stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

export default Dashboard;
