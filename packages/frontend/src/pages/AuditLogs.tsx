import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import { Search, Visibility, FilterList, History, Person, Build as BuildIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import api, { getAuditLogs } from '../services/api';

interface AuditLog {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  acao: string;
  entidade: string;
  entidadeId?: string;
  valoresAntigos?: string;
  valoresNovos?: string;
  dataHora: string;
  ipAddress?: string;
  userAgent?: string;
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    usuarioId: '',
    acao: '',
    entidade: '',
    dataInicio: '',
    dataFim: ''
  });
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  
  // Estatísticas
  const [stats, setStats] = useState<any>(null);
  
  // Dialog de detalhes
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [openDetails, setOpenDetails] = useState(false);

  useEffect(() => {
    carregarLogs();
    carregarStats();
  }, [page, rowsPerPage]);

  // Filtrar automaticamente quando os filtros mudarem
  useEffect(() => {
    if (filtros.usuarioId || filtros.acao || filtros.entidade || filtros.dataInicio || filtros.dataFim) {
      setPage(0);
      carregarLogs();
    }
  }, [filtros.usuarioId, filtros.acao, filtros.entidade, filtros.dataInicio, filtros.dataFim]);

  const carregarLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        pageSize: rowsPerPage.toString(),
        ...(filtros.usuarioId && { usuarioId: filtros.usuarioId }),
        ...(filtros.acao && { acao: filtros.acao }),
        ...(filtros.entidade && { entidade: filtros.entidade }),
        ...(filtros.dataInicio && { dataInicio: filtros.dataInicio }),
        ...(filtros.dataFim && { dataFim: filtros.dataFim }),
      });

      const response = await api.get(`/auditlogs?${params}`);
      setLogs(response.data.data);
      setTotal(response.data.total);
    } catch (err: any) {
      console.error('Erro ao carregar logs:', err);
      setError(err.response?.data?.message || 'Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  };

  const carregarStats = async () => {
    try {
      const response = await api.get('/auditlogs/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handleLimparFiltros = () => {
    setFiltros({
      usuarioId: '',
      acao: '',
      entidade: '',
      dataInicio: '',
      dataFim: ''
    });
    setPage(0);
    setTimeout(() => carregarLogs(), 100);
  };

  const getAcaoColor = (acao: string) => {
    switch (acao) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'error';
      case 'LOGIN':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getAcaoLabel = (acao: string) => {
    const labels: Record<string, string> = {
      CREATE: 'Criar',
      UPDATE: 'Atualizar',
      DELETE: 'Excluir',
      LOGIN: 'Login',
      LOGOUT: 'Logout'
    };
    return labels[acao] || acao;
  };

  const handleOpenDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setOpenDetails(true);
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mt={4}>
        <Typography variant="h4" fontWeight="bold">
          <History sx={{ mr: 1, verticalAlign: 'middle' }} />
          Logs de Auditoria
        </Typography>
      </Box>

      {/* Cards de Estatísticas */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="textSecondary">Total de Logs</Typography>
                    <Typography variant="h4" fontWeight="bold">{stats.totalLogs}</Typography>
                  </Box>
                  <History sx={{ fontSize: 40, color: '#1976d2' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="textSecondary">Logs Hoje</Typography>
                    <Typography variant="h4" fontWeight="bold">{stats.logsHoje}</Typography>
                  </Box>
                  <BuildIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="textSecondary">Último Login</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {stats.ultimoLogin?.usuario || 'N/A'}
                    </Typography>
                    {stats.ultimoLogin && (
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(stats.ultimoLogin.dataHora), 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    )}
                  </Box>
                  <Person sx={{ fontSize: 40, color: '#ff9800' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={filtrosAbertos ? 2 : 0}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList />
            <Typography variant="h6">Filtros</Typography>
          </Box>
          <Button size="small" onClick={() => setFiltrosAbertos(!filtrosAbertos)}>
            {filtrosAbertos ? 'Ocultar' : 'Expandir'}
          </Button>
        </Box>
        
        {filtrosAbertos && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ação</InputLabel>
                  <Select
                    value={filtros.acao}
                    label="Ação"
                    onChange={(e) => setFiltros({ ...filtros, acao: e.target.value })}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="CREATE">Criar</MenuItem>
                    <MenuItem value="UPDATE">Atualizar</MenuItem>
                    <MenuItem value="DELETE">Excluir</MenuItem>
                    <MenuItem value="LOGIN">Login</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Entidade</InputLabel>
                  <Select
                    value={filtros.entidade}
                    label="Entidade"
                    onChange={(e) => setFiltros({ ...filtros, entidade: e.target.value })}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="Usuario">Usuário</MenuItem>
                    <MenuItem value="Veiculo">Veículo</MenuItem>
                    <MenuItem value="Checklist">Checklist</MenuItem>
                    <MenuItem value="Manutencao">Manutenção</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Data Início"
                  type="date"
                  size="small"
                  fullWidth
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Data Fim"
                  type="date"
                  size="small"
                  fullWidth
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Box display="flex" gap={2} mt={2}>
              <Button variant="outlined" onClick={handleLimparFiltros}>
                Limpar Filtros
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress />
        </Box>
      )}

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data/Hora</TableCell>
              <TableCell>Usuário</TableCell>
              <TableCell>Ação</TableCell>
              <TableCell>Entidade</TableCell>
              <TableCell>IP</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell>
                  {format(new Date(log.dataHora), 'dd/MM/yyyy HH:mm:ss')}
                </TableCell>
                <TableCell>{log.usuarioNome}</TableCell>
                <TableCell>
                  <Chip
                    label={getAcaoLabel(log.acao)}
                    color={getAcaoColor(log.acao) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.entidade}</TableCell>
                <TableCell>{log.ipAddress || '-'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver Detalhes">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDetails(log)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Nenhum log encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      {/* Dialog de Detalhes */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Usuário:</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedLog.usuarioNome}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Data/Hora:</Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedLog.dataHora), 'dd/MM/yyyy HH:mm:ss')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Ação:</Typography>
                  <Chip label={getAcaoLabel(selectedLog.acao)} color={getAcaoColor(selectedLog.acao) as any} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Entidade:</Typography>
                  <Typography variant="body1">{selectedLog.entidade}</Typography>
                </Grid>
                {selectedLog.entidadeId && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">ID da Entidade:</Typography>
                    <Typography variant="body1" fontFamily="monospace">{selectedLog.entidadeId}</Typography>
                  </Grid>
                )}
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">IP:</Typography>
                  <Typography variant="body1">{selectedLog.ipAddress || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">User Agent:</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    {selectedLog.userAgent || '-'}
                  </Typography>
                </Grid>
                {selectedLog.valoresAntigos && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Valores Antigos:</Typography>
                    <Paper sx={{ p: 1, mt: 1, backgroundColor: '#f5f5f5' }}>
                      <Typography variant="body2" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedLog.valoresAntigos}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {selectedLog.valoresNovos && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Valores Novos:</Typography>
                    <Paper sx={{ p: 1, mt: 1, backgroundColor: '#f5f5f5' }}>
                      <Typography variant="body2" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedLog.valoresNovos}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default AuditLogs;

