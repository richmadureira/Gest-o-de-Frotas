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

import { Add, Edit, Delete, Person, CheckCircle, Warning, GroupAdd, FilterList } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { Autocomplete, Grid, Card, CardContent } from '@mui/material';
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
  cpf?: string;
  telefone?: string;
  cnhNumero?: string;
  cnhCategoria?: string;
  cnhValidade?: string;
  cnhVencida?: boolean;
  matricula?: string;
  turnoTrabalho?: string;
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
  cnhNumero?: string;
  cnhCategoria?: string;
  cnhValidade?: string;
  matricula?: string;
  turnoTrabalho?: string;
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
  const [filtroPapel, setFiltroPapel] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCNHVencida, setFiltroCNHVencida] = useState('');
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  
  // Métricas
  const [metricas, setMetricas] = useState({
    total: 0,
    condutoresAtivos: 0,
    cnhVencidas: 0,
    novosUltimoMes: 0
  });

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
      
      // Calcular métricas
      const total = data.length;
      const condutoresAtivos = data.filter((u: Usuario) => u.papel === 'Condutor' && u.ativo).length;
      const cnhVencidas = data.filter((u: Usuario) => u.cnhVencida).length;
      
      // Novos no último mês
      const umMesAtras = new Date();
      umMesAtras.setMonth(umMesAtras.getMonth() - 1);
      const novosUltimoMes = data.filter((u: Usuario) => 
        new Date(u.criadoEm) >= umMesAtras
      ).length;
      
      setMetricas({ total, condutoresAtivos, cnhVencidas, novosUltimoMes });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLimparFiltros = () => {
    setSearchQuery('');
    setFiltroPapel('');
    setFiltroStatus('');
    setFiltroCNHVencida('');
    setPage(0);
  };

  // Validação dinâmica dos campos obrigatórios
  useEffect(() => {
    const newErrors: UsuarioErrors = {};
    if (!formData.nome) newErrors.nome = 'Nome obrigatório';
    if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) 
      newErrors.email = 'E-mail inválido';
    if (!formData.papel) newErrors.papel = 'Perfil obrigatório';
    
    // Validações específicas para Condutor
    if (formData.papel === 'Condutor') {
      if (!formData.cnhNumero) newErrors.cnhNumero = 'CNH obrigatória para condutores';
      if (!formData.cnhCategoria) newErrors.cnhCategoria = 'Categoria obrigatória';
      if (!formData.cnhValidade) newErrors.cnhValidade = 'Validade obrigatória';
    }
    
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
            ativo: usuario.ativo,
            cpf: usuario.cpf,
            telefone: usuario.telefone,
            cnhNumero: usuario.cnhNumero,
            cnhCategoria: usuario.cnhCategoria,
            cnhValidade: usuario.cnhValidade ? usuario.cnhValidade.split('T')[0] : '',
            matricula: usuario.matricula,
            turnoTrabalho: usuario.turnoTrabalho
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
          cnhNumero: formData.cnhNumero,
          cnhCategoria: formData.cnhCategoria,
          cnhValidade: formData.cnhValidade ? new Date(formData.cnhValidade).toISOString() : null,
          matricula: formData.matricula,
          turnoTrabalho: formData.turnoTrabalho
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
    const matchesSearch = 
      normalize(u.nome).includes(query) ||
      (u.email && normalize(u.email).includes(query)) ||
      normalize(u.papel).includes(query);
    
    const matchesPapel = !filtroPapel || u.papel === filtroPapel;
    const matchesStatus = !filtroStatus || (filtroStatus === 'Ativo' ? u.ativo : !u.ativo);
    const matchesCNH = !filtroCNHVencida || 
      (filtroCNHVencida === 'Sim' ? u.cnhVencida === true : u.cnhVencida === false || u.cnhVencida === undefined);
    
    return matchesSearch && matchesPapel && matchesStatus && matchesCNH;
  });

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      {/* Título e Botão de Ação */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mt={4}>
        <Typography variant="h4" fontWeight="bold">
          <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestão de Usuários
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Novo Usuário
        </Button>
      </Box>

      {/* Cards de Métricas */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Total de Usuários</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.total}</Typography>
                </Box>
                <Person sx={{ fontSize: 40, color: '#1976d2' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Condutores Ativos</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.condutoresAtivos}</Typography>
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
                  <Typography variant="body2" color="textSecondary">CNH Vencidas</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.cnhVencidas}</Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e1f5fe', borderLeft: '4px solid #2196f3' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Novos (Último Mês)</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.novosUltimoMes}</Typography>
                </Box>
                <GroupAdd sx={{ fontSize: 40, color: '#2196f3' }} />
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
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Busca (nome/email)"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Papel</InputLabel>
                  <Select
                    value={filtroPapel}
                    label="Papel"
                    onChange={(e) => setFiltroPapel(e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Administrador">Administrador</MenuItem>
                    <MenuItem value="Gestor">Gestor</MenuItem>
                    <MenuItem value="Condutor">Condutor</MenuItem>
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
                    <MenuItem value="Ativo">Ativo</MenuItem>
                    <MenuItem value="Inativo">Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>CNH Vencida</InputLabel>
                  <Select
                    value={filtroCNHVencida}
                    label="CNH Vencida"
                    onChange={(e) => setFiltroCNHVencida(e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Sim">Sim</MenuItem>
                    <MenuItem value="Nao">Não</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box display="flex" gap={2} mt={2}>
              <Button variant="contained" color="primary" onClick={() => setPage(0)}>
                Filtrar
              </Button>
              <Button variant="outlined" onClick={handleLimparFiltros}>
                Limpar
              </Button>
            </Box>
          </>
        )}
      </Paper>

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
            {/* 1. PERFIL - Primeiro campo */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="role-label">Perfil *</InputLabel>
              <Select
                labelId="role-label"
                value={formData.papel}
                label="Perfil *"
                onChange={e => {
                  const novoPapel = e.target.value;
                  setFormData({ 
                    ...formData, 
                    papel: novoPapel,
                    // Limpar campos de condutor se não for condutor
                    ...(novoPapel !== 'Condutor' && {
                      cnhNumero: '',
                      cnhCategoria: '',
                      cnhValidade: '',
                      matricula: '',
                      turnoTrabalho: ''
                    })
                  });
                }}
                error={!!errors.papel}
              >
                <MenuItem value="Condutor">Condutor</MenuItem>
                <MenuItem value="Gestor" disabled={userRole !== 'admin'}>Gestor de Frota</MenuItem>
                <MenuItem value="Administrador" disabled={userRole !== 'admin'}>
                  Administrador
                </MenuItem>
              </Select>
            </FormControl>
            
            {/* 2. NOME */}
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
            
            {/* 3. E-MAIL */}
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
            
            {/* 4. CAMPOS ESPECÍFICOS PARA CONDUTOR */}
            {formData.papel === 'Condutor' && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
                  Informações do Condutor
                </Typography>
                
                <TextField
                  label="CPF"
                  fullWidth
                  margin="normal"
                  value={formData.cpf || ''}
                  onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                />
                
                <TextField
                  label="Telefone"
                  fullWidth
                  margin="normal"
                  value={formData.telefone || ''}
                  onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                />
                
                <TextField
                  label="Número da CNH *"
                  fullWidth
                  margin="normal"
                  value={formData.cnhNumero || ''}
                  onChange={e => setFormData({ ...formData, cnhNumero: e.target.value })}
                  error={!!errors.cnhNumero}
                  helperText={errors.cnhNumero}
                />
                
                <FormControl fullWidth margin="normal" error={!!errors.cnhCategoria}>
                  <InputLabel>Categoria CNH *</InputLabel>
                  <Select
                    value={formData.cnhCategoria || ''}
                    label="Categoria CNH *"
                    onChange={e => setFormData({ ...formData, cnhCategoria: e.target.value })}
                  >
                    <MenuItem value="A">A</MenuItem>
                    <MenuItem value="AB">AB</MenuItem>
                    <MenuItem value="B">B</MenuItem>
                    <MenuItem value="C">C</MenuItem>
                    <MenuItem value="D">D</MenuItem>
                    <MenuItem value="E">E</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  label="Validade da CNH *"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  value={formData.cnhValidade || ''}
                  onChange={e => setFormData({ ...formData, cnhValidade: e.target.value })}
                  error={!!errors.cnhValidade}
                  helperText={errors.cnhValidade}
                />
                
                <TextField
                  label="Matrícula Interna"
                  fullWidth
                  margin="normal"
                  value={formData.matricula || ''}
                  onChange={e => setFormData({ ...formData, matricula: e.target.value })}
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Turno de Trabalho</InputLabel>
                  <Select
                    value={formData.turnoTrabalho || ''}
                    label="Turno de Trabalho"
                    onChange={e => setFormData({ ...formData, turnoTrabalho: e.target.value })}
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    <MenuItem value="Manha">Manhã</MenuItem>
                    <MenuItem value="Tarde">Tarde</MenuItem>
                    <MenuItem value="Noite">Noite</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            
            {/* 5. CAMPOS PARA OUTROS PERFIS (OPCIONAL) */}
            {(formData.papel === 'Gestor' || formData.papel === 'Administrador') && (
              <>
                <TextField
                  label="CPF"
                  fullWidth
                  margin="normal"
                  value={formData.cpf || ''}
                  onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                />
                
                <TextField
                  label="Telefone"
                  fullWidth
                  margin="normal"
                  value={formData.telefone || ''}
                  onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                />
              </>
            )}
            
            {/* 6. SWITCH ATIVO (apenas em edição) */}
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
                sx={{ mt: 2 }}
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
