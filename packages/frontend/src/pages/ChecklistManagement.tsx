import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TablePagination,
  Toolbar, TextField, Select, MenuItem, Button, InputLabel, FormControl, IconButton, Dialog, DialogTitle, DialogContent, Chip, Tooltip, Avatar, Stack, Divider, Alert, CircularProgress, Badge
} from '@mui/material';
import { CheckCircle, Warning, CameraAlt, Search, Check, Close, ReportProblem, Error } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { getChecklists, getVeiculos, getUsuarios } from '../services/api';

// Interfaces TypeScript
interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  tipo: string;
  status: string;
  quilometragem?: number;
  ultimaManutencao?: string;
  proximaManutencao?: string;
}

interface Usuario {
  id: string;
  email: string;
  nome: string;
  papel: string;
  cpf?: string;
  telefone?: string;
  ativo: boolean;
  criadoEm: string;
}

interface ChecklistItem {
  id: string;
  data: string;
  veiculoId: string;
  motoristaId: string;
  placaVeiculo: string;
  kmVeiculo: number;
  status: string;
  pneus: boolean;
  luzes: boolean;
  freios: boolean;
  limpeza: boolean;
  imagemPneus?: string;
  imagemLuzes?: string;
  imagemFreios?: string;
  imagemOutrasAvarias?: string;
  observacoes?: string;
  enviado: boolean;
  veiculo?: Veiculo;
  motorista?: Usuario;
}

