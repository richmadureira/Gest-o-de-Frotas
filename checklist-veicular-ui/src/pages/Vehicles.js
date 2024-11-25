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

function VehicleManagement() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    year: '',
    status: true,
  });
  const [errors, setErrors] = useState({});
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

  const handleOpenDialog = (vehicle = null) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle || { plate: '', model: '', year: '', status: true });
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVehicle(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.plate) {
      newErrors.plate = 'A placa é obrigatória.';
    } else if (
      vehicles.some(
        (vehicle) =>
          vehicle.plate === formData.plate && (!editingVehicle || vehicle.id !== editingVehicle.id)
      )
    ) {
      newErrors.plate = 'A placa já existe.';
    }
    if (!formData.model) newErrors.model = 'O modelo é obrigatório.';
    if (!formData.year) newErrors.year = 'O ano é obrigatório.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleDeactivateVehicle = (id) => {
    setVehicles(vehicles.map((v) => (v.id === id ? { ...v, status: false } : v)));
    setSnackbarMessage('Veículo desativado com sucesso!');
    setOpenSnackbar(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.year.includes(searchQuery)
  );

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setVehicles((prev) => [...prev, ...results.data]);
        setSnackbarMessage('Dados importados com sucesso!');
        setOpenSnackbar(true);
      },
    });
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      {/* Barra Superior */}
      <Box>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Gestão de Veiculos
            </Typography>
            <Tooltip title="Voltar">
              <IconButton
                edge="end"
                color="inherit"
                onClick={() => navigate('/')}
                aria-label="voltar"
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      </Box>

     {/* Barra de Ações */}
<Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={3} marginTop={4}>
  <Box display="flex" alignItems="center" gap={2}>
    <TextField
      variant="outlined"
      size="small"
      placeholder="Pesquisar veículos..."
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
      Adicionar Veículo
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
              <TableCell>Placa</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Ano</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>{vehicle.plate}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>
                  <Switch
                    checked={vehicle.status}
                    onChange={() => setVehicles(vehicles.map((v) => (v.id === vehicle.id ? { ...v, status: !v.status } : v)))}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton color="primary" onClick={() => handleOpenDialog(vehicle)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Desativar">
                    <IconButton color="secondary" onClick={() => handleDeactivateVehicle(vehicle.id)}>
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
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={filteredVehicles.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
      />

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingVehicle ? 'Editar Veículo' : 'Adicionar Veículo'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Placa"
            fullWidth
            margin="normal"
            value={formData.plate}
            onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
            error={!!errors.plate}
            helperText={errors.plate}
          />
          <TextField
            label="Modelo"
            fullWidth
            margin="normal"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            error={!!errors.model}
            helperText={errors.model}
          />
          <TextField
            label="Ano"
            fullWidth
            margin="normal"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            error={!!errors.year}
            helperText={errors.year}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSaveVehicle} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}

export default VehicleManagement;
