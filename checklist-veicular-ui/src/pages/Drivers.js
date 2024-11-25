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
  Toolbar
} from '@mui/material';

import { Add, Edit, Delete, Upload, Download } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { CSVLink } from 'react-csv';
import Papa from 'papaparse'; // Biblioteca para processar CSV
import { Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


function DriverManagement() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    matricula: '',
    name: '',
    cnh: '',
    assignedVehicle: '',
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
    setDrivers([
      { matricula: '001', name: 'João Silva', cnh: '1234567890', assignedVehicle: 'ABC-1234', status: true },
      { matricula: '002', name: 'Maria Oliveira', cnh: '0987654321', assignedVehicle: 'DEF-5678', status: false },
      { matricula: '003', name: 'Carlos Souza', cnh: '1122334455', assignedVehicle: 'GHI-9012', status: true },
      { matricula: '004', name: 'Ana Costa', cnh: '6677889900', assignedVehicle: 'JKL-3456', status: true },
      { matricula: '005', name: 'Fernando Lima', cnh: '9988776655', assignedVehicle: 'MNO-7890', status: false },
      { matricula: '006', name: 'Beatriz Rocha', cnh: '2233445566', assignedVehicle: 'PQR-4567', status: true },
      { matricula: '007', name: 'Rafael Alves', cnh: '4455667788', assignedVehicle: 'STU-8910', status: true },
      { matricula: '008', name: 'Patrícia Mendes', cnh: '6677881122', assignedVehicle: 'VWX-2345', status: true },
      { matricula: '009', name: 'Gustavo Nunes', cnh: '7788990011', assignedVehicle: 'YZA-6789', status: false },
      { matricula: '010', name: 'Renata Ribeiro', cnh: '5566778899', assignedVehicle: 'BCD-0123', status: true },
      { matricula: '011', name: 'Cláudio Ferreira', cnh: '3344556677', assignedVehicle: 'EFG-4567', status: true },
      { matricula: '012', name: 'Marta Souza', cnh: '9988112233', assignedVehicle: 'HIJ-8901', status: false },
    ]);
  
    setVehicles([
      { id: 1, plate: 'ABC-1234', model: 'Fiat Uno' },
      { id: 2, plate: 'DEF-5678', model: 'Toyota Corolla' },
      { id: 3, plate: 'GHI-9012', model: 'Honda Civic' },
      { id: 4, plate: 'JKL-3456', model: 'Volkswagen Gol' },
      { id: 5, plate: 'MNO-7890', model: 'Ford Ka' },
      { id: 6, plate: 'PQR-4567', model: 'Chevrolet Onix' },
      { id: 7, plate: 'STU-8910', model: 'Hyundai HB20' },
      { id: 8, plate: 'VWX-2345', model: 'Renault Kwid' },
      { id: 9, plate: 'YZA-6789', model: 'Jeep Compass' },
      { id: 10, plate: 'BCD-0123', model: 'Kia Sportage' },
      { id: 11, plate: 'EFG-4567', model: 'Peugeot 208' },
      { id: 12, plate: 'HIJ-8901', model: 'Nissan Versa' },
    ]);
  }, []);

  const handleOpenDialog = (driver = null) => {
    setEditingDriver(driver);
    setFormData(
      driver || {
        matricula: '',
        name: '',
        cnh: '',
        assignedVehicle: '',
        status: true,
      }
    );
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDriver(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.matricula) {
      newErrors.matricula = 'A matrícula é obrigatória.';
    } else if (
      drivers.some(
        (driver) =>
          driver.matricula === formData.matricula &&
          (!editingDriver || driver.matricula !== editingDriver.matricula)
      )
    ) {
      newErrors.matricula = 'A matrícula já existe.';
    }
    if (!formData.name) newErrors.name = 'O nome é obrigatório.';
    if (!formData.cnh) newErrors.cnh = 'A CNH é obrigatória.';
    if (!formData.assignedVehicle) newErrors.assignedVehicle = 'O veículo é obrigatório.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSaveDriver = () => {
    if (!validateForm()) return;

    setLoading(true);
    setTimeout(() => {
      if (editingDriver) {
        setDrivers(drivers.map(d => (d.matricula === editingDriver.matricula ? { ...formData } : d)));
        setSnackbarMessage('Condutor atualizado com sucesso!');
      } else {
        setDrivers([...drivers, formData]);
        setSnackbarMessage('Condutor adicionado com sucesso!');
      }
      setLoading(false);
      setOpenSnackbar(true);
      handleCloseDialog();
    }, 1000);
  };

  const handleDeactivateDriver = (matricula) => {
    setDrivers(drivers.map(driver => (driver.matricula === matricula ? { ...driver, status: false } : driver)));
    setSnackbarMessage('Condutor desativado com sucesso!');
    setOpenSnackbar(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedDrivers = results.data.map((row) => ({
          matricula: row.matricula,
          name: row.name,
          cnh: row.cnh,
          assignedVehicle: row.assignedVehicle,
          status: row.status === 'true',
        }));

        const duplicates = importedDrivers.filter((imported) =>
          drivers.some((existing) => existing.matricula === imported.matricula)
        );

        if (duplicates.length > 0) {
          setSnackbarMessage('Erro: Matrículas duplicadas no arquivo importado.');
          setOpenSnackbar(true);
          return;
        }

        setDrivers([...drivers, ...importedDrivers]);
        setSnackbarMessage('Dados importados com sucesso!');
        setOpenSnackbar(true);
      },
    });
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.cnh.includes(searchQuery) ||
    driver.assignedVehicle.toLowerCase().includes(searchQuery)
  );

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      {/* Barra Superior */}
      <Box>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Gestão de Condutores
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
      Adicionar Condutor
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
              <TableCell>Matrícula</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>CNH</TableCell>
              <TableCell>Veículo Designado</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDrivers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((driver) => (
              <TableRow key={driver.matricula}>
                <TableCell>{driver.matricula}</TableCell>
                <TableCell>{driver.name}</TableCell>
                <TableCell>{driver.cnh}</TableCell>
                <TableCell>{driver.assignedVehicle}</TableCell>
                <TableCell>
                  <Chip
                    label={driver.status ? 'Ativo' : 'Inativo'}
                    color={driver.status ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton color="primary" onClick={() => handleOpenDialog(driver)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Desativar">
                    <IconButton color="secondary" onClick={() => handleDeactivateDriver(driver.matricula)}>
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
        count={filteredDrivers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
      />

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingDriver ? 'Editar Condutor' : 'Adicionar Condutor'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Matrícula"
            name="matricula"
            value={formData.matricula}
            onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
            fullWidth
            margin="dense"
            error={!!errors.matricula}
            helperText={errors.matricula}
          />
          <TextField
            label="Nome"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            margin="dense"
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="CNH"
            name="cnh"
            value={formData.cnh}
            onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
            fullWidth
            margin="dense"
            error={!!errors.cnh}
            helperText={errors.cnh}
          />
          <Autocomplete
            options={vehicles.map((vehicle) => `${vehicle.plate} - ${vehicle.model}`)}
            value={formData.assignedVehicle}
            onChange={(event, newValue) => setFormData({ ...formData, assignedVehicle: newValue })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Veículo Designado"
                margin="dense"
                fullWidth
                error={!!errors.assignedVehicle}
                helperText={errors.assignedVehicle}
              />
            )}
          />
          <Box mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                />
              }
              label={formData.status ? 'Ativo' : 'Inativo'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSaveDriver} color="primary" disabled={loading}>
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

export default DriverManagement;
