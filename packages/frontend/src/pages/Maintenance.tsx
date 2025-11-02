import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Stack,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Build, Assignment, CheckCircle, Schedule, FilterList } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate, useLocation } from 'react-router-dom';
import { SelectChangeEvent } from '@mui/material';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  getVeiculo, 
  getVeiculos, 
  getManutencoes, 
  getManutencao, 
  createManutencao, 
  updateManutencao, 
  updateManutencaoStatus, 
  deleteManutencao 
} from '../services/api';

// Tipos e interfaces para TypeScript
interface Manutencao {
  id: string;
  veiculoId: string;
  veiculo?: {
    id: string;
    placa: string;
    modelo: string;
    marca: string;
  };
  tipo: string; // "Preventiva" | "Corretiva"
  descricao: string;
  custo?: number;
  status: string; // "Agendada" | "EmAndamento" | "Concluida" | "Cancelada"
  agendadoPara: string;
  concluidoEm?: string;
  criadoEm: string;
}

type ManutencaoFormData = {
  veiculoId: string;
  tipo: string;
  prioridade: string;
  quilometragemNoAto?: number;
  descricao: string;
  custo?: number;
};

type ManutencaoErrors = Partial<Record<keyof ManutencaoFormData, string>>;

function Manutencoes() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados para dados da API
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    status: '',
    tipo: '',
    veiculoId: '',
    dataInicio: '',
    dataFim: ''
  });
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  
  // Estados para modal e formulário
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<ManutencaoFormData>({ 
    veiculoId: '', 
    tipo: '', 
    prioridade: 'Media',
    descricao: ''
  });
  const [editingRequest, setEditingRequest] = useState<Manutencao | null>(null);
  const [errors, setErrors] = useState<ManutencaoErrors>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openDetails, setOpenDetails] = useState(false);
  
  // Estados para confirmação de exclusão
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [manutencaoToDelete, setManutencaoToDelete] = useState<Manutencao | null>(null);
  
  // Estados para imagens do checklist
  const [checklistImages, setChecklistImages] = useState<{
    imagemPneus?: string;
    imagemLuzes?: string;
    imagemFreios?: string;
    imagemOutrasAvarias?: string;
  }>({});

  // Função para carregar dados da API
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [manutencoesData, veiculosData] = await Promise.all([
        getManutencoes(filtros),
        getVeiculos()
      ]);
      
      setManutencoes(manutencoesData);
      setVeiculos(veiculosData);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    carregarDados();
  }, []);

  // Função para construir URL da imagem
  const construirUrlImagem = (caminhoImagem: string) => {
    if (!caminhoImagem) return '';
    
    // Se já é uma URL completa, retorna como está
    if (caminhoImagem.startsWith('http')) {
      return caminhoImagem;
    }
    
    // Se começa com /, usa diretamente
    if (caminhoImagem.startsWith('/')) {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5119/api';
      const baseUrl = apiUrl.replace('/api', '');
      return `${baseUrl}${caminhoImagem}`;
    }
    
    // Caso contrário, adiciona o prefixo
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5119/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/uploads/checklists/${caminhoImagem}`;
  };

  // useEffect para receber dados da navegação do checklist
  useEffect(() => {
    const loadDataFromChecklist = async () => {
      // Só processa se vier com flag fromChecklist
      if (location.state && location.state.fromChecklist) {
        const { 
          veiculoId, 
          veiculoPlaca, 
          veiculoModelo, 
          descricao, 
          tipoManutencao, 
          dataSugerida,
          imagemPneus,
          imagemLuzes,
          imagemFreios,
          imagemOutrasAvarias
        } = location.state;
        
        console.log('Dados recebidos do checklist:', { veiculoId, veiculoPlaca, veiculoModelo });
        
        if (veiculoId) {
          try {
            const veiculoData = await getVeiculo(veiculoId);
            setFormData({
              veiculoId: veiculoId,
              descricao: descricao || '',
              tipo: tipoManutencao || 'Corretiva',
              prioridade: 'Media',
              custo: undefined
            });
          } catch (error) {
            console.error('Erro ao buscar veículo:', error);
            setFormData({
              veiculoId: '',
              descricao: descricao || '',
              tipo: tipoManutencao || 'Corretiva',
              prioridade: 'Media',
              custo: undefined
            });
          }
        }
        
        // Armazenar imagens para exibição
        setChecklistImages({
          imagemPneus,
          imagemLuzes,
          imagemFreios,
          imagemOutrasAvarias
        });
        
        // Abrir o dialog automaticamente
        setOpenDialog(true);
        
        // IMPORTANTE: Limpar o state para que não interfira em futuras aberturas
        window.history.replaceState({}, document.title);
      }
    };
    
    loadDataFromChecklist();
  }, [location.state]);

  // Funções CRUD
  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (editingRequest) {
        await updateManutencao(editingRequest.id, formData);
        setSnackbarMessage('Manutenção atualizada com sucesso!');
      } else {
        await createManutencao(formData);
        setSnackbarMessage('Manutenção criada com sucesso!');
      }
      
      await carregarDados();
      handleCloseDialog();
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setError(err.response?.data?.message || 'Erro ao salvar manutenção');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, novoStatus: string) => {
    try {
      setLoading(true);
      await updateManutencaoStatus(id, { status: novoStatus });
      setSnackbarMessage('Status atualizado com sucesso!');
      await carregarDados();
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (manutencao: Manutencao) => {
    setManutencaoToDelete(manutencao);
    setConfirmDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!manutencaoToDelete) return;
    
    try {
      setLoading(true);
      await deleteManutencao(manutencaoToDelete.id);
      setSnackbarMessage('Manutenção excluída com sucesso!');
      await carregarDados();
      setSnackbarOpen(true);
      setConfirmDialogOpen(false);
      setManutencaoToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      setError(err.response?.data?.message || 'Erro ao excluir manutenção');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (request: Manutencao | null = null) => {
    setEditingRequest(request);
    setFormData(request ? {
      veiculoId: request.veiculoId,
      tipo: request.tipo,
      prioridade: 'Media',
      descricao: request.descricao,
      custo: request.custo
    } : { 
      veiculoId: '', 
      tipo: '', 
      prioridade: 'Media',
      descricao: ''
    });
    setErrors({});
    setChecklistImages({});  // Limpar imagens do checklist
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRequest(null);
    setFormData({ veiculoId: '', tipo: '', prioridade: 'Media', descricao: '' });
    setErrors({});
    setChecklistImages({});
  };

  const validateForm = () => {
    const newErrors: ManutencaoErrors = {};
    
    if (!formData.veiculoId) newErrors.veiculoId = 'Veículo é obrigatório';
    if (!formData.tipo) newErrors.tipo = 'Tipo de manutenção é obrigatório';
    if (!formData.prioridade) newErrors.prioridade = 'Prioridade é obrigatória';
    if (!formData.descricao) newErrors.descricao = 'Descrição é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calcular métricas
  const metricas = {
    total: manutencoes.length,
    agendadas: manutencoes.filter(m => m.status === 'Agendada').length,
    emAndamento: manutencoes.filter(m => m.status === 'EmAndamento').length,
    concluidas: manutencoes.filter(m => m.status === 'Concluida').length
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      {/* Título e Botão de Ação */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mt={4}>
        <Typography variant="h4" fontWeight="bold">
          <Build sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestão de Manutenções
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nova Solicitação
        </Button>
      </Box>

      {/* Cards de Métricas */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Total de Manutenções</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.total}</Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: '#1976d2' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Agendadas</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.agendadas}</Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e1f5fe', borderLeft: '4px solid #2196f3' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Em Andamento</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.emAndamento}</Typography>
                </Box>
                <Build sx={{ fontSize: 40, color: '#2196f3' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Concluídas</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.concluidas}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros Expansíveis */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={filtrosAbertos ? 2 : 0}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList />
            <Typography variant="h6">Filtros</Typography>
          </Box>
          <Button size="small" onClick={() => setFiltrosAbertos(!filtrosAbertos)}>
            {filtrosAbertos ? 'Ocultar' : 'Expandir'}
          </Button>
        </Box>
        
        {filtrosAbertos && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filtros.status}
                    onChange={e => setFiltros({ ...filtros, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Agendada">Agendada</MenuItem>
                    <MenuItem value="EmAndamento">Em Andamento</MenuItem>
                    <MenuItem value="Concluida">Concluída</MenuItem>
                    <MenuItem value="Cancelada">Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filtros.tipo}
                    onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}
                    label="Tipo"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Preventiva">Preventiva</MenuItem>
                    <MenuItem value="Corretiva">Corretiva</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box display="flex" gap={2} mt={2}>
              <Button variant="contained" color="primary" onClick={carregarDados}>
                Filtrar
              </Button>
              <Button variant="outlined" onClick={() => setFiltros({
                status: '',
                tipo: '',
                veiculoId: '',
                dataInicio: '',
                dataFim: ''
              })}>
                Limpar
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Alert de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Tabela de Manutenções */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Veículo</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Custo</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {manutencoes.map((manutencao) => (
              <TableRow key={manutencao.id}>
                <TableCell>
                  {manutencao.veiculo ? `${manutencao.veiculo.placa} - ${manutencao.veiculo.modelo}` : 'N/A'}
                </TableCell>
                <TableCell>{manutencao.tipo}</TableCell>
                <TableCell>{manutencao.descricao}</TableCell>
                <TableCell>
                  <Select
                    value={manutencao.status}
                    onChange={(e) => handleUpdateStatus(manutencao.id, e.target.value)}
                    size="small"
                  >
                    <MenuItem value="Agendada">Agendada</MenuItem>
                    <MenuItem value="EmAndamento">Em Andamento</MenuItem>
                    <MenuItem value="Concluida">Concluída</MenuItem>
                    <MenuItem value="Cancelada">Cancelada</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>{manutencao.custo ? `R$ ${manutencao.custo.toFixed(2)}` : '-'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton color="primary" onClick={() => handleOpenDialog(manutencao)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton color="error" onClick={() => handleDeleteClick(manutencao)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para criar/editar manutenção */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRequest ? 'Editar Manutenção' : 'Nova Manutenção'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            {/* Campo Veículo */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Veículo *</InputLabel>
              <Select
                value={formData.veiculoId}
                onChange={e => setFormData({ ...formData, veiculoId: e.target.value })}
                label="Veículo *"
                disabled={!!editingRequest || (location.state && location.state.fromChecklist)}
                error={!!errors.veiculoId}
              >
                {veiculos.map(veiculo => (
                  <MenuItem key={veiculo.id} value={veiculo.id}>
                    {veiculo.placa} - {veiculo.modelo}
                  </MenuItem>
                ))}
              </Select>
              {errors.veiculoId && (
                <Typography variant="caption" color="error">
                  {errors.veiculoId}
                </Typography>
              )}
            </FormControl>

            {/* Campo Tipo */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Tipo de Manutenção *</InputLabel>
              <Select
                value={formData.tipo}
                onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                label="Tipo de Manutenção *"
                error={!!errors.tipo}
              >
                <MenuItem value="Preventiva">Preventiva</MenuItem>
                <MenuItem value="Corretiva">Corretiva</MenuItem>
              </Select>
              {errors.tipo && (
                <Typography variant="caption" color="error">
                  {errors.tipo}
                </Typography>
              )}
            </FormControl>

            {/* Campo Descrição */}
            <TextField
              label="Descrição *"
              value={formData.descricao}
              onChange={e => setFormData({ ...formData, descricao: e.target.value })}
              error={!!errors.descricao}
              helperText={errors.descricao}
              fullWidth
              margin="normal"
              required
              multiline
              rows={3}
            />

            {/* Campo Custo */}
            <TextField
              label="Custo Estimado"
              type="number"
              value={formData.custo || ''}
              onChange={e => setFormData({ ...formData, custo: e.target.value ? parseFloat(e.target.value) : undefined })}
              fullWidth
              margin="normal"
              inputProps={{ step: 0.01, min: 0 }}
            />

            {/* Exibir imagens do checklist se existirem */}
            {(checklistImages.imagemPneus || checklistImages.imagemLuzes || checklistImages.imagemFreios || checklistImages.imagemOutrasAvarias) && (
              <Box mt={3} mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  <b>Imagens do Checklist:</b>
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                  {checklistImages.imagemPneus && (
                    <Box>
                      <Typography variant="caption" display="block" gutterBottom>
                        Pneus
                      </Typography>
                      <Box
                        component="img"
                        src={construirUrlImagem(checklistImages.imagemPneus)}
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
                        onClick={() => window.open(construirUrlImagem(checklistImages.imagemPneus!), '_blank')}
                        onError={(e) => {
                          const imgElement = e.currentTarget;
                          imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="%23ddd" width="120" height="120"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="14">Erro</text></svg>';
                          imgElement.style.border = '2px solid red';
                        }}
                      />
                    </Box>
                  )}
                  {checklistImages.imagemLuzes && (
                    <Box>
                      <Typography variant="caption" display="block" gutterBottom>
                        Luzes
                      </Typography>
                      <Box
                        component="img"
                        src={construirUrlImagem(checklistImages.imagemLuzes)}
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
                        onClick={() => window.open(construirUrlImagem(checklistImages.imagemLuzes!), '_blank')}
                        onError={(e) => {
                          const imgElement = e.currentTarget;
                          imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="%23ddd" width="120" height="120"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="14">Erro</text></svg>';
                          imgElement.style.border = '2px solid red';
                        }}
                      />
                    </Box>
                  )}
                  {checklistImages.imagemFreios && (
                    <Box>
                      <Typography variant="caption" display="block" gutterBottom>
                        Freios
                      </Typography>
                      <Box
                        component="img"
                        src={construirUrlImagem(checklistImages.imagemFreios)}
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
                        onClick={() => window.open(construirUrlImagem(checklistImages.imagemFreios!), '_blank')}
                        onError={(e) => {
                          const imgElement = e.currentTarget;
                          imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="%23ddd" width="120" height="120"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="14">Erro</text></svg>';
                          imgElement.style.border = '2px solid red';
                        }}
                      />
                    </Box>
                  )}
                  {checklistImages.imagemOutrasAvarias && (
                    <Box>
                      <Typography variant="caption" display="block" gutterBottom>
                        Outras Avarias
                      </Typography>
                      <Box
                        component="img"
                        src={construirUrlImagem(checklistImages.imagemOutrasAvarias)}
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
                        onClick={() => window.open(construirUrlImagem(checklistImages.imagemOutrasAvarias!), '_blank')}
                        onError={(e) => {
                          const imgElement = e.currentTarget;
                          imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="%23ddd" width="120" height="120"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="14">Erro</text></svg>';
                          imgElement.style.border = '2px solid red';
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : (editingRequest ? 'Atualizar' : 'Criar')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        open={confirmDialogOpen}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta manutenção?"
        itemName={manutencaoToDelete ? `${manutencaoToDelete.veiculo?.placa} - ${manutencaoToDelete.tipo}` : ''}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmDialogOpen(false);
          setManutencaoToDelete(null);
        }}
        severity="error"
      />

      {/* Snackbar para mensagens */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}

export default Manutencoes;