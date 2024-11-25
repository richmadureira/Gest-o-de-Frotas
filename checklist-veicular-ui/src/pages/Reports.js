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
} from '@mui/material';
import { Visibility, Home } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';

function Reports() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [searchQuery, setSearchQuery] = useState('');

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
        (!dateRange.start || new Date(item.date) >= new Date(dateRange.start)) &&
        (!dateRange.end || new Date(item.date) <= new Date(dateRange.end));
      const matchesSearchQuery =
        item.details?.driver.toLowerCase().includes(searchQuery.toLowerCase());
      return isWithinDateRange && matchesSearchQuery;
    });

    setFilteredData(filtered);
  }, [data, dateRange, searchQuery]);

  useEffect(() => {
    handleFilter();
  }, [data, handleFilter]);

  const handleViewDetails = (report) => {
    if (report.details?.checklist) {
      navigate('/report-details', { state: { report } });
    }
  };

  const exportData = filteredData.map((report) => {
    const checklist = report.details?.checklist || {};
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

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Relatórios - Gestão de Frota
          </Typography>
          <Tooltip title="Home">
            <IconButton color="inherit" onClick={() => navigate('/')}>
              <Home />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={3} marginTop={4}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Data Inicial"
            value={dateRange.start}
            onChange={(newValue) => setDateRange({ ...dateRange, start: newValue })}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="Data Final"
            value={dateRange.end}
            onChange={(newValue) => setDateRange({ ...dateRange, end: newValue })}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <TextField
          label="Pesquisar por Condutor"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '300px' }}
        />
        <Button variant="contained" color="primary" onClick={handleFilter}>
          Filtrar
        </Button>
        <CSVLink data={exportData} filename="relatorios_checklist_completo.csv">
          <Button variant="outlined" color="secondary">
            Exportar CSV
          </Button>
        </CSVLink>
      </Box>

      <TableContainer component={Paper} style={{ marginTop: '2rem' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Condutor</TableCell>
              <TableCell>Veículo</TableCell>
              <TableCell>Avarias</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>{report.details?.driver || 'N/A'}</TableCell>
                  <TableCell>{report.details?.vehicle || 'N/A'}</TableCell>
                  <TableCell>{report.avarias}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      color={report.status === 'Enviado' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Visualizar">
                      <span>
                        <IconButton
                          color="primary"
                          onClick={() => handleViewDetails(report)}
                          disabled={!report.details?.checklist}
                        >
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
    </Container>
  );
}

export default Reports;
