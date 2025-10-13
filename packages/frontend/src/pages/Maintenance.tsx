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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { SelectChangeEvent } from '@mui/material';

// Tipos e interfaces para TypeScript
interface MaintenanceRequest {
  id: number;
  vehicle: string;
  description: string;
  status: string;
  date?: string;
  maintenanceType?: string;
  suggestedDate?: string;
}

type MaintenanceFormData = Omit<MaintenanceRequest, 'id'>;
type MaintenanceErrors = Partial<Record<keyof MaintenanceFormData, string>>;

function Maintenance() {
  const navigate = useNavigate();
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([
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
  const [formData, setFormData] = useState<MaintenanceFormData>({ vehicle: '', description: '', status: 'Pendente' });
  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null);
  const [errors, setErrors] = useState<MaintenanceErrors>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openDetails, setOpenDetails] = useState(false);

  const statuses = ['Pendente', 'Em andamento', 'Concluído']; // Status possíveis

  const handleOpenDialog = (request: MaintenanceRequest | null = null) => {
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
    const newErrors: MaintenanceErrors = {};
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

  const handleDeleteRequest = (id: number) => {
    setMaintenanceRequests((prev) => prev.filter((request) => request.id !== id));
    setSnackbarMessage('Solicitação de manutenção removida com sucesso!');
    setSnackbarOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof MaintenanceFormData]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof MaintenanceFormData]: value }));
  };

  const handleOpenDetails = (request: MaintenanceRequest) => {
    setEditingRequest(request);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setEditingRequest(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implemente o upload de arquivo
  };

  const handleCancelRequest = (id: number) => {
    // Implemente a lógica para cancelar uma solicitação
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Barra de Ações */}
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={3} marginTop={4}>
        <Typography variant="h5" fontWeight={700}>Solicitações de Manutenção</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ alignSelf: 'flex-end' }}
        >
          Nova Solicitação
        </Button>
      </Box>

      {/* Tabela de Solicitações de Manutenção */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Veículo</TableCell>
              <TableCell>Data da Solicitação</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {maintenanceRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.vehicle}</TableCell>
                <TableCell>{request.date || '-'}</TableCell>
                <TableCell>{request.maintenanceType || '-'}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Visualizar Detalhes">
                    <IconButton color="primary" onClick={() => handleOpenDetails(request)}>
                      <i className="fas fa-eye" />
                    </IconButton>
                  </Tooltip>
                  {request.status === 'Aguardando Aprovação' && (
                    <Tooltip title="Editar">
                      <IconButton color="primary" onClick={() => handleOpenDialog(request)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  )}
                  {request.status === 'Aguardando Aprovação' && (
                    <Tooltip title="Cancelar">
                      <IconButton color="error" onClick={() => handleCancelRequest(request.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Adicionar/Editar Solicitação */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRequest ? 'Editar Solicitação' : 'Nova Solicitação'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Veículo</InputLabel>
              <Select
                value={formData.vehicle}
                onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                label="Veículo"
              >
                {/* Exemplo de veículos, troque por sua lista real */}
                <MenuItem value="ABC-1234">ABC-1234</MenuItem>
                <MenuItem value="DEF-5678">DEF-5678</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Tipo de Manutenção</InputLabel>
              <Select
                value={formData.maintenanceType || ''}
                onChange={e => setFormData({ ...formData, maintenanceType: e.target.value })}
                label="Tipo de Manutenção"
              >
                <MenuItem value="Preventiva">Preventiva</MenuItem>
                <MenuItem value="Corretiva">Corretiva</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Descrição do problema *"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description}
              fullWidth
              margin="normal"
              required
              multiline
              minRows={3}
            />
            <TextField
              label="Data sugerida para manutenção"
              type="date"
              value={formData.suggestedDate || ''}
              onChange={e => setFormData({ ...formData, suggestedDate: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <Box mt={2} mb={1}>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                multiple
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancelar</Button>
          <Button onClick={handleSaveRequest} color="primary" variant="contained" disabled={!formData.vehicle || !formData.maintenanceType || !formData.description || Object.keys(errors).length > 0}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Detalhes da Solicitação */}
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>Detalhes da Solicitação</DialogTitle>
        <DialogContent>
          {/* Exibir todos os campos e anexos aqui */}
          {/* ... */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color="primary">Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={snackbarMessage}
      />
    </Container>
  );
}

export default Maintenance;
