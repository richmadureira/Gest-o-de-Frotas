import React, { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TablePagination,
  Toolbar, TextField, Select, MenuItem, Button, InputLabel, FormControl, IconButton, Dialog, DialogTitle, DialogContent, Chip, Tooltip, Avatar, Stack, Divider
} from '@mui/material';
import { CheckCircle, Warning, CameraAlt, Search, Check, Close } from '@mui/icons-material';

// Mock data
const vehicles = [
  { id: 1, label: 'ABC-1234 – VW Fox' },
  { id: 2, label: 'DEF-5678 – Fiat Uno' },
];
const drivers = [
  { id: 1, label: 'João da Silva' },
  { id: 2, label: 'Maria Oliveira' },
];
const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'concluido', label: 'Concluídos' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'rejeitado', label: 'Rejeitados' },
];
const mockRows = [
  {
    id: 1,
    datetime: '10/07/2024 – 08:30',
    date: '10/07/2024',
    vehicle: 'ABC-1234 – VW Fox',
    driver: 'João da Silva',
    status: 'enviado',
    avarias: 1,
    obs: 'Houve avaria no retrovisor esquerdo',
    quilometragem: 123456,
    itensExtras: [
      { label: 'Extintor', status: 'OK' },
      { label: 'Triângulo', status: 'OK' },
    ],
    items: [
      { label: 'Condição dos Pneus', status: 'ok' },
      { label: 'Faróis e Lanternas', status: 'ok' },
      { label: 'Higienização', status: 'naook' },
      { label: 'Óleo do Motor', status: 'ok' },
      { label: 'Freios', status: 'ok' },
      { label: 'Avarias', status: 'naook' },
    ],
    photos: [
      { url: 'https://via.placeholder.com/80', desc: 'Retrovisor quebrado' },
    ],
    history: [
      { date: '10/07/2024 09:00', action: 'Aprovado', by: 'Gestor' },
    ],
  },
  {
    id: 2,
    datetime: '09/07/2024',
    date: '09/07/2024',
    vehicle: 'DEF-5678 – Fiat Uno',
    driver: 'Maria Oliveira',
    status: 'nao_enviado',
    avarias: 0,
    obs: '',
    quilometragem: null,
    itensExtras: [],
    items: [],
    photos: [],
    history: [],
  },
];

function getStatusIcon(status: string) {
  if (status === 'enviado') return <CheckCircle color="success" fontSize="small" />;
  if (status === 'nao_enviado') return <Warning color="error" fontSize="small" />;
  return <Warning color="warning" fontSize="small" />;
}

