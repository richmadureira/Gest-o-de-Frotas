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
  Alert
} from '@mui/material';

import { Add, Edit, Delete, Upload, Download } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { CSVLink } from 'react-csv';
import Papa from 'papaparse'; // Biblioteca para processar CSV
import { Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InputMask from 'react-input-mask';

// Tipos e interfaces para TypeScript
interface Driver {
  id: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  status: boolean;
  address?: string;
  grantAccess?: boolean;
}

interface Vehicle {
  id: number;
  plate: string;
  model: string;
}

type DriverFormData = Omit<Driver, 'id'>;
type DriverErrors = Partial<Record<keyof DriverFormData, string>>;

function DriverManagement() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    status: true,
    address: '',
    grantAccess: true,
  });
  const [errors, setErrors] = useState<DriverErrors>({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDrivers([
      { id: 1, name: 'João Silva', cpf: '12345678901', email: 'joao@email.com', phone: '11999999999', status: true },
      { id: 2, name: 'Maria Oliveira', cpf: '98765432100', email: 'maria@email.com', phone: '11988888888', status: false },
      { id: 3, name: 'Carlos Souza', cpf: '11122233344', email: 'carlos@email.com', phone: '11977777777', status: true },
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

  // Validação dinâmica dos campos obrigatórios
  useEffect(() => {
    const newErrors: DriverErrors = {};
    if (!formData.name) newErrors.name = 'Nome obrigatório';
    if (!formData.cpf || formData.cpf.replace(/\D/g, '').length !== 11) newErrors.cpf = 'CPF inválido';
    if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) newErrors.email = 'E-mail inválido';
    if (!formData.phone) newErrors.phone = 'Telefone obrigatório';
    setErrors(newErrors);
  }, [formData]);

  const handleOpenDialog = (driver: Driver | null = null) => {
    setEditingDriver(driver);
    setFormData(
      driver
        ? { ...driver }
        : { name: '', cpf: '', email: '', phone: '', status: true, address: '', grantAccess: true }
    );
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDriver(null);
  };

  const validateForm = () => {
    return Object.keys(errors).length === 0;
  };

  const handleSaveDriver = () => {
    if (!validateForm()) return;
    if (editingDriver) {
      setDrivers(drivers.map(d => (d.id === editingDriver.id ? { ...editingDriver, ...formData } : d)));
      setSnackbarMessage('Dados atualizados com sucesso!');
      setSnackbarType('success');
    } else {
      if (drivers.some(d => d.cpf === formData.cpf)) {
        setSnackbarMessage('Erro ao salvar condutor: CPF já cadastrado');
        setSnackbarType('error');
        setOpenSnackbar(true);
        return;
      }
      setDrivers([...drivers, { ...formData, id: drivers.length ? Math.max(...drivers.map(d => d.id)) + 1 : 1 }]);
      setSnackbarMessage('Condutor criado com sucesso!');
      setSnackbarType('success');
    }
    setOpenSnackbar(true);
    handleCloseDialog();
  };

  const handleDeleteDriver = (id: number) => {
    setDrivers(drivers.filter(d => d.id !== id));
    setSnackbarMessage('Condutor removido com sucesso!');
    setSnackbarType('success');
    setOpenSnackbar(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const importedDrivers: Driver[] = results.data.map((row: any) => ({
          id: row.id,
          name: row.name,
          cpf: row.cpf,
          email: row.email,
          phone: row.phone,
          status: row.status === 'true',
          address: row.address,
          grantAccess: row.grantAccess === 'true',
        }));

        const duplicates = importedDrivers.filter((imported) =>
          drivers.some((existing) => existing.cpf === imported.cpf)
        );

        if (duplicates.length > 0) {
          setSnackbarMessage('Erro: CPFs duplicados no arquivo importado.');
          setSnackbarType('error');
          setOpenSnackbar(true);
          return;
        }

        setDrivers([...drivers, ...importedDrivers]);
        setSnackbarMessage('Dados importados com sucesso!');
        setSnackbarType('success');
        setOpenSnackbar(true);
      },
    });
  };

  // Função para normalizar strings (remover acentos e deixar minúsculo)
  function normalize(str: string) {
    return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
  }

  const filteredDrivers = drivers.filter(d => {
    const query = normalize(searchQuery);
    return (
      normalize(d.name).includes(query) ||
      normalize(d.cpf).includes(query) ||
      (d.email && normalize(d.email).includes(query)) ||
      (d.phone && normalize(d.phone).includes(query))
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
            Novo Condutor
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
              <TableCell>ID</TableCell>
              <TableCell>Nome completo</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>E-mail</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDrivers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>{driver.id}</TableCell>
                <TableCell>{driver.name}</TableCell>
                <TableCell>{driver.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</TableCell>
                <TableCell>{driver.email}</TableCell>
                <TableCell>{driver.phone}</TableCell>
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
                  <Tooltip title="Excluir">
                    <IconButton color="error" onClick={() => handleDeleteDriver(driver.id)}>
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
        <DialogTitle>{editingDriver ? 'Editar Condutor' : 'Novo Condutor'}</DialogTitle>
        <DialogContent>
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
            <InputMask
              mask="999.999.999-99"
              value={formData.cpf}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cpf: e.target.value })}
            >
              {(inputProps: any) => (
                <TextField
                  {...inputProps}
                  label="CPF *"
                  error={!!errors.cpf}
                  helperText={errors.cpf}
                  fullWidth
                  margin="normal"
                  required
                />
              )}
            </InputMask>
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
            <TextField
              label="Telefone *"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              error={!!errors.phone}
              helperText={errors.phone}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Endereço"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              margin="normal"
            />
            {editingDriver && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.grantAccess}
                    onChange={e => setFormData({ 
                      ...formData, 
                      grantAccess: e.target.checked,
                      status: e.target.checked
                    })}
                    color="primary"
                  />
                }
                label="Conceder acesso ao sistema"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancelar</Button>
          <Button onClick={handleSaveDriver} color="primary" variant="contained" disabled={!formData.name || !formData.cpf || !formData.email || !formData.phone || Object.keys(errors).length > 0}>
            Salvar
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
