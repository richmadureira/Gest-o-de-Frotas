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
import { getMeuChecklistHoje, getDashboardData, getAlertasCNH } from '../services/api';
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
  const [alertasCNH, setAlertasCNH] = useState<any>(null);
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
        
        // Carregar alertas de CNH
        try {
          const cnhData = await getAlertasCNH();
          
          // Os dados já vêm em camelCase do backend
          setAlertasCNH({
            vencidas: cnhData.vencidas || [],
            vencendo7Dias: cnhData.vencendo7Dias || [],
            vencendo15Dias: cnhData.vencendo15Dias || [],
            vencendo30Dias: cnhData.vencendo30Dias || [],
            totalAlertas: cnhData.totalAlertas || 0,
          });
        } catch (err) {
          console.error('[Dashboard] Erro ao carregar alertas CNH:', err);
        }
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
                <Card sx={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #1976d2', height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Frota Ativa
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {dashboardData?.kpis.frota.disponiveis || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          de {dashboardData?.kpis.frota.total || 0} veículos
                        </Typography>
                        <Typography variant="caption" color="success.main" fontWeight="bold">
                          {dashboardData?.kpis.frota.taxaDisponibilidade || 0}% disponível
                        </Typography>
                      </Box>
                      <DirectionsCarIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 2: Checklists Hoje */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50', height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Checklists Hoje
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {dashboardData?.kpis.checklists.concluidos || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          de {dashboardData?.kpis.checklists.total || 0} concluídos
                        </Typography>
                        <Typography variant="caption" color="primary.main" fontWeight="bold">
                          {dashboardData?.kpis.checklists.taxaConclusao || 0}% taxa
                        </Typography>
                      </Box>
                      <AssignmentTurnedInIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 3: Manutenções */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800', height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Manutenções
                        </Typography>
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
                      </Box>
                      <BuildIcon sx={{ fontSize: 40, color: '#ff9800' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 4: Custos Mês */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#e1f5fe', borderLeft: '4px solid #2196f3', height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Custos Mês
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          R$ {(dashboardData?.kpis.custos.mesAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          manutenções
                        </Typography>
                      </Box>
                      <AttachMoneyIcon sx={{ fontSize: 40, color: '#2196f3' }} />
                    </Box>
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

                    {/* CNH Vencidas */}
                    {alertasCNH?.vencidas && alertasCNH.vencidas.length > 0 && (
                      <>
                        <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                          CNH Vencida ({alertasCNH.vencidas.length})
                        </Typography>
                        <List dense>
                          {alertasCNH.vencidas.map((condutor: any) => (
                            <ListItem key={condutor.id}>
                              <ListItemIcon>
                                <PersonIcon color="error" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={condutor.nome}
                                secondary={`Vencida há ${Math.abs(condutor.diasParaVencer)} dias - CNH: ${condutor.cnhNumero}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                    {/* CNH Vencendo em 7 dias */}
                    {alertasCNH?.vencendo7Dias && alertasCNH.vencendo7Dias.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ color: '#ff9800', mb: 1, mt: 2 }}>
                          CNH Vencendo em até 7 dias ({alertasCNH.vencendo7Dias.length})
                        </Typography>
                        <List dense>
                          {alertasCNH.vencendo7Dias.map((condutor: any) => (
                            <ListItem key={condutor.id}>
                              <ListItemIcon>
                                <PersonIcon sx={{ color: '#ff9800' }} fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={condutor.nome}
                                secondary={`Vence em ${condutor.diasParaVencer} dia(s) - CNH: ${condutor.cnhNumero}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                    {/* CNH Vencendo em 15 dias */}
                    {alertasCNH?.vencendo15Dias && alertasCNH.vencendo15Dias.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ color: '#fbc02d', mb: 1, mt: 2 }}>
                          CNH Vencendo entre 8 e 15 dias ({alertasCNH.vencendo15Dias.length})
                        </Typography>
                        <List dense>
                          {alertasCNH.vencendo15Dias.map((condutor: any) => (
                            <ListItem key={condutor.id}>
                              <ListItemIcon>
                                <PersonIcon sx={{ color: '#fbc02d' }} fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={condutor.nome}
                                secondary={`Vence em ${condutor.diasParaVencer} dias - CNH: ${condutor.cnhNumero}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                    {/* CNH Vencendo em 30 dias */}
                    {alertasCNH?.vencendo30Dias && alertasCNH.vencendo30Dias.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ color: '#1976d2', mb: 1, mt: 2 }}>
                          CNH Vencendo entre 16 e 30 dias ({alertasCNH.vencendo30Dias.length})
                        </Typography>
                        <List dense>
                          {alertasCNH.vencendo30Dias.map((condutor: any) => (
                            <ListItem key={condutor.id}>
                              <ListItemIcon>
                                <PersonIcon sx={{ color: '#1976d2' }} fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={condutor.nome}
                                secondary={`Vence em ${condutor.diasParaVencer} dias - CNH: ${condutor.cnhNumero}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                    {/* Mensagem quando não há alertas */}
                    {(!alertasCNH || alertasCNH.totalAlertas === 0) && (
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
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

export default Dashboard;
