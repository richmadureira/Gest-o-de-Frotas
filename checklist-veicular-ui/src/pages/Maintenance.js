import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Snackbar,
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
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

function Maintenance() {
  const navigate = useNavigate();
  const [maintenanceRequests, setMaintenanceRequests] = useState([
    {
      id: 1,
      vehicle: 'ABC-1234',
      description: 'Troca de óleo',
      status: 'Pendente',
    },
    {
      id: 2,
      vehicle: 'DEF-5678',
      description: 'Substituição dos pneus',
      status: 'Concluído',
    },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ vehicle: '', description: '', status: 'Pendente' });
  const [editingRequest, setEditingRequest] = useState(null);
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const statuses = ['Pendente', 'Em andamento', 'Concluído']; // Status possíveis

  const handleOpenDialog = (request = null) => {
    setEditingRequest(request);
    setFormData(request || { vehicle: '', description: '', status: 'Pendente' });
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRequest(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vehicle) newErrors.vehicle = 'O veículo é obrigatório.';
    if (!formData.description) newErrors.description = 'A descrição é obrigatória.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveRequest = () => {
    if (!validateForm()) return;

    if (editingRequest) {
      setMaintenanceRequests((prev) =>
        prev.map((request) =>
          request.id === editingRequest.id ? { ...formData, id: request.id } : request
        )
      );
      setSnackbarMessage('Solicitação de manutenção atualizada com sucesso!');
    } else {
      setMaintenanceRequests((prev) => [
        ...prev,
        { ...formData, id: prev.length + 1 },
      ]);
      setSnackbarMessage('Solicitação de manutenção adicionada com sucesso!');
    }
    setSnackbarOpen(true);
    handleCloseDialog();
  };

  const handleDeleteRequest = (id) => {
    setMaintenanceRequests((prev) => prev.filter((request) => request.id !== id));
    setSnackbarMessage('Solicitação de manutenção removida com sucesso!');
    setSnackbarOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Barra Superior */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Solicitações de Manutenção
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
            Nova Solicitação
          </Button>
        </Box>

        {/* Tabela de Solicitações de Manutenção */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Veículo</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maintenanceRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.vehicle}</TableCell>
                  <TableCell>{request.description}</TableCell>
                  <TableCell>{request.status}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(request)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDeleteRequest(request.id)}
                    >
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
          {editingRequest ? 'Editar Solicitação' : 'Nova Solicitação'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Veículo"
            fullWidth
            margin="normal"
            name="vehicle"
            value={formData.vehicle}
            onChange={handleInputChange}
            error={!!errors.vehicle}
            helperText={errors.vehicle}
          />
          <TextField
            label="Descrição"
            fullWidth
            margin="normal"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSaveRequest} color="primary">
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

export default Maintenance;
