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
} from '@mui/material';
import { Add, Edit, Delete, Upload, Download } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import Papa from 'papaparse';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/api';

// Tipos e interfaces para TypeScript
interface Vehicle {
  id: string;
  plate: string;
  model: string;
  year: number;
  brand: string;
  type: string;
  status: string;
  fuelLevel: string;
  mileage: number;
  lastMaintenance?: string;
  createdAt: string;
  updatedAt: string;
}

type VehicleFormData = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;
type VehicleErrors = Partial<Record<keyof VehicleFormData, string>>;

// Regex para placas brasileiras (antiga e Mercosul, com ou sem hífen)
const PLATE_REGEX = /^([A-Z]{3}-?\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/i;

function VehicleManagement() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>({
    plate: '',
    model: '',
    year: new Date().getFullYear(),
    brand: '',
    type: '',
    status: 'Available',
    fuelLevel: 'Full',
    mileage: 0,
    lastMaintenance: '',
  });
  const [errors, setErrors] = useState<VehicleErrors>({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar veículos da API
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVehicles();
      setVehicles(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar veículos');
      console.error('Erro ao carregar veículos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vehicle: Vehicle | null = null) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle || {
      plate: '',
      model: '',
      year: new Date().getFullYear(),
      brand: '',
      type: '',
      status: 'Available',
      fuelLevel: 'Full',
      mileage: 0,
      lastMaintenance: '',
    });
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVehicle(null);
  };

  // Validação dinâmica dos campos obrigatórios e da placa
  useEffect(() => {
    const newErrors: VehicleErrors = {};
    if (!formData.plate) {
      newErrors.plate = 'A placa é obrigatória.';
    } else if (!PLATE_REGEX.test(formData.plate.replace(/\s/g, '').toUpperCase())) {
      newErrors.plate = 'Placa inválida. Use o formato AAA-9999, AAA9999 ou AAA1A23.';
    } else if (
      vehicles.some(
        (vehicle) =>
          vehicle.plate.replace(/\s/g, '').toUpperCase() === formData.plate.replace(/\s/g, '').toUpperCase() &&
          (!editingVehicle || vehicle.id !== editingVehicle.id)
      )
    ) {
      newErrors.plate = 'A placa já existe.';
    }
    if (!formData.model) newErrors.model = 'O modelo é obrigatório.';
    if (!formData.brand) newErrors.brand = 'A marca é obrigatória.';
    if (!formData.type) newErrors.type = 'O tipo é obrigatório.';
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'O ano deve ser válido.';
    }
    setErrors(newErrors);
  }, [formData, vehicles, editingVehicle]);

  const validateForm = () => {
    return Object.keys(errors).length === 0;
  };

  const handleSaveVehicle = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, formData);
        setSnackbarMessage('Veículo atualizado com sucesso!');
      } else {
        await createVehicle(formData);
        setSnackbarMessage('Veículo adicionado com sucesso!');
      }
      
      // Recarregar lista de veículos
      await loadVehicles();
      setOpenSnackbar(true);
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar veículo');
      console.error('Erro ao salvar veículo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateVehicle = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteVehicle(id);
      setSnackbarMessage('Veículo removido com sucesso!');
      setOpenSnackbar(true);
      await loadVehicles();
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

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      normalize(vehicle.plate).includes(normalize(searchQuery)) ||
      normalize(vehicle.model).includes(normalize(searchQuery))
  );

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: (results: any) => {
        setVehicles((prev) => [...prev, ...results.data]);
        setSnackbarMessage('Dados importados com sucesso!');
        setOpenSnackbar(true);
      },
    });
  };

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
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<Upload />}
          >
            Importar CSV
            <input type="file" hidden onChange={handleImportCSV} />
          </Button>
          <CSVLink data={vehicles} filename="vehicles.csv">
            <Button variant="outlined" color="secondary" startIcon={<Download />}>
              Exportar Dados
            </Button>
          </CSVLink>
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
            {filteredVehicles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((vehicle, idx) => (
              <TableRow key={vehicle.id}>
                <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                <TableCell>{vehicle.plate}</TableCell>
                <TableCell>{vehicle.brand}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.type}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      backgroundColor: vehicle.status === 'Available' ? '#e8f5e8' : '#ffe8e8',
                      color: vehicle.status === 'Available' ? '#2e7d32' : '#d32f2f',
                    }}
                  >
                    {vehicle.status === 'Available' ? 'Disponível' : 'Indisponível'}
                  </Box>
                </TableCell>
                <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton color="primary" onClick={() => handleOpenDialog(vehicle)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton color="error" onClick={() => handleDeactivateVehicle(vehicle.id)}>
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
        count={filteredVehicles.length}
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
        <DialogTitle>{editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              label="Placa *"
              value={formData.plate}
              onChange={e => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
              error={!!errors.plate}
              helperText={errors.plate}
              fullWidth
              margin="normal"
              required
              inputProps={{ maxLength: 8, style: { textTransform: 'uppercase' } }}
            />
            <TextField
              label="Marca *"
              value={formData.brand}
              onChange={e => setFormData({ ...formData, brand: e.target.value })}
              error={!!errors.brand}
              helperText={errors.brand}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Modelo *"
              value={formData.model}
              onChange={e => setFormData({ ...formData, model: e.target.value })}
              error={!!errors.model}
              helperText={errors.model}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Tipo *"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              error={!!errors.type}
              helperText={errors.type}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Ano *"
              type="number"
              value={formData.year}
              onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
              error={!!errors.year}
              helperText={errors.year}
              fullWidth
              margin="normal"
              required
              inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
            />
            <TextField
              label="Quilometragem"
              type="number"
              value={formData.mileage}
              onChange={e => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Última manutenção"
              type="date"
              value={formData.lastMaintenance || ''}
              onChange={e => setFormData({ ...formData, lastMaintenance: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancelar</Button>
          <Button onClick={handleSaveVehicle} color="primary" variant="contained" disabled={!formData.plate || !formData.brand || !formData.model || !formData.type || !formData.year || Object.keys(errors).length > 0 || loading}>
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

export default VehicleManagement;