const ChecklistManagement: React.FC = () => {
  // Filtros
  const [period, setPeriod] = useState({ from: '', to: '' });
  const [vehicle, setVehicle] = useState('');
  const [driver, setDriver] = useState('');
  const [status, setStatus] = useState('');
  // Tabela
  const [orderBy, setOrderBy] = useState('datetime');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // Filtros e ordenação (mock)
  let filteredRows = mockRows.filter(row =>
    (!vehicle || row.vehicle === vehicle) &&
    (!driver || row.driver === driver) &&
    (!status || row.status === status)
  );
  filteredRows = filteredRows.sort((a, b) => {
    if (orderBy === 'datetime') {
      return order === 'asc' ? a.datetime.localeCompare(b.datetime) : b.datetime.localeCompare(a.datetime);
    }
    if (orderBy === 'vehicle') {
      return order === 'asc' ? a.vehicle.localeCompare(b.vehicle) : b.vehicle.localeCompare(a.vehicle);
    }
    if (orderBy === 'driver') {
      return order === 'asc' ? a.driver.localeCompare(b.driver) : b.driver.localeCompare(a.driver);
    }
    if (orderBy === 'status') {
      return order === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
    }
    return 0;
  });

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, width: '100%', maxWidth: 1280, mx: 'auto' }}>
      <Typography variant="h5" mb={2} fontWeight={700}>Gestão de Checklists</Typography>
      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="De"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={period.from}
            onChange={e => setPeriod({ ...period, from: e.target.value })}
          />
          <TextField
            label="Até"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={period.to}
            onChange={e => setPeriod({ ...period, to: e.target.value })}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Veículo</InputLabel>
            <Select
              label="Veículo"
              value={vehicle}
              onChange={e => setVehicle(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {vehicles.map(v => <MenuItem key={v.id} value={v.label}>{v.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Condutor</InputLabel>
            <Select
              label="Condutor"
              value={driver}
              onChange={e => setDriver(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {drivers.map(d => <MenuItem key={d.id} value={d.label}>{d.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              {statusOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" startIcon={<Search />}>
            Filtrar
          </Button>
        </Stack>
      </Paper>
      {/* Tabela */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sortDirection={orderBy === 'datetime' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'datetime'}
                    direction={orderBy === 'datetime' ? order : 'asc'}
                    onClick={() => handleRequestSort('datetime')}
                  >
                    Data/Hora
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'vehicle' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'vehicle'}
                    direction={orderBy === 'vehicle' ? order : 'asc'}
                    onClick={() => handleRequestSort('vehicle')}
                  >
                    Veículo
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'driver' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'driver'}
                    direction={orderBy === 'driver' ? order : 'asc'}
                    onClick={() => handleRequestSort('driver')}
                  >
                    Condutor
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'status' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>Avarias</TableCell>
                <TableCell>Observações</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.status === 'nao_enviado' ? row.date : row.datetime}</TableCell>
                  <TableCell>{row.vehicle}</TableCell>
                  <TableCell>{row.driver}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {getStatusIcon(row.status)}
                      <Typography variant="body2" color={row.status === 'enviado' ? 'success.main' : 'error.main'}>
                        {row.status === 'enviado' ? 'Enviado' : 'Não enviado'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {row.status === 'enviado' && row.avarias > 0 ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CameraAlt color="action" fontSize="small" />
                        <Typography variant="body2">{row.avarias}</Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2">–</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.status === 'enviado' && row.obs ? (
                      <Tooltip title={row.obs}>
                        <Typography variant="body2">
                          {row.obs.length > 50 ? row.obs.slice(0, 50) + '…' : row.obs}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2">–</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.status === 'enviado' ? (
                      <IconButton color="primary" onClick={() => { setSelectedRow(row); setOpenModal(true); }}>
                        <Search />
                      </IconButton>
                    ) : (
                      <IconButton color="default" disabled>
                        <Search />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, { label: 'Todos', value: filteredRows.length }]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
        />
      </Paper>
      {/* Modal de Detalhes */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalhes do Checklist</DialogTitle>
        <DialogContent>
          {selectedRow && (
            <Box>
              <Typography variant="subtitle1" mb={1}><b>Data/Hora:</b> {selectedRow.datetime}</Typography>
              <Typography variant="subtitle1" mb={1}><b>Veículo:</b> {selectedRow.vehicle}</Typography>
              <Typography variant="subtitle1" mb={1}><b>Condutor:</b> {selectedRow.driver}</Typography>
              <Typography variant="subtitle1" mb={1}><b>Status:</b> {selectedRow.status === 'enviado' ? 'Enviado' : 'Não enviado'}</Typography>
              {selectedRow.quilometragem !== undefined && selectedRow.quilometragem !== null && (
                <Typography variant="subtitle1" mb={1}><b>Quilometragem:</b> {selectedRow.quilometragem}</Typography>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" mb={1}><b>Itens Verificados:</b></Typography>
              {selectedRow.items && selectedRow.items.length > 0 ? (
                <>
                  <Typography variant="body2" fontWeight={700} color="success.main" mb={0.5}>Itens OK</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                    {selectedRow.items.filter((item: any) => item.status === 'ok').map((item: any, idx: number) => (
                      <Chip
                        key={item.label + idx}
                        icon={<Check />}
                        label={item.label + ' - OK'}
                        color="success"
                        size="small"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Stack>
                  <Typography variant="body2" fontWeight={700} color="error.main" mb={0.5}>Itens Não OK</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                    {selectedRow.items.filter((item: any) => item.status === 'naook').map((item: any, idx: number) => (
                      <Chip
                        key={item.label + idx}
                        icon={<Close />}
                        label={item.label + ' - Não OK'}
                        color="error"
                        size="small"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Stack>
                </>
              ) : <Typography variant="body2">Nenhum item verificado</Typography>}
              {selectedRow.obs && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" mb={1}><b>Observações:</b></Typography>
                  <Typography variant="body2" mb={2}>{selectedRow.obs}</Typography>
                </>
              )}
              <Typography variant="subtitle2" mb={1}><b>Fotos de Avarias:</b></Typography>
              <Stack direction="row" spacing={2} mb={2}>
                {selectedRow.photos && selectedRow.photos.length > 0 ? selectedRow.photos.map((photo: any, idx: number) => (
                  <Tooltip key={idx} title={photo.desc}>
                    <Avatar src={photo.url} variant="rounded" sx={{ width: 64, height: 64, cursor: 'pointer' }} />
                  </Tooltip>
                )) : <Typography variant="body2">Nenhuma foto</Typography>}
              </Stack>
              <Typography variant="subtitle2" mb={1}><b>Histórico de Aprovação/Rejeição:</b></Typography>
              <Stack spacing={1}>
                {selectedRow.history && selectedRow.history.length > 0 ? selectedRow.history.map((h: any, idx: number) => (
                  <Typography key={idx} variant="body2">{h.date} - {h.action} por {h.by}</Typography>
                )) : <Typography variant="body2">Nenhum histórico</Typography>}
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ChecklistManagement; 