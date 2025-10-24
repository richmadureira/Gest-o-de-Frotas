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
  Switch,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getVeiculos, createVeiculo, updateVeiculo, deleteVeiculo } from '../services/api';

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar veículos');
      console.error('Erro ao carregar veículos:', err);
    } finally {
      setLoading(false);
    }
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
      
      if (editingVeiculo) {
        await updateVeiculo(editingVeiculo.id, formData);
        setSnackbarMessage('Veículo atualizado com sucesso!');
      } else {
        await createVeiculo(formData);
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

  const handleDeactivateVeiculo = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteVeiculo(id);
      setSnackbarMessage('Veículo removido com sucesso!');
      setOpenSnackbar(true);
      await carregarVeiculos();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao remover veículo');
      console.error('Erro ao remover veículo:', err);
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

  const filteredVeiculos = veiculos.filter(
    (veiculo) =>
      normalize(veiculo.placa).includes(normalize(searchQuery)) ||
      normalize(veiculo.modelo).includes(normalize(searchQuery))
  );


  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      
      {/* Barra de Ações */}
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={3} marginTop={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Pesquisar por placa ou modelo..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ width: '300px' }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ alignSelf: 'flex-end' }}
          >
            Novo Veículo
          </Button>
        </Box>
      </Box>

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
                  <Tooltip title="Editar">
                    <IconButton color="primary" onClick={() => handleOpenDialog(veiculo)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton color="error" onClick={() => handleDeactivateVeiculo(veiculo.id)}>
                      <Delete />
                    </IconButton>
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
              helperText={errors.placa}
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
                <MenuItem value="Caminhao">Caminhão</MenuItem>
                <MenuItem value="Van">Van/Utilitário</MenuItem>
                <MenuItem value="Motocicleta">Motocicleta</MenuItem>
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

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box>
          <Typography>{snackbarMessage}</Typography>
        </Box>
      </Snackbar>
    </Container>
  );
}

export default GerenciamentoVeiculos;
