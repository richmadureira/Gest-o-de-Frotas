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

import { Add, Edit, Delete } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InputMask from 'react-input-mask';
import { getUsers, register, updateUser, deleteUser } from '../services/api';
import { useAuth } from '../components/AuthContext';

// Tipos e interfaces para TypeScript
interface Driver {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
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
  const { userRole, user } = useAuth();
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
      const data = await getUsers(); // Carregar todos os usuários
      setDrivers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  // Validação dinâmica dos campos obrigatórios
  useEffect(() => {
    const newErrors: DriverErrors = {};
    if (!formData.name) newErrors.name = 'Nome obrigatório';
    if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) newErrors.email = 'E-mail inválido';
    if (!formData.role) newErrors.role = 'Perfil obrigatório';
    setErrors(newErrors);
  }, [formData]);

  const handleOpenDialog = (driver: Driver | null = null) => {
    // Validação: Gestores não podem editar usuários Admin
    if (userRole === 'gestor' && driver && driver.role === 'Admin') {
      setSnackbarMessage('Gestores não podem editar usuários Administradores');
      setSnackbarType('error');
      setOpenSnackbar(true);
      return;
    }

    // Validação: Gestores não podem editar outros gestores
    if (userRole === 'gestor' && driver && driver.role === 'Gestor') {
      setSnackbarMessage('Gestores não podem editar outros gestores');
      setSnackbarType('error');
      setOpenSnackbar(true);
      return;
    }

    // Validação: Administradores não podem editar a si mesmos
    if (user?.id === driver?.id) {
      setSnackbarMessage('Administradores não podem editar a si mesmos');
      setSnackbarType('error');
      setOpenSnackbar(true);
      return;
    }

    setEditingDriver(driver);
    setFormData(
      driver
        ? { 
            name: driver.name, 
            email: driver.email, 
            role: driver.role, 
            active: driver.active 
          }
        : { name: '', email: '', role: 'Condutor', active: true }
    );
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDriver(null);
    setError(null); // Limpar erro ao fechar dialog
  };

  const validateForm = () => {
    return Object.keys(errors).length === 0;
  };

  const handleSaveDriver = async () => {
    if (!validateForm()) return;

    // Validação: Gestores não podem criar/editar usuários Admin
    if (userRole === 'gestor' && formData.role === 'Admin') {
      setError('Gestores não podem criar ou editar usuários Administradores');
      return;
    }

    // Validação: Gestores não podem criar novos gestores
    if (userRole === 'gestor' && !editingDriver && formData.role === 'Gestor') {
      setError('Gestores não podem criar novos gestores');
      return;
    }

    // Validação: Gestores não podem alterar usuários Admin existentes
    if (userRole === 'gestor' && editingDriver && editingDriver.role === 'Admin') {
      setError('Gestores não podem editar usuários Administradores');
      return;
    }

    // Validação: Gestores não podem editar outros gestores
    if (userRole === 'gestor' && editingDriver && editingDriver.role === 'Gestor') {
      setError('Gestores não podem editar outros gestores');
      return;
    }

    // Validação: Administradores não podem editar a si mesmos
    if (user?.id === editingDriver?.id) {
      setError('Administradores não podem editar a si mesmos');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (editingDriver) {
        await updateUser(editingDriver.id, formData);
        setSnackbarMessage('Usuário atualizado com sucesso!');
      } else {
        // Para criar um novo usuário, precisamos mapear corretamente os dados
        const userData = {
          email: formData.email,
          password: '123456', // Senha padrão - em produção, isso deveria ser definido pelo usuário
          name: formData.name,
          role: formData.role, // Backend vai mapear a string para o enum
          cpf: formData.cpf,
          phone: formData.phone,
        };
        await register(userData);
        setSnackbarMessage('Usuário criado com sucesso!');
      }
      
      setSnackbarType('success');
      setOpenSnackbar(true);
      await loadDrivers();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar usuário');
      setSnackbarMessage('Erro ao salvar usuário');
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
      setSnackbarMessage('Usuário removido com sucesso!');
      setSnackbarType('success');
      setOpenSnackbar(true);
      await loadDrivers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao remover usuário');
      setSnackbarMessage('Erro ao remover usuário');
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
      
      {/* Barra de Ações */}
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={3} marginTop={4}>
        <Box display="flex" alignItems={'center'} gap={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Pesquisar usuários..."
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
            Novo Usuário
          </Button>
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
              <TableCell>Perfil</TableCell>
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
                    label={driver.active ? 'Ativo' : 'Inativo'}
                    color={driver.active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={
                    userRole === 'gestor' && driver.role === 'Admin' ? 'Gestores não podem editar Administradores' :
                    userRole === 'gestor' && driver.role === 'Gestor' ? 'Gestores não podem editar outros gestores' :
                    user?.id === driver.id ? 'Administradores não podem editar a si mesmos' :
                    'Editar'
                  }>
                    <span>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(driver)}
                        disabled={userRole === 'gestor' && (driver.role === 'Admin' || driver.role === 'Gestor') || user?.id === driver.id}
                      >
                        <Edit />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={
                    userRole !== 'admin' ? 'Apenas Administradores podem excluir usuários' :
                    user?.id === driver.id ? 'Administradores não podem excluir a si mesmos' :
                    'Excluir'
                  }>
                    <span>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteDriver(driver.id)}
                        disabled={userRole !== 'admin' || user?.id === driver.id}
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
        <DialogTitle>{editingDriver ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
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
              <InputLabel id="role-label">Perfil *</InputLabel>
              <Select
                labelId="role-label"
                value={formData.role}
                label="Perfil *"
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                error={!!errors.role}
              >
                <MenuItem value="Condutor">Condutor</MenuItem>
                <MenuItem value="Gestor" disabled={userRole !== 'admin'}>Gestor de Frota</MenuItem>
                <MenuItem value="Admin" disabled={userRole !== 'admin'}>
                  Administrador
                </MenuItem>
              </Select>
            </FormControl>
            {editingDriver && (
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
            )}
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
