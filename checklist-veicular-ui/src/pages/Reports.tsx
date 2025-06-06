import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  Chip,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar,
  Box,
  TablePagination,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Grid
} from '@mui/material';
import { Visibility, Home, PictureAsPdf, Download } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';

// Tipos e interfaces para TypeScript
interface Checklist {
  mileage: string;
  tires: string;
  lights: string;
  cleanliness: string;
  oil: string;
  brakes: string;
  avariasDescription: string;
  brakesImage: string;
}

interface ReportDetails {
  driver: string;
  vehicle: string;
  checklist: Checklist | null;
}

interface Report {
  id: number;
  date: string;
  status: string;
  avarias: string;
  details: ReportDetails;
}

type DateRange = { start: Date | null; end: Date | null };

const vehiclesList = [
  'ABC-1234', 'DEF-5678', 'GHI-9012', 'JKL-3456', 'MNO-7890', 'PQR-1122', 'STU-3344', 'VWX-5566', 'YZA-7788', 'BCD-9900', 'EFG-2233'
];
const driversList = [
  'João Silva', 'Maria Oliveira', 'Carlos Souza', 'Ana Clara', 'Pedro Costa', 'Lucas Ferreira', 'Mariana Rocha', 'Bruna Lima', 'Eduardo Gomes', 'Sofia Andrade', 'Renato Silva'
];

