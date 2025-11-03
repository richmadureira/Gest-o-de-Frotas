import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  ArrowBack,
  DirectionsCar,
  Assignment,
  Build,
  BarChart as BarChartIcon,
  CheckCircle,
  Cancel,
  HourglassEmpty,
} from '@mui/icons-material';
import { getVeiculoHistorico } from '../services/api';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const VehicleHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historico, setHistorico] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [checklistPage, setChecklistPage] = useState(0);
  const [manutencaoPage, setManutencaoPage] = useState(0);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    const carregarHistorico = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getVeiculoHistorico(id);
        console.log('Histórico recebido:', data);
        setHistorico(data);
      } catch (err: any) {
        console.error('Erro ao carregar histórico:', err);
        setError(err.response?.data?.message || 'Erro ao carregar histórico do veículo');
      } finally {
        setLoading(false);
      }
    };
    carregarHistorico();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: any } = {
      'Aprovado': 'success',
      'Pendente': 'warning',
      'Rejeitado': 'error',
      'Disponivel': 'success',
      'EmManutencao': 'warning',
      'Inativo': 'error',
    };
    return statusMap[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labelMap: { [key: string]: string } = {
      'Aprovado': 'Aprovado',
      'Pendente': 'Pendente',
      'Rejeitado': 'Rejeitado',
      'Disponivel': 'Disponível',
      'EmManutencao': 'Em Manutenção',
      'Inativo': 'Inativo',
    };
    return labelMap[status] || status;
  };

  const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !historico) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" onClose={() => navigate('/vehicles')}>
          {error || 'Histórico não encontrado'}
        </Alert>
      </Container>
    );
  }

  const { veiculo, checklists, manutencoes, estatisticas, graficos } = historico;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header com botão voltar */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/vehicles')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          <DirectionsCar sx={{ mr: 1, verticalAlign: 'middle' }} />
          Histórico do Veículo
        </Typography>
      </Box>

      {/* Card com informações do veículo */}
      <Card sx={{ mb: 3, borderLeft: '4px solid #1976d2' }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">Placa</Typography>
              <Typography variant="h6" fontWeight="bold">{veiculo.placa}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">Marca/Modelo</Typography>
              <Typography variant="h6">{veiculo.marca} {veiculo.modelo}</Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="caption" color="textSecondary">Ano</Typography>
              <Typography variant="h6">{veiculo.ano}</Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="caption" color="textSecondary">Tipo</Typography>
              <Typography variant="h6">{veiculo.tipo}</Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="caption" color="textSecondary">Status</Typography>
              <Chip label={getStatusLabel(veiculo.status)} color={getStatusColor(veiculo.status)} size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="textSecondary">Quilometragem Atual</Typography>
              <Typography variant="h6">{veiculo.quilometragem?.toLocaleString() || 0} km</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="textSecondary">Última Manutenção</Typography>
              <Typography variant="body2">
                {veiculo.ultimaManutencao ? format(new Date(veiculo.ultimaManutencao), 'dd/MM/yyyy') : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="textSecondary">Próxima Manutenção</Typography>
              <Typography variant="body2">
                {veiculo.proximaManutencao ? format(new Date(veiculo.proximaManutencao), 'dd/MM/yyyy') : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Cards de estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Total Checklists</Typography>
                  <Typography variant="h4" fontWeight="bold">{estatisticas.totalChecklists}</Typography>
                  <Typography variant="caption" color="success.main">
                    {estatisticas.checklistsAprovados} aprovados
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: '#2196f3' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Total Manutenções</Typography>
                  <Typography variant="h4" fontWeight="bold">{estatisticas.totalManutencoes}</Typography>
                  <Typography variant="caption" color="info.main">
                    {estatisticas.manutencoesFinalizadas} finalizadas
                  </Typography>
                </Box>
                <Build sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Custo Total</Typography>
                  <Typography variant="h5" fontWeight="bold">
                    R$ {estatisticas.custoTotalManutencoes?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">Manutenções</Typography>
                </Box>
                <BarChartIcon sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fce4ec', borderLeft: '4px solid #e91e63' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Último Checklist</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {estatisticas.ultimoChecklist ? format(new Date(estatisticas.ultimoChecklist.data), 'dd/MM/yyyy') : 'N/A'}
                  </Typography>
                  <Chip 
                    label={estatisticas.ultimoChecklist ? getStatusLabel(estatisticas.ultimoChecklist.status) : 'N/A'} 
                    size="small" 
                    color={estatisticas.ultimoChecklist ? getStatusColor(estatisticas.ultimoChecklist.status) : 'default'}
                  />
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: '#e91e63' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label={`Checklists (${checklists.length})`} icon={<Assignment />} iconPosition="start" />
          <Tab label={`Manutenções (${manutencoes.length})`} icon={<Build />} iconPosition="start" />
        </Tabs>

        {/* Tab 1: Checklists */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Motorista</TableCell>
                  <TableCell>KM</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Pneus</TableCell>
                  <TableCell>Luzes</TableCell>
                  <TableCell>Freios</TableCell>
                  <TableCell>Limpeza</TableCell>
                  <TableCell>Observações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checklists.slice(checklistPage * rowsPerPage, checklistPage * rowsPerPage + rowsPerPage).map((checklist: any) => (
                  <TableRow key={checklist.id}>
                    <TableCell>{format(new Date(checklist.data), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{checklist.motoristaNome}</TableCell>
                    <TableCell>{checklist.kmVeiculo?.toLocaleString()} km</TableCell>
                    <TableCell>
                      <Chip label={getStatusLabel(checklist.status)} color={getStatusColor(checklist.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      {checklist.pneus ? <CheckCircle color="success" /> : <Cancel color="error" />}
                    </TableCell>
                    <TableCell>
                      {checklist.luzes ? <CheckCircle color="success" /> : <Cancel color="error" />}
                    </TableCell>
                    <TableCell>
                      {checklist.freios ? <CheckCircle color="success" /> : <Cancel color="error" />}
                    </TableCell>
                    <TableCell>
                      {checklist.limpeza ? <CheckCircle color="success" /> : <Cancel color="error" />}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={checklist.observacoes || 'Sem observações'}>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {checklist.observacoes || '-'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={checklists.length}
            page={checklistPage}
            onPageChange={(e, newPage) => setChecklistPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
            labelRowsPerPage="Linhas por página:"
          />
        </TabPanel>

        {/* Tab 2: Manutenções */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Prioridade</TableCell>
                  <TableCell>Status SAP</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>KM</TableCell>
                  <TableCell>Custo</TableCell>
                  <TableCell>Ordem SAP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {manutencoes.slice(manutencaoPage * rowsPerPage, manutencaoPage * rowsPerPage + rowsPerPage).map((manutencao: any) => (
                  <TableRow key={manutencao.id}>
                    <TableCell>{format(new Date(manutencao.criadoEm), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{manutencao.tipo}</TableCell>
                    <TableCell>
                      <Chip label={manutencao.prioridade} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={manutencao.statusSAP || 'N/A'} 
                        size="small" 
                        icon={<HourglassEmpty />}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={manutencao.descricao}>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {manutencao.descricao}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{manutencao.quilometragemNoAto?.toLocaleString() || '-'} km</TableCell>
                    <TableCell>R$ {manutencao.custo?.toFixed(2) || '0,00'}</TableCell>
                    <TableCell>{manutencao.numeroOrdemSAP || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={manutencoes.length}
            page={manutencaoPage}
            onPageChange={(e, newPage) => setManutencaoPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
            labelRowsPerPage="Linhas por página:"
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default VehicleHistory;

