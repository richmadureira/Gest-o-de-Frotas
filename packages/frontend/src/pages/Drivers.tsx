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
  Chip,
  CircularProgress,
  Switch,
  FormControlLabel,
  AppBar,
  Toolbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

import { Add, Edit, Delete, Upload, Download } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { CSVLink } from 'react-csv';
import Papa from 'papaparse'; // Biblioteca para processar CSV
import { Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InputMask from 'react-input-mask';
import { getUsers, register, updateUser, deleteUser } from '../services/api';

// Tipos e interfaces para TypeScript
interface Driver {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type DriverFormData = {
  name: string;
  email: string;
  role: string;
  active: boolean;
  cpf?: string;
  phone?: string;
};
type DriverErrors = Partial<Record<keyof DriverFormData, string>>;

function DriverManagement() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    email: '',
    role: 'Condutor',
    active: true,
  });
  const [errors, setErrors] = useState<DriverErrors>({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Carregar motoristas da API
  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers({ role: 'Condutor' });
      setDrivers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar motoristas');
      console.error('Erro ao carregar motoristas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Validação dinâmica dos campos obrigatórios
  useEffect(() => {
    const newErrors: DriverErrors = {};
    if (!formData.name) newErrors.name = 'Nome obrigatório';
    if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) newErrors.email = 'E-mail inválido';
    if (!formData.role) newErrors.role = 'Função obrigatória';
    setErrors(newErrors);
  }, [formData]);

  const handleOpenDialog = (driver: Driver | null = null) => {
    setEditingDriver(driver);
    setFormData(
      driver
        ? { 
            name: driver.name, 
            email: driver.email, 
            role: driver.role, 
            active: driver.isActive 
          }
        : { name: '', email: '', role: 'Condutor', active: true }
    );
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDriver(null);
  };

  const validateForm = () => {
    return Object.keys(errors).length === 0;
  };

  const handleSaveDriver = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      
      if (editingDriver) {
        await updateUser(editingDriver.id, formData);
        setSnackbarMessage('Motorista atualizado com sucesso!');
      } else {
        // Para criar um novo usuário, precisamos de uma senha
        const userData = {
          ...formData,
          password: '123456', // Senha padrão - em produção, isso deveria ser definido pelo usuário
        };
        await register(userData);
        setSnackbarMessage('Motorista criado com sucesso!');
      }
      
      setSnackbarType('success');
      setOpenSnackbar(true);
      await loadDrivers();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar motorista');
      setSnackbarMessage('Erro ao salvar motorista');
      setSnackbarType('error');
      setOpenSnackbar(true);
      console.error('Erro ao salvar motorista:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteUser(id);
      setSnackbarMessage('Motorista removido com sucesso!');
      setSnackbarType('success');
      setOpenSnackbar(true);
      await loadDrivers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao remover motorista');
      setSnackbarMessage('Erro ao remover motorista');
      setSnackbarType('error');
      setOpenSnackbar(true);
      console.error('Erro ao remover motorista:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Função de importação CSV desabilitada temporariamente
    setSnackbarMessage('Funcionalidade de importação CSV em desenvolvimento.');
    setSnackbarType('error');
    setOpenSnackbar(true);
  };

  // Função para normalizar strings (remover acentos e deixar minúsculo)
  function normalize(str: string) {
    return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
  }

  const filteredDrivers = drivers.filter(d => {
    const query = normalize(searchQuery);
    return (
      normalize(d.name).includes(query) ||
      (d.email && normalize(d.email).includes(query)) ||
      normalize(d.role).includes(query)
    );
  });

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      {/* Indicador de Erro */}
      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Barra de Ações */}
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={3} marginTop={4}>
        <Box display="flex" alignItems={'center'} gap={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Pesquisar condutores..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ width: '300px' }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Novo Condutor
          </Button>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<Upload />}
          >
            Importar CSV
            <input type="file" hidden onChange={handleImportCSV} />
          </Button>
          <CSVLink data={drivers} filename="drivers.csv">
            <Button variant="outlined" color="secondary" startIcon={<Download />}>
              Exportar Dados
            </Button>
          </CSVLink>
        </Box>
      </Box>

      {/* Tabela de Condutores */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome completo</TableCell>
              <TableCell>E-mail</TableCell>
              <TableCell>Função</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDrivers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((driver, idx) => (
              <TableRow key={driver.id}>
                <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                <TableCell>{driver.name}</TableCell>
                <TableCell>{driver.email}</TableCell>
                <TableCell>{driver.role}</TableCell>
                <TableCell>
                  <Chip
                    label={driver.isActive ? 'Ativo' : 'Inativo'}
                    color={driver.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton color="primary" onClick={() => handleOpenDialog(driver)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton color="error" onClick={() => handleDeleteDriver(driver.id)}>
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
        count={filteredDrivers.length}
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
        <DialogTitle>{editingDriver ? 'Editar Motorista' : 'Novo Motorista'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              label="Nome completo *"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="E-mail *"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="role-label">Função *</InputLabel>
              <Select
                labelId="role-label"
                value={formData.role}
                label="Função *"
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                error={!!errors.role}
              >
                <MenuItem value="Condutor">Condutor</MenuItem>
                <MenuItem value="Gestor">Gestor de Frota</MenuItem>
                <MenuItem value="Admin">Administrador</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  color="primary"
                />
              }
              label="Usuário ativo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancelar</Button>
          <Button onClick={handleSaveDriver} color="primary" variant="contained" disabled={!formData.name || !formData.email || !formData.role || Object.keys(errors).length > 0 || loading}>
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
          <Alert severity={snackbarType} onClose={() => setOpenSnackbar(false)}>
            {snackbarMessage}
          </Alert>
        </Box>
      </Snackbar>
    </Container>
  );
}

export default DriverManagement;
