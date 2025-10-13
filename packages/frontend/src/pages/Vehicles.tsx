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
} from '@mui/material';
import { Add, Edit, Delete, Upload, Download } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import Papa from 'papaparse';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Tipos e interfaces para TypeScript
interface Vehicle {
  id: number;
  plate: string;
  model: string;
  year: string;
  lastMaintenance?: string;
  status: boolean;
}

type VehicleFormData = Omit<Vehicle, 'id'>;
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
    year: '',
    lastMaintenance: '',
    status: true,
  });
  const [errors, setErrors] = useState<VehicleErrors>({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setVehicles([
      { id: 1, plate: 'ABC-1234', model: 'Fiat Uno', year: '2018', status: true },
      { id: 2, plate: 'DEF-5678', model: 'Toyota Corolla', year: '2020', status: false },
    ]);
  }, []);

  const handleOpenDialog = (vehicle: Vehicle | null = null) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle || { plate: '', model: '', year: '', lastMaintenance: '', status: true });
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
    if (!formData.year) newErrors.year = 'O ano é obrigatório.';
    setErrors(newErrors);
  }, [formData, vehicles, editingVehicle]);

  const validateForm = () => {
    return Object.keys(errors).length === 0;
  };

  const handleSaveVehicle = () => {
    if (!validateForm()) return;

    setLoading(true);
    setTimeout(() => {
      if (editingVehicle) {
        setVehicles(vehicles.map((v) => (v.id === editingVehicle.id ? { ...formData, id: editingVehicle.id } : v)));
        setSnackbarMessage('Veículo atualizado com sucesso!');
      } else {
        setVehicles([...vehicles, { ...formData, id: vehicles.length + 1 }]);
        setSnackbarMessage('Veículo adicionado com sucesso!');
      }
      setLoading(false);
      setOpenSnackbar(true);
      handleCloseDialog();
    }, 1000);
  };

  const handleDeactivateVehicle = (id: number) => {
    setVehicles(vehicles.map((v) => (v.id === id ? { ...v, status: false } : v)));
    setSnackbarMessage('Veículo desativado com sucesso!');
    setOpenSnackbar(true);
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
              <TableCell>Modelo</TableCell>
              <TableCell>Ano</TableCell>
              <TableCell>Última manutenção</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((vehicle, idx) => (
              <TableRow key={vehicle.id}>
                <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                <TableCell>{vehicle.plate}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>{vehicle.lastMaintenance ? vehicle.lastMaintenance : '-'}</TableCell>
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
              label="Ano *"
              type="number"
              value={formData.year}
              onChange={e => setFormData({ ...formData, year: e.target.value })}
              error={!!errors.year}
              helperText={errors.year}
              fullWidth
              margin="normal"
              required
              inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
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
          <Button onClick={handleSaveVehicle} color="primary" variant="contained" disabled={!formData.plate || !formData.model || !formData.year || Object.keys(errors).length > 0 || loading}>
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