const ChecklistManagement: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, user } = useAuth();
  
  // Função auxiliar para construir URLs de imagens
  const construirUrlImagem = (caminhoImagem: string) => {
    if (!caminhoImagem) {
      console.log('caminho vazio');
      return '';
    }
    
    // Se já é uma URL completa, retorna como está
    if (caminhoImagem.startsWith('http')) {
      console.log('URL completa:', caminhoImagem);
      return caminhoImagem;
    }
    
    // Se começa com /, usa diretamente
    if (caminhoImagem.startsWith('/')) {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5119/api';
      const baseUrl = apiUrl.replace('/api', '');
      const fullUrl = `${baseUrl}${caminhoImagem}`;
      console.log('Caminho com /:', caminhoImagem, '-> URL final:', fullUrl);
      return fullUrl;
    }
    
    // Caso contrário, adiciona o prefixo
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5119/api';
    const baseUrl = apiUrl.replace('/api', '');
    const fullUrl = `${baseUrl}/uploads/checklists/${caminhoImagem}`;
    console.log('Caminho sem /:', caminhoImagem, '-> URL final:', fullUrl);
    return fullUrl;
  };
  
  // Estados dos dados
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [period, setPeriod] = useState({ from: '', to: '' });
  const [vehicle, setVehicle] = useState('');
  const [driver, setDriver] = useState('');
  
  // Tabela
  const [orderBy, setOrderBy] = useState('data');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ChecklistItem | null>(null);

  // Carregar dados do backend
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar checklists, veículos e usuários em paralelo
      const [checklistsData, veiculosData, usuariosData] = await Promise.all([
        getChecklists(),
        getVeiculos(),
        getUsuarios({ papel: 'Condutor' })
      ]);
      
      setChecklists(checklistsData);
      setVeiculos(veiculosData);
      setUsuarios(usuariosData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Implementar filtros funcionais
  const handleFiltrar = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (period.from) params.dataInicio = period.from;
      if (period.to) params.dataFim = period.to;
      if (vehicle) params.veiculoId = vehicle;
      if (driver) params.motoristaId = driver;
      
      const data = await getChecklists(params);
      setChecklists(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao filtrar checklists');
    } finally {
      setLoading(false);
    }
  };

  // Implementar navegação para manutenção
  const handleCriarManutencao = (checklist: ChecklistItem) => {
    // Construir lista de itens com problema
    const itensProblema = [];
    if (!checklist.pneus) itensProblema.push('Pneus');
    if (!checklist.luzes) itensProblema.push('Luzes');
    if (!checklist.freios) itensProblema.push('Freios');
    if (!checklist.limpeza) itensProblema.push('Limpeza');
    
    const veiculo = veiculos.find(v => v.id === checklist.veiculoId);
    console.log('ChecklistManagement - veiculo encontrado:', veiculo);
    console.log('ChecklistManagement - veiculoId:', checklist.veiculoId);
    
    navigate('/maintenance/new', { 
      state: { 
        fromChecklist: true,  // FLAG NOVA
        veiculoId: checklist.veiculoId,
        veiculoPlaca: veiculo?.placa,
        veiculoModelo: veiculo?.modelo,
        checklistId: checklist.id,
        descricao: `Problemas identificados no checklist: ${itensProblema.join(', ')}${checklist.observacoes ? '\n\nObservações: ' + checklist.observacoes : ''}`,
        tipoManutencao: 'Corretiva',
        dataSugerida: new Date().toISOString().split('T')[0],
        // Passar imagens do checklist
        imagemPneus: checklist.imagemPneus,
        imagemLuzes: checklist.imagemLuzes,
        imagemFreios: checklist.imagemFreios,
        imagemOutrasAvarias: checklist.imagemOutrasAvarias
      } 
    });
    setOpenModal(false);
  };

  // Filtros e ordenação
  let filteredRows = checklists;
  filteredRows = filteredRows.sort((a, b) => {
    if (orderBy === 'data') {
      return order === 'asc' ? new Date(a.data).getTime() - new Date(b.data).getTime() : new Date(b.data).getTime() - new Date(a.data).getTime();
    }
    if (orderBy === 'veiculo') {
      const veiculoA = a.veiculo || veiculos.find(v => v.id === a.veiculoId);
      const veiculoB = b.veiculo || veiculos.find(v => v.id === b.veiculoId);
      const nomeA = veiculoA ? `${veiculoA.placa} - ${veiculoA.modelo}` : a.placaVeiculo;
      const nomeB = veiculoB ? `${veiculoB.placa} - ${veiculoB.modelo}` : b.placaVeiculo;
      return order === 'asc' ? nomeA.localeCompare(nomeB) : nomeB.localeCompare(nomeA);
    }
    if (orderBy === 'condutor') {
      const motoristaA = a.motorista || usuarios.find(u => u.id === a.motoristaId);
      const motoristaB = b.motorista || usuarios.find(u => u.id === b.motoristaId);
      const nomeA = motoristaA?.nome || 'N/A';
      const nomeB = motoristaB?.nome || 'N/A';
      return order === 'asc' ? nomeA.localeCompare(nomeB) : nomeB.localeCompare(nomeA);
    }
    return 0;
  });

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleOpenModal = (checklist: ChecklistItem) => {
    setSelectedRow(checklist);
    setOpenModal(true);
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
      
      {/* Loading e Error */}
      {loading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
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
              {veiculos.map(v => (
                <MenuItem key={v.id} value={v.id}>
                  {v.placa} - {v.modelo}
                </MenuItem>
              ))}
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
              {usuarios.map(u => (
                <MenuItem key={u.id} value={u.id}>
                  {u.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" startIcon={<Search />} onClick={handleFiltrar}>
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
                <TableCell sortDirection={orderBy === 'data' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'data'}
                    direction={orderBy === 'data' ? order : 'asc'}
                    onClick={() => handleRequestSort('data')}
                  >
                    Data/Hora
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'veiculo' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'veiculo'}
                    direction={orderBy === 'veiculo' ? order : 'asc'}
                    onClick={() => handleRequestSort('veiculo')}
                  >
                    Veículo
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'condutor' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'condutor'}
                    direction={orderBy === 'condutor' ? order : 'asc'}
                    onClick={() => handleRequestSort('condutor')}
                  >
                    Condutor
                  </TableSortLabel>
                </TableCell>
                <TableCell>Avarias</TableCell>
                <TableCell>Observações</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(checklist => {
                // Encontrar veículo e motorista
                const veiculo = checklist.veiculo || veiculos.find(v => v.id === checklist.veiculoId);
                const motorista = checklist.motorista || usuarios.find(u => u.id === checklist.motoristaId);
                
                // Contar avarias (itens com false)
                const avarias = [
                  !checklist.pneus,
                  !checklist.luzes,
                  !checklist.freios,
                  !checklist.limpeza
                ].filter(Boolean).length;
                
                // Verificar se tem imagens de avarias
                const temImagens = !!(checklist.imagemPneus || checklist.imagemLuzes || 
                                      checklist.imagemFreios || checklist.imagemOutrasAvarias);
                
                return (
                  <TableRow key={checklist.id} hover>
                  <TableCell>
                      {new Date(checklist.data).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                      {veiculo ? `${veiculo.placa} - ${veiculo.modelo}` : checklist.placaVeiculo}
                    </TableCell>
                    <TableCell>{motorista?.nome || 'N/A'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: `conic-gradient(from 0deg, 
                            ${avarias === 0 ? '#4caf50' : avarias === 1 ? '#ff9800' : '#f44336'} 0deg, 
                            ${avarias === 0 ? '#4caf50' : avarias === 1 ? '#ff9800' : '#f44336'} ${(5 - avarias) * 72}deg, 
                            #e0e0e0 ${(5 - avarias) * 72}deg, 
                            #e0e0e0 360deg)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          <Box sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            border: '1px solid #ccc'
                          }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {avarias === 0 ? 'Excelente' : avarias === 1 ? 'Bom' : 'Ruim'}
                        </Typography>
                        {temImagens && <CameraAlt color="action" fontSize="small" />}
                      </Box>
                  </TableCell>
                  <TableCell>
                      <Tooltip title={checklist.observacoes || ''}>
                        <Typography variant="body2">
                          {checklist.observacoes 
                            ? (checklist.observacoes.length > 50 
                                ? checklist.observacoes.slice(0, 50) + '...' 
                                : checklist.observacoes)
                            : '–'}
                        </Typography>
                      </Tooltip>
                  </TableCell>
                  <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenModal(checklist)}
                      >
                        <Search />
                      </IconButton>
                  </TableCell>
                </TableRow>
                );
              })}
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
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" component="div">
            📋 Detalhes do Checklist
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedRow && (
            <Box>
              <Typography variant="subtitle1" mb={1}>
                <b>Data/Hora:</b> {new Date(selectedRow.data).toLocaleString('pt-BR')}
              </Typography>
              <Typography variant="subtitle1" mb={1}>
                <b>Veículo:</b> {selectedRow.placaVeiculo}
              </Typography>
              <Typography variant="subtitle1" mb={1}>
                <b>Condutor:</b> {usuarios.find(u => u.id === selectedRow.motoristaId)?.nome}
              </Typography>
              <Typography variant="subtitle1" mb={1}>
                <b>Quilometragem:</b> {selectedRow.kmVeiculo.toLocaleString()} km
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" mb={2}><b>Itens Verificados:</b></Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  border: '1px solid', 
                  borderColor: selectedRow.pneus ? 'success.main' : 'error.main',
                  bgcolor: selectedRow.pneus ? 'success.50' : 'error.50'
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {selectedRow.pneus ? <CheckCircle color="success" /> : <Close color="error" />}
                    <Typography variant="body2" fontWeight={500}>
                      Pneus
                    </Typography>
                  </Stack>
                </Box>
                
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  border: '1px solid', 
                  borderColor: selectedRow.luzes ? 'success.main' : 'error.main',
                  bgcolor: selectedRow.luzes ? 'success.50' : 'error.50'
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {selectedRow.luzes ? <CheckCircle color="success" /> : <Close color="error" />}
                    <Typography variant="body2" fontWeight={500}>
                      Luzes
                    </Typography>
                  </Stack>
                </Box>
                
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  border: '1px solid', 
                  borderColor: selectedRow.freios ? 'success.main' : 'error.main',
                  bgcolor: selectedRow.freios ? 'success.50' : 'error.50'
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {selectedRow.freios ? <CheckCircle color="success" /> : <Close color="error" />}
                    <Typography variant="body2" fontWeight={500}>
                      Freios
                    </Typography>
                  </Stack>
                </Box>
                
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  border: '1px solid', 
                  borderColor: selectedRow.limpeza ? 'success.main' : 'error.main',
                  bgcolor: selectedRow.limpeza ? 'success.50' : 'error.50'
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {selectedRow.limpeza ? <CheckCircle color="success" /> : <Close color="error" />}
                    <Typography variant="body2" fontWeight={500}>
                      Limpeza
                    </Typography>
                  </Stack>
                </Box>
              </Box>
              
              {/* Observações */}
              {selectedRow.observacoes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" mb={1}><b>Observações:</b></Typography>
                  <Typography variant="body2" mb={2}>{selectedRow.observacoes}</Typography>
                </>
              )}
              
              {/* Fotos */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" mb={2}><b>Fotos:</b></Typography>

              {selectedRow.imagemPneus || selectedRow.imagemLuzes || selectedRow.imagemFreios || selectedRow.imagemOutrasAvarias ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                  {selectedRow.imagemPneus && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Pneus
                      </Typography>
                <Box
                  component="img"
                  src={construirUrlImagem(selectedRow.imagemPneus)}
                  alt="Pneus"
                  sx={{
                    width: 120,
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => {
                    const url = construirUrlImagem(selectedRow.imagemPneus!);
                    console.log('Abrindo imagem:', url);
                    window.open(url, '_blank');
                  }}
                  onError={(e) => {
                    const imgElement = e.currentTarget;
                    console.error('Erro ao carregar imagem:', imgElement.src);
                    // Mostrar placeholder em vez de ocultar
                    imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="%23ddd" width="120" height="120"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="14">Erro</text></svg>';
                    imgElement.style.border = '2px solid red';
                  }}
                />
                    </Box>
                  )}
                  
                  {selectedRow.imagemLuzes && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Luzes
                      </Typography>
                <Box
                  component="img"
                  src={construirUrlImagem(selectedRow.imagemLuzes)}
                  alt="Luzes"
                  sx={{
                    width: 120,
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => {
                    const url = construirUrlImagem(selectedRow.imagemLuzes!);
                    console.log('Abrindo imagem:', url);
                    window.open(url, '_blank');
                  }}
                  onError={(e) => {
                    const imgElement = e.currentTarget;
                    console.error('Erro ao carregar imagem:', imgElement.src);
                    // Mostrar placeholder em vez de ocultar
                    imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="%23ddd" width="120" height="120"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="14">Erro</text></svg>';
                    imgElement.style.border = '2px solid red';
                  }}
                />
                    </Box>
                  )}
                  
                  {selectedRow.imagemFreios && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Freios
                      </Typography>
                <Box
                  component="img"
                  src={construirUrlImagem(selectedRow.imagemFreios)}
                  alt="Freios"
                  sx={{
                    width: 120,
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => {
                    const url = construirUrlImagem(selectedRow.imagemFreios!);
                    console.log('Abrindo imagem:', url);
                    window.open(url, '_blank');
                  }}
                  onError={(e) => {
                    const imgElement = e.currentTarget;
                    console.error('Erro ao carregar imagem:', imgElement.src);
                    // Mostrar placeholder em vez de ocultar
                    imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="%23ddd" width="120" height="120"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="14">Erro</text></svg>';
                    imgElement.style.border = '2px solid red';
                  }}
                />
                    </Box>
                  )}
                  
                  {selectedRow.imagemOutrasAvarias && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Outras Avarias
                      </Typography>
                <Box
                  component="img"
                  src={construirUrlImagem(selectedRow.imagemOutrasAvarias)}
                  alt="Outras Avarias"
                  sx={{
                    width: 120,
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => {
                    const url = construirUrlImagem(selectedRow.imagemOutrasAvarias!);
                    console.log('Abrindo imagem:', url);
                    window.open(url, '_blank');
                  }}
                  onError={(e) => {
                    const imgElement = e.currentTarget;
                    console.error('Erro ao carregar imagem:', imgElement.src);
                    // Mostrar placeholder em vez de ocultar
                    imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="%23ddd" width="120" height="120"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="14">Erro</text></svg>';
                    imgElement.style.border = '2px solid red';
                  }}
                />
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    📷 Nenhuma foto disponível
                  </Typography>
                </Box>
              )}
              
              {/* Botão para criar manutenção (se houver avarias) */}
              {(userRole === 'admin' || userRole === 'gestor') && 
               (!selectedRow.pneus || !selectedRow.luzes || !selectedRow.freios || !selectedRow.limpeza) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Button 
                    variant="contained" 
                    color="warning"
                    onClick={() => handleCriarManutencao(selectedRow)}
                  >
                    Criar Solicitação de Manutenção
                  </Button>
                </>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ChecklistManagement; 