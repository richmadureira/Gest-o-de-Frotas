import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Box,
  Tooltip,
  TablePagination,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Add, Edit, Delete, DirectionsCar, Build, CheckCircle, Speed, FilterList, History } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getVeiculos, createVeiculo, updateVeiculo, deleteVeiculo } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../components/AuthContext';

// Tipos e interfaces para TypeScript
interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  ano: number;
  marca: string;
  tipo: string;
  status: string;
  nivelCombustivel: string;
  quilometragem: number;
  ultimaManutencao?: string;
  criadoEm: string;
  atualizadoEm: string;
}

type VeiculoFormData = Omit<Veiculo, 'id' | 'criadoEm' | 'atualizadoEm'>;
type VeiculoErrors = Partial<Record<keyof VeiculoFormData, string>>;

// Regex para placas brasileiras (antiga e Mercosul, com ou sem hífen)
const PLATE_REGEX = /^([A-Z]{3}-?\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/i;

function GerenciamentoVeiculos() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
  const [formData, setFormData] = useState<VeiculoFormData>({
    placa: '',
    modelo: '',
    ano: new Date().getFullYear(),
    marca: '',
    tipo: '',
    status: 'Disponivel',
    nivelCombustivel: 'Cheio',
    quilometragem: 0,
    ultimaManutencao: '',
  });
  const [errors, setErrors] = useState<VeiculoErrors>({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroAnoMin, setFiltroAnoMin] = useState('');
  const [filtroAnoMax, setFiltroAnoMax] = useState('');
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para confirmação de exclusão
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [veiculoToDelete, setVeiculoToDelete] = useState<Veiculo | null>(null);
  
  // Métricas
  const [metricas, setMetricas] = useState({
    total: 0,
    disponiveis: 0,
    emManutencao: 0,
    kmTotal: 0
  });

  // Carregar veículos da API
  useEffect(() => {
    carregarVeiculos();
  }, []);

  const carregarVeiculos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVeiculos();
      setVeiculos(data);
      
      // Calcular métricas
      const total = data.length;
      const disponiveis = data.filter((v: Veiculo) => v.status === 'Disponivel').length;
      const emManutencao = data.filter((v: Veiculo) => v.status === 'EmManutencao').length;
      const kmTotal = data.reduce((sum: number, v: Veiculo) => sum + (v.quilometragem || 0), 0);
      
      setMetricas({ total, disponiveis, emManutencao, kmTotal });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar veículos');
      console.error('Erro ao carregar veículos:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLimparFiltros = () => {
    setSearchQuery('');
    setFiltroTipo('');
    setFiltroStatus('');
    setFiltroAnoMin('');
    setFiltroAnoMax('');
    setPage(0);
  };

  const handleOpenDialog = (veiculo: Veiculo | null = null) => {
    setEditingVeiculo(veiculo);
    setFormData(veiculo || {
      placa: '',
      modelo: '',
      ano: new Date().getFullYear(),
      marca: '',
      tipo: '',
      status: 'Disponivel',
      nivelCombustivel: 'Cheio',
      quilometragem: 0,
      ultimaManutencao: '',
    });
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVeiculo(null);
    setError(null);
  };

  // Validação dinâmica dos campos obrigatórios e da placa
  useEffect(() => {
    const newErrors: VeiculoErrors = {};
    if (!formData.placa) {
      newErrors.placa = 'A placa é obrigatória.';
    } else if (!PLATE_REGEX.test(formData.placa.replace(/\s/g, '').toUpperCase())) {
      newErrors.placa = 'Placa inválida. Use o formato AAA-9999, AAA9999 ou AAA1A23.';
    } else if (
      veiculos.some(
        (veiculo) =>
          veiculo.placa.replace(/\s/g, '').toUpperCase() === formData.placa.replace(/\s/g, '').toUpperCase() &&
          (!editingVeiculo || veiculo.id !== editingVeiculo.id)
      )
    ) {
      newErrors.placa = 'A placa já existe.';
    }
    if (!formData.modelo) newErrors.modelo = 'O modelo é obrigatório.';
    if (!formData.marca) newErrors.marca = 'A marca é obrigatória.';
    if (!formData.tipo) newErrors.tipo = 'O tipo é obrigatório.';
    if (!formData.ano || formData.ano < 1900 || formData.ano > new Date().getFullYear() + 1) {
      newErrors.ano = 'O ano deve ser válido.';
    }
    setErrors(newErrors);
  }, [formData, veiculos, editingVeiculo]);

  const validateForm = () => {
    return Object.keys(errors).length === 0;
  };

  const handleSaveVeiculo = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      
      // Criar objeto com placa limpa (remover hífen se existir)
      const veiculoData = {
        ...formData,
        placa: formData.placa.replace(/-/g, '') // Remove hífen da placa
      };
      
      if (editingVeiculo) {
        await updateVeiculo(editingVeiculo.id, veiculoData);
        setSnackbarMessage('Veículo atualizado com sucesso!');
      } else {
        await createVeiculo(veiculoData);
        setSnackbarMessage('Veículo adicionado com sucesso!');
      }
      
      // Recarregar lista de veículos
      await carregarVeiculos();
      setOpenSnackbar(true);
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar veículo');
      console.error('Erro ao salvar veículo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (veiculo: Veiculo) => {
    setVeiculoToDelete(veiculo);
    setConfirmDialogOpen(true);
  };

  const handleDeactivateVeiculo = async () => {
    if (!veiculoToDelete) return;
    
    try {
      setLoading(true);
      setError(null);
      await deleteVeiculo(veiculoToDelete.id);
      setSnackbarMessage('Veículo removido com sucesso!');
      setOpenSnackbar(true);
      await carregarVeiculos();
      setConfirmDialogOpen(false);
      setVeiculoToDelete(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao remover veículo';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setOpenSnackbar(true);
      console.error('Erro ao remover veículo:', err);
      // Não fecha o dialog para que o usuário veja o erro
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Função para normalizar strings (remover acentos e deixar minúsculo)
  function normalize(str: string) {
    return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
  }

  const filteredVeiculos = veiculos.filter((veiculo) => {
    // Filtro de busca por texto
    const matchesSearch = 
      normalize(veiculo.placa).includes(normalize(searchQuery)) ||
      normalize(veiculo.modelo).includes(normalize(searchQuery)) ||
      normalize(veiculo.marca).includes(normalize(searchQuery));
    
    // Filtro de tipo
    const matchesTipo = !filtroTipo || veiculo.tipo === filtroTipo;
    
    // Filtro de status
    const matchesStatus = !filtroStatus || veiculo.status === filtroStatus;
    
    // Filtro de ano
    const matchesAnoMin = !filtroAnoMin || veiculo.ano >= parseInt(filtroAnoMin);
    const matchesAnoMax = !filtroAnoMax || veiculo.ano <= parseInt(filtroAnoMax);
    
    return matchesSearch && matchesTipo && matchesStatus && matchesAnoMin && matchesAnoMax;
  });


  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      {/* Título e Botão de Ação */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mt={4}>
        <Typography variant="h4" fontWeight="bold">
          <DirectionsCar sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestão de Veículos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Novo Veículo
        </Button>
      </Box>

      {/* Cards de Métricas */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Total de Veículos</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.total}</Typography>
                </Box>
                <DirectionsCar sx={{ fontSize: 40, color: '#1976d2' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Disponíveis</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.disponiveis}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Em Manutenção</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.emManutencao}</Typography>
                </Box>
                <Build sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e1f5fe', borderLeft: '4px solid #2196f3' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Km Total da Frota</Typography>
                  <Typography variant="h4" fontWeight="bold">{(metricas.kmTotal / 1000).toFixed(0)}k</Typography>
                </Box>
                <Speed sx={{ fontSize: 40, color: '#2196f3' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Paper de Filtros */}
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
                <TextField
                  label="Busca (placa/modelo/marca)"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filtroTipo}
                    label="Tipo"
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Carro">Carro</MenuItem>
                    <MenuItem value="Motocicleta">Motocicleta</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filtroStatus}
                    label="Status"
                    onChange={(e) => setFiltroStatus(e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Disponivel">Disponível</MenuItem>
                    <MenuItem value="EmManutencao">Em Manutenção</MenuItem>
                    <MenuItem value="Inativo">Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Ano Mín"
                  type="number"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={filtroAnoMin}
                  onChange={(e) => setFiltroAnoMin(e.target.value)}
                  inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Ano Máx"
                  type="number"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={filtroAnoMax}
                  onChange={(e) => setFiltroAnoMax(e.target.value)}
                  inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
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

      {/* Tabela de Veículos */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Ano</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Quilometragem</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVeiculos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((veiculo, idx) => (
              <TableRow key={veiculo.id}>
                <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                <TableCell>{veiculo.placa}</TableCell>
                <TableCell>{veiculo.marca}</TableCell>
                <TableCell>{veiculo.modelo}</TableCell>
                <TableCell>{veiculo.tipo}</TableCell>
                <TableCell>{veiculo.ano}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      backgroundColor: veiculo.status === 'Disponivel' ? '#e8f5e8' : '#ffe8e8',
                      color: veiculo.status === 'Disponivel' ? '#2e7d32' : '#d32f2f',
                    }}
                  >
                    {veiculo.status === 'Disponivel' ? 'Disponível' : 'Indisponível'}
                  </Box>
                </TableCell>
                <TableCell>{veiculo.quilometragem.toLocaleString()} km</TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver Histórico">
                    <IconButton color="info" onClick={() => navigate(`/vehicles/${veiculo.id}/historico`)}>
                      <History />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton color="primary" onClick={() => handleOpenDialog(veiculo)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={
                    userRole !== 'admin' ? 'Apenas Administradores podem excluir veículos' : 'Excluir'
                  }>
                    <span>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteClick(veiculo)}
                        disabled={userRole !== 'admin'}
                      >
                        <Delete />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <TablePagination
        rowsPerPageOptions={[10, 20]}
        component="div"
        count={filteredVeiculos.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={event => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              borderRadius: 0
            }}
          >
            {error}
          </Alert>
        )}
        <DialogTitle sx={{ mt: error ? 6 : 0 }}>{editingVeiculo ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              label="Placa *"
              value={formData.placa}
              onChange={e => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
              error={!!errors.placa}
              helperText={errors.placa || 'Formato: AAA-9999 ou AAA9A99'}
              fullWidth
              margin="normal"
              required
              inputProps={{ maxLength: 8, style: { textTransform: 'uppercase' } }}
            />
            <TextField
              label="Marca *"
              value={formData.marca}
              onChange={e => setFormData({ ...formData, marca: e.target.value })}
              error={!!errors.marca}
              helperText={errors.marca}
              fullWidth
              margin="normal"
              required
              inputProps={{ maxLength: 40 }}
            />
            <TextField
              label="Modelo *"
              value={formData.modelo}
              onChange={e => setFormData({ ...formData, modelo: e.target.value })}
              error={!!errors.modelo}
              helperText={errors.modelo}
              fullWidth
              margin="normal"
              required
              inputProps={{ maxLength: 40 }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="type-label">Tipo *</InputLabel>
              <Select
                labelId="type-label"
                value={formData.tipo}
                label="Tipo *"
                onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                error={!!errors.tipo}
              >
                <MenuItem value="Carro">Carro</MenuItem>
                <MenuItem value="Motocicleta">Motocicleta</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="status-label">Status *</InputLabel>
              <Select
                labelId="status-label"
                value={formData.status}
                label="Status *"
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="Disponivel">Disponível</MenuItem>
                <MenuItem value="EmManutencao">Em Manutenção</MenuItem>
                <MenuItem value="Inativo">Inativo</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Ano *"
              type="number"
              value={formData.ano}
              onChange={e => setFormData({ ...formData, ano: parseInt(e.target.value) || new Date().getFullYear() })}
              error={!!errors.ano}
              helperText={errors.ano}
              fullWidth
              margin="normal"
              required
              inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
            />
            <TextField
              label="Quilometragem"
              type="number"
              value={formData.quilometragem}
              onChange={e => setFormData({ ...formData, quilometragem: parseInt(e.target.value) || 0 })}
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Última manutenção"
              type="date"
              value={formData.ultimaManutencao || ''}
              onChange={e => setFormData({ ...formData, ultimaManutencao: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancelar</Button>
          <Button onClick={handleSaveVeiculo} color="primary" variant="contained" disabled={!formData.placa || !formData.marca || !formData.modelo || !formData.tipo || !formData.ano || Object.keys(errors).length > 0 || loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        open={confirmDialogOpen}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este veículo?"
        itemName={veiculoToDelete ? `${veiculoToDelete.placa} - ${veiculoToDelete.modelo}` : ''}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeactivateVeiculo}
        onCancel={() => {
          setConfirmDialogOpen(false);
          setVeiculoToDelete(null);
        }}
        severity="error"
      />

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={error ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default GerenciamentoVeiculos;