function Reports() {
  const [data, setData] = useState<Report[]>([]);
  const [filteredData, setFilteredData] = useState<Report[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [driver, setDriver] = useState('');
  const [reportType, setReportType] = useState('checklist');
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', type: 'success' });

  const navigate = useNavigate();

  useEffect(() => {
    setData([
      {
        id: 1,
        date: '2023-11-01',
        status: 'Enviado',
        avarias: 'Não',
        details: {
          driver: 'João Silva',
          vehicle: 'ABC-1234',
          checklist: {
            mileage: '12000 km',
            tires: 'Bom',
            lights: 'Funcionando',
            cleanliness: 'Limpo',
            oil: 'Nível adequado',
            brakes: 'Funcionando',
            avariasDescription: '',
            brakesImage: '/path/to/image1.jpg',
          },
        },
      },
      {
        id: 2,
        date: '2023-11-02',
        status: 'Não Enviado',
        avarias: 'N/A',
        details: {
          driver: 'Maria Oliveira',
          vehicle: 'DEF-5678',
          checklist: null,
        },
      },
      {
        id: 3,
        date: '2023-11-03',
        status: 'Enviado',
        avarias: 'Sim',
        details: {
          driver: 'Carlos Souza',
          vehicle: 'GHI-9012',
          checklist: {
            mileage: '15000 km',
            tires: 'Regular',
            lights: 'Com defeito',
            cleanliness: 'Sujo',
            oil: 'Necessita completar',
            brakes: 'Com defeito',
            avariasDescription: 'Farol direito quebrado',
            brakesImage: '/path/to/image2.jpg',
          },
        },
      },
      {
        id: 4,
        date: '2023-11-04',
        status: 'Enviado',
        avarias: 'Não',
        details: {
          driver: 'Ana Clara',
          vehicle: 'JKL-3456',
          checklist: {
            mileage: '8900 km',
            tires: 'Bom',
            lights: 'Funcionando',
            cleanliness: 'Limpo',
            oil: 'Nível adequado',
            brakes: 'Funcionando',
            avariasDescription: '',
            brakesImage: '/path/to/image3.jpg',
          },
        },
      },
      {
        id: 5,
        date: '2023-11-05',
        status: 'Enviado',
        avarias: 'Sim',
        details: {
          driver: 'Pedro Costa',
          vehicle: 'MNO-7890',
          checklist: {
            mileage: '43000 km',
            tires: 'Regular',
            lights: 'Funcionando',
            cleanliness: 'Sujo',
            oil: 'Necessita completar',
            brakes: 'Funcionando',
            avariasDescription: 'Arranhões na lateral',
            brakesImage: '/path/to/image4.jpg',
          },
        },
      },
      {
        id: 6,
        date: '2023-11-06',
        status: 'Enviado',
        avarias: 'Não',
        details: {
          driver: 'Lucas Ferreira',
          vehicle: 'PQR-1122',
          checklist: {
            mileage: '57000 km',
            tires: 'Bom',
            lights: 'Funcionando',
            cleanliness: 'Limpo',
            oil: 'Nível adequado',
            brakes: 'Funcionando',
            avariasDescription: '',
            brakesImage: '/path/to/image5.jpg',
          },
        },
      },
      {
        id: 7,
        date: '2023-11-07',
        status: 'Não Enviado',
        avarias: 'N/A',
        details: {
          driver: 'Mariana Rocha',
          vehicle: 'STU-3344',
          checklist: null,
        },
      },
      {
        id: 8,
        date: '2023-11-08',
        status: 'Enviado',
        avarias: 'Sim',
        details: {
          driver: 'Bruna Lima',
          vehicle: 'VWX-5566',
          checklist: {
            mileage: '27000 km',
            tires: 'Ruim',
            lights: 'Com defeito',
            cleanliness: 'Sujo',
            oil: 'Necessita completar',
            brakes: 'Com defeito',
            avariasDescription: 'Vidro trincado',
            brakesImage: '/path/to/image6.jpg',
          },
        },
      },
      {
        id: 9,
        date: '2024-11-24',
        status: 'Enviado',
        avarias: 'Não',
        details: {
          driver: 'Eduardo Gomes',
          vehicle: 'YZA-7788',
          checklist: {
            mileage: '13000 km',
            tires: 'Bom',
            lights: 'Funcionando',
            cleanliness: 'Limpo',
            oil: 'Nível adequado',
            brakes: 'Funcionando',
            avariasDescription: '',
            brakesImage: '/path/to/image7.jpg',
          },
        },
      },
      {
        id: 10,
        date: '2023-11-10',
        status: 'Não Enviado',
        avarias: 'N/A',
        details: {
          driver: 'Sofia Andrade',
          vehicle: 'BCD-9900',
          checklist: null,
        },
      },
      {
        id: 11,
        date: '2023-11-11',
        status: 'Enviado',
        avarias: 'Sim',
        details: {
          driver: 'Renato Silva',
          vehicle: 'EFG-2233',
          checklist: {
            mileage: '49000 km',
            tires: 'Regular',
            lights: 'Com defeito',
            cleanliness: 'Sujo',
            oil: 'Necessita completar',
            brakes: 'Com defeito',
            avariasDescription: 'Amassado no para-choque',
            brakesImage: '/path/to/image8.jpg',
          },
        },
      },
    ]);
  }, []);

  const handleFilter = useCallback(() => {
    const filtered = data.filter((item) => {
      const isWithinDateRange =
        (!dateRange.start || new Date(item.date) >= dateRange.start) &&
        (!dateRange.end || new Date(item.date) <= dateRange.end);
      const matchesVehicle = !vehicle || item.details?.vehicle === vehicle;
      const matchesDriver = !driver || item.details?.driver === driver;
      return isWithinDateRange && matchesVehicle && matchesDriver;
    });
    setFilteredData(filtered);
  }, [data, dateRange, vehicle, driver]);

  useEffect(() => {
    handleFilter();
  }, [data, handleFilter]);

  const handleViewDetails = (report: Report) => {
    if (report.details?.checklist) {
      navigate('/report-details', { state: { report } });
    }
  };

  const exportData = filteredData.map((report) => {
    const checklist = report.details?.checklist || ({} as Checklist);
    return {
      Data: report.date,
      Condutor: report.details?.driver || 'N/A',
      Veículo: report.details?.vehicle || 'N/A',
      Avarias: report.avarias,
      Status: report.status,
      'Quilometragem': checklist.mileage || 'N/A',
      'Condição dos Pneus': checklist.tires || 'N/A',
      'Faróis e Lanternas': checklist.lights || 'N/A',
      'Higienização': checklist.cleanliness || 'N/A',
      'Óleo do Motor': checklist.oil || 'N/A',
      Freios: checklist.brakes || 'N/A',
      'Descrição das Avarias': checklist.avariasDescription || 'N/A',
      'Imagem das Avarias': checklist.brakesImage || 'N/A',
    };
  });

  // Exportação PDF (mock)
  const handleExportPDF = () => {
    setSnackbar({ open: true, msg: 'Relatório gerado com sucesso', type: 'success' });
  };

  // Mensagem sem dados
  const noData = filteredData.length === 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Painel de Filtros */}
      <Paper sx={{ p: 3, mt: 4, mb: 3 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Relatório</InputLabel>
              <Select label="Tipo de Relatório" value={reportType} onChange={e => setReportType(e.target.value)}>
                <MenuItem value="checklist">Checklist Diário</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2.5}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Data Inicial"
                value={dateRange.start}
                onChange={(newValue) => setDateRange({ ...dateRange, start: newValue })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={2.5}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Data Final"
                value={dateRange.end}
                onChange={(newValue) => setDateRange({ ...dateRange, end: newValue })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Veículo</InputLabel>
              <Select label="Veículo" value={vehicle} onChange={e => setVehicle(e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                {vehiclesList.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Condutor</InputLabel>
              <Select label="Condutor" value={driver} onChange={e => setDriver(e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                {driversList.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box textAlign="center" mt={3}>
          <Button variant="contained" color="primary" onClick={handleFilter}>Pesquisar</Button>
        </Box>
      </Paper>
      {/* Exibição dos resultados: Checklist Diário */}
      {noData ? (
        <Alert severity="info" sx={{ mt: 4 }}>Nenhum registro encontrado para os filtros selecionados.</Alert>
      ) : (
        <>
          <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
            <CSVLink data={exportData} filename="relatorios_checklist.csv" style={{ textDecoration: 'none' }}>
              <Button variant="outlined" color="secondary" startIcon={<Download />}>Exportar CSV</Button>
            </CSVLink>
            <Button variant="outlined" color="secondary" startIcon={<PictureAsPdf />} onClick={handleExportPDF}>Exportar PDF</Button>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Veículo</TableCell>
                  <TableCell>Condutor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Avarias</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.details?.vehicle || 'N/A'}</TableCell>
                    <TableCell>{report.details?.driver || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={report.status} color={report.status === 'Enviado' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>{report.avarias === 'Sim' ? 'Sim' : 'Não'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Visualizar">
                        <span>
                          <IconButton color="primary" onClick={() => handleViewDetails(report)} disabled={!report.details?.checklist}>
                            <Visibility />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </>
      )}
      {/* Snackbar para feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.type as any} sx={{ width: '100%' }}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Reports;
