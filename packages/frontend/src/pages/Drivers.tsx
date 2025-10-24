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
import { getUsuarios, register, updateUsuario, deleteUsuario } from '../services/api';
import { useAuth } from '../components/AuthContext';

// Tipos e interfaces para TypeScript
interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

type UsuarioFormData = {
  nome: string;
  email: string;
  papel: string;
  ativo: boolean;
  cpf?: string;
  telefone?: string;
};
type UsuarioErrors = Partial<Record<keyof UsuarioFormData, string>>;

function GerenciamentoUsuarios() {
  const navigate = useNavigate();
  const { userRole, user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<UsuarioFormData>({
    nome: '',
    email: '',
    papel: 'Condutor',
    ativo: true,
  });
  const [errors, setErrors] = useState<UsuarioErrors>({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Carregar usuários da API
  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsuarios(); // Carregar todos os usuários
      setUsuarios(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  // Validação dinâmica dos campos obrigatórios
  useEffect(() => {
    const newErrors: UsuarioErrors = {};
    if (!formData.nome) newErrors.nome = 'Nome obrigatório';
    if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) newErrors.email = 'E-mail inválido';
    if (!formData.papel) newErrors.papel = 'Perfil obrigatório';
    setErrors(newErrors);
  }, [formData]);

  const handleOpenDialog = (usuario: Usuario | null = null) => {
    // Validação: Gestores não podem editar usuários Admin
    if (userRole === 'gestor' && usuario && usuario.papel === 'Administrador') {
      setSnackbarMessage('Gestores não podem editar usuários Administradores');
      setSnackbarType('error');
      setOpenSnackbar(true);
      return;
    }

    // Validação: Gestores não podem editar outros gestores
    if (userRole === 'gestor' && usuario && usuario.papel === 'Gestor') {
      setSnackbarMessage('Gestores não podem editar outros gestores');
      setSnackbarType('error');
      setOpenSnackbar(true);
      return;
    }

    // Validação: Administradores não podem editar a si mesmos
    if (user?.id === usuario?.id) {
      setSnackbarMessage('Administradores não podem editar a si mesmos');
      setSnackbarType('error');
      setOpenSnackbar(true);
      return;
    }

    setEditingUsuario(usuario);
    setFormData(
      usuario
        ? { 
            nome: usuario.nome, 
            email: usuario.email, 
            papel: usuario.papel, 
            ativo: usuario.ativo 
          }
        : { nome: '', email: '', papel: 'Condutor', ativo: true }
    );
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUsuario(null);
    setError(null); // Limpar erro ao fechar dialog
  };

  const validateForm = () => {
    return Object.keys(errors).length === 0;
  };

  const handleSaveUsuario = async () => {
    if (!validateForm()) return;

    // Validação: Gestores não podem criar/editar usuários Admin
    if (userRole === 'gestor' && formData.papel === 'Administrador') {
      setError('Gestores não podem criar ou editar usuários Administradores');
      return;
    }

    // Validação: Gestores não podem criar novos gestores
    if (userRole === 'gestor' && !editingUsuario && formData.papel === 'Gestor') {
      setError('Gestores não podem criar novos gestores');
      return;
    }

    // Validação: Gestores não podem alterar usuários Admin existentes
    if (userRole === 'gestor' && editingUsuario && editingUsuario.papel === 'Administrador') {
      setError('Gestores não podem editar usuários Administradores');
      return;
    }

    // Validação: Gestores não podem editar outros gestores
    if (userRole === 'gestor' && editingUsuario && editingUsuario.papel === 'Gestor') {
      setError('Gestores não podem editar outros gestores');
      return;
    }

    // Validação: Administradores não podem editar a si mesmos
    if (user?.id === editingUsuario?.id) {
      setError('Administradores não podem editar a si mesmos');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (editingUsuario) {
        await updateUsuario(editingUsuario.id, formData);
        setSnackbarMessage('Usuário atualizado com sucesso!');
      } else {
        // Para criar um novo usuário, precisamos mapear corretamente os dados
        const userData = {
          email: formData.email,
          password: '123456', // Senha padrão - em produção, isso deveria ser definido pelo usuário
          nome: formData.nome,
          papel: formData.papel, // Backend vai mapear a string para o enum
          cpf: formData.cpf,
          telefone: formData.telefone,
        };
        await register(userData);
        setSnackbarMessage('Usuário criado com sucesso!');
      }
      
      setSnackbarType('success');
      setOpenSnackbar(true);
      await carregarUsuarios();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar usuário');
      setSnackbarMessage('Erro ao salvar usuário');
      setSnackbarType('error');
      setOpenSnackbar(true);
      console.error('Erro ao salvar usuário:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsuario = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteUsuario(id);
      setSnackbarMessage('Usuário removido com sucesso!');
      setSnackbarType('success');
      setOpenSnackbar(true);
      await carregarUsuarios();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao remover usuário');
      setSnackbarMessage('Erro ao remover usuário');
      setSnackbarType('error');
      setOpenSnackbar(true);
      console.error('Erro ao remover usuário:', err);
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

  const filteredUsuarios = usuarios.filter(u => {
    const query = normalize(searchQuery);
    return (
      normalize(u.nome).includes(query) ||
      (u.email && normalize(u.email).includes(query)) ||
      normalize(u.papel).includes(query)
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
            {filteredUsuarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((usuario, idx) => (
              <TableRow key={usuario.id}>
                <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                <TableCell>{usuario.nome}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{usuario.papel}</TableCell>
                <TableCell>
                  <Chip
                    label={usuario.ativo ? 'Ativo' : 'Inativo'}
                    color={usuario.ativo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={
                    userRole === 'gestor' && usuario.papel === 'Administrador' ? 'Gestores não podem editar Administradores' :
                    userRole === 'gestor' && usuario.papel === 'Gestor' ? 'Gestores não podem editar outros gestores' :
                    user?.id === usuario.id ? 'Administradores não podem editar a si mesmos' :
                    'Editar'
                  }>
                    <span>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(usuario)}
                        disabled={userRole === 'gestor' && (usuario.papel === 'Administrador' || usuario.papel === 'Gestor') || user?.id === usuario.id}
                      >
                        <Edit />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={
                    userRole !== 'admin' ? 'Apenas Administradores podem excluir usuários' :
                    user?.id === usuario.id ? 'Administradores não podem excluir a si mesmos' :
                    'Excluir'
                  }>
                    <span>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteUsuario(usuario.id)}
                        disabled={userRole !== 'admin' || user?.id === usuario.id}
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
        count={filteredUsuarios.length}
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
        <DialogTitle>{editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              label="Nome completo *"
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
              error={!!errors.nome}
              helperText={errors.nome}
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
                value={formData.papel}
                label="Perfil *"
                onChange={e => setFormData({ ...formData, papel: e.target.value })}
                error={!!errors.papel}
              >
                <MenuItem value="Condutor">Condutor</MenuItem>
                <MenuItem value="Gestor" disabled={userRole !== 'admin'}>Gestor de Frota</MenuItem>
                <MenuItem value="Administrador" disabled={userRole !== 'admin'}>
                  Administrador
                </MenuItem>
              </Select>
            </FormControl>
            {editingUsuario && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
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
          <Button onClick={handleSaveUsuario} color="primary" variant="contained" disabled={!formData.nome || !formData.email || !formData.papel || Object.keys(errors).length > 0 || loading}>
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

export default GerenciamentoUsuarios;
