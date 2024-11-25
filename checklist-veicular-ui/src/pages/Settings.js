import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([
    { id: 1, name: 'Admin 1', email: 'admin1@example.com', role: 'Super Admin' },
    { id: 2, name: 'Admin 2', email: 'admin2@example.com', role: 'Editor' },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const roles = ['Super Admin', 'Editor', 'Viewer']; // Defina os papéis disponíveis

  const handleOpenDialog = (admin = null) => {
    setEditingAdmin(admin);
    setFormData(admin || { name: '', email: '', role: '' });
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAdmin(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'O nome é obrigatório.';
    if (!formData.email) newErrors.email = 'O e-mail é obrigatório.';
    if (!formData.role) newErrors.role = 'O papel é obrigatório.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAdmin = () => {
    if (!validateForm()) return;

    if (editingAdmin) {
      setAdmins((prev) =>
        prev.map((admin) => (admin.id === editingAdmin.id ? { ...formData, id: admin.id } : admin))
      );
      setSnackbarMessage('Administrador atualizado com sucesso!');
    } else {
      setAdmins((prev) => [...prev, { ...formData, id: prev.length + 1 }]);
      setSnackbarMessage('Administrador adicionado com sucesso!');
    }
    setSnackbarOpen(true);
    handleCloseDialog();
  };

  const handleDeleteAdmin = (id) => {
    setAdmins((prev) => prev.filter((admin) => admin.id !== id));
    setSnackbarMessage('Administrador removido com sucesso!');
    setSnackbarOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Barra Superior */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Configuração de Administradores
          </Typography>
          <Tooltip title="Voltar para Home">
            <IconButton color="inherit" onClick={() => navigate('/')}>
              <HomeIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Título */}
      <Box sx={{ mt: 4 }}>
        {/* Botão de Adicionar */}
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Adicionar Administrador
          </Button>
        </Box>

        {/* Tabela de Administradores */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Papel</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.role}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenDialog(admin)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDeleteAdmin(admin.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Dialog de Adicionar/Editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingAdmin ? 'Editar Administrador' : 'Adicionar Administrador'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            margin="normal"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="E-mail"
            fullWidth
            margin="normal"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <FormControl fullWidth margin="normal" error={!!errors.role}>
            <InputLabel id="role-label">Papel</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
            {errors.role && (
              <Typography variant="body2" color="error">
                {errors.role}
              </Typography>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSaveAdmin} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}

export default Settings;
