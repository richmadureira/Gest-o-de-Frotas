import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';

function ReportDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const report = state?.report;

  if (!report) {
    navigate(-1);
    return null;
  }

  // Mock de dados do checklist
  const checklistData = report.details?.checklist || {
    mileage: '15000 km',
    tires: 'Bom',
    tiresDesc: 'Sem desgaste visível.',
    tiresImg: 'https://via.placeholder.com/100', // Mock de URL de imagem
    lights: 'Funcionando',
    lightsDesc: 'Todas as luzes testadas e funcionando.',
    lightsImg: 'https://via.placeholder.com/100', // Mock de URL de imagem
    cleanliness: 'Limpo',
    cleanlinessDesc: 'O interior foi higienizado.',
    cleanlinessImg: null, // Sem imagem
    oil: 'Nível adequado',
    oilDesc: 'Verificado, sem necessidade de completar.',
    oilImg: null, // Sem imagem
    brakes: 'Funcionando',
    brakesDesc: 'Sem ruídos ou vibrações.',
    brakesImg: 'https://via.placeholder.com/100', // Mock de URL de imagem
    avarias: 'Não',
    avariasDesc: 'Nenhuma avaria identificada.',
    avariasImg: null, // Sem imagem
  };

  // Transformar os dados do checklist em formato CSV
  const csvData = [
    ['Item', 'Resposta', 'Descrição', 'Imagem'],
    ['Quilometragem', checklistData.mileage, '', ''],
    ['Condição dos Pneus', checklistData.tires, checklistData.tiresDesc, checklistData.tiresImg || 'N/A'],
    ['Faróis e Lanternas', checklistData.lights, checklistData.lightsDesc, checklistData.lightsImg || 'N/A'],
    ['Higienização', checklistData.cleanliness, checklistData.cleanlinessDesc, checklistData.cleanlinessImg || 'N/A'],
    ['Óleo do Motor', checklistData.oil, checklistData.oilDesc, checklistData.oilImg || 'N/A'],
    ['Freios', checklistData.brakes, checklistData.brakesDesc, checklistData.brakesImg || 'N/A'],
    ['Avarias', checklistData.avarias, checklistData.avariasDesc, checklistData.avariasImg || 'N/A'],
  ];

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Detalhes do Relatório
      </Typography>

      <Paper style={{ padding: '1rem', marginBottom: '2rem' }}>
        <Typography variant="h6" gutterBottom>
          Informações Gerais
        </Typography>
        <Box>
          <Typography><strong>Data:</strong> {report.date}</Typography>
          <Typography><strong>Status:</strong> {report.status}</Typography>
          <Typography><strong>Condutor:</strong> {report.details?.driver || 'N/A'}</Typography>
          <Typography><strong>Veículo:</strong> {report.details?.vehicle || 'N/A'}</Typography>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Typography variant="h6" style={{ padding: '1rem' }}>
          Respostas do Checklist
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Item</strong></TableCell>
              <TableCell><strong>Resposta</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
              <TableCell><strong>Imagem</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { label: 'Quilometragem', value: checklistData.mileage, desc: '', img: '' },
              { label: 'Condição dos Pneus', value: checklistData.tires, desc: checklistData.tiresDesc, img: checklistData.tiresImg || 'N/A' },
              { label: 'Faróis e Lanternas', value: checklistData.lights, desc: checklistData.lightsDesc, img: checklistData.lightsImg || 'N/A' },
              { label: 'Higienização', value: checklistData.cleanliness, desc: checklistData.cleanlinessDesc, img: checklistData.cleanlinessImg || 'N/A' },
              { label: 'Óleo do Motor', value: checklistData.oil, desc: checklistData.oilDesc, img: checklistData.oilImg || 'N/A' },
              { label: 'Freios', value: checklistData.brakes, desc: checklistData.brakesDesc, img: checklistData.brakesImg || 'N/A' },
              { label: 'Avarias', value: checklistData.avarias, desc: checklistData.avariasDesc, img: checklistData.avariasImg || 'N/A' },
            ].map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.label}</TableCell>
                <TableCell>{item.value}</TableCell>
                <TableCell>{item.desc || 'N/A'}</TableCell>
                <TableCell>
                  {item.img !== 'N/A' ? (
                    <img
                      src={item.img}
                      alt={`${item.label} imagem`}
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  ) : (
                    'N/A'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box marginTop={2} textAlign="center">
        <CSVLink data={csvData} filename="detalhes_relatorio.csv">
          <Button variant="outlined" color="secondary" style={{ marginRight: '10px' }}>
            Exportar para CSV
          </Button>
        </CSVLink>
        <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </Box>
    </Container>
  );
}

export default ReportDetails;
