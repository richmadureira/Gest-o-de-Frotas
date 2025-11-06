import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, LinearProgress, Grid, Card, CardContent, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Autocomplete, InputAdornment, Alert,
  TablePagination
} from '@mui/material';
import { PlayArrow, Add, FilterList, Build, Assignment, CheckCircle, HourglassEmpty, Description } from '@mui/icons-material';
import { getManutencoes, simularProximoStatusManutencao, createManutencao, getVeiculos, getVeiculo } from '../services/api';

interface ManutencaoSAP {
  id: string;
  veiculo: { placa: string; modelo: string; marca: string };
  tipo: string;
  descricao: string;
  statusSAP: string;
  progresso: number;
  numeroOrdemSAP?: string;
  fornecedorSAP?: string;
  custo?: number;
}

const MaintenanceSAP = () => {
  const [manutencoes, setManutencoes] = useState<ManutencaoSAP[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loadingVeiculos, setLoadingVeiculos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [formData, setFormData] = useState({
    veiculoId: '',
    tipo: '',
    prioridade: 'Media',
    quilometragemNoAto: '',
    descricao: '',
    custo: ''
  });
  
  // Estados de filtros
  const [filtroVeiculoId, setFiltroVeiculoId] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroprioridade, setFiltroPrioridade] = useState('');
  const [filtroStatusSAP, setFiltroStatusSAP] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  
  // Estados de paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    carregarManutencoes();
    carregarVeiculos();
  }, []);

  const carregarManutencoes = async () => {
    try {
      setLoading(true);
      const data = await getManutencoes();
      setManutencoes(data);
    } catch (error) {
      console.error('Erro ao carregar manutenções:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarVeiculos = async () => {
    try {
      setLoadingVeiculos(true);
      const data = await getVeiculos();
      setVeiculos(data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    } finally {
      setLoadingVeiculos(false);
    }
  };

  const handleSimularProximoStatus = async (id: string) => {
    try {
      await simularProximoStatusManutencao(id);
      // Recarregar dados após simulação
      await carregarManutencoes();
    } catch (error: any) {
      console.error('Erro ao simular status:', error);
      alert(error.response?.data?.message || 'Erro ao simular próximo status');
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setErro('');
    setFormData({
      veiculoId: '',
      tipo: '',
      prioridade: 'Media',
      quilometragemNoAto: '',
      descricao: '',
      custo: ''
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setErro('');
  };

  const handleSalvarManutencao = async () => {
    // Validações
    if (!formData.veiculoId || !formData.tipo || !formData.prioridade || !formData.descricao || formData.quilometragemNoAto === '') {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setSalvando(true);
      setErro('');

      // Preparar payload simplificado
      const payload = {
        veiculoId: formData.veiculoId,
        tipo: formData.tipo,
        prioridade: formData.prioridade,
        quilometragemNoAto: formData.quilometragemNoAto ? parseInt(formData.quilometragemNoAto, 10) : undefined,
        descricao: formData.descricao,
        custo: formData.custo ? parseFloat(formData.custo) : undefined
      };
      
      await createManutencao(payload);

      await carregarManutencoes();
      handleCloseDialog();

      alert('Manutenção SAP criada com sucesso! Status: Solicitada');
    } catch (error: any) {
      console.error('Erro ao salvar manutenção:', error);
      setErro(error.response?.data?.message || 'Erro ao salvar manutenção');
    } finally {
      setSalvando(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      Solicitada: 'default',
      Aprovada: 'info',
      EnviadaSAP: 'primary',
      ProcessandoSAP: 'primary',
      OrdemCriada: 'warning',
      EmExecucao: 'warning',
      Finalizada: 'success'
    };
    return colors[status] || 'default';
  };

  const getStatusProgress = (status: string) => {
    const map: Record<string, number> = {
      Solicitada: 0,
      Aprovada: 10,
      EnviadaSAP: 25,
      ProcessandoSAP: 50,
      OrdemCriada: 70,
      EmExecucao: 85,
      Finalizada: 100
    };
    return map[status] ?? 0;
  };

  const handleLimparFiltros = () => {
    setFiltroVeiculoId('');
    setFiltroTipo('');
    setFiltroPrioridade('');
    setFiltroStatusSAP('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setPage(0);
  };

  // Aplicar filtros localmente
  const filteredManutencoes = manutencoes.filter((m: any) => {
    const matchesVeiculo = !filtroVeiculoId || m.veiculo?.placa?.includes(filtroVeiculoId);
    const matchesTipo = !filtroTipo || m.tipo === filtroTipo;
    const matchesPrioridade = !filtroprioridade || m.prioridade === filtroprioridade;
    const matchesStatus = !filtroStatusSAP || m.statusSAP === filtroStatusSAP;
    
    // Filtros de data (assumindo que existe criadoEm)
    let matchesDataInicio = true;
    let matchesDataFim = true;
    if (m.criadoEm) {
      const dataCriacao = new Date(m.criadoEm).toISOString().split('T')[0];
      if (filtroDataInicio) {
        matchesDataInicio = dataCriacao >= filtroDataInicio;
      }
      if (filtroDataFim) {
        matchesDataFim = dataCriacao <= filtroDataFim;
      }
    }
    
    return matchesVeiculo && matchesTipo && matchesPrioridade && matchesStatus && matchesDataInicio && matchesDataFim;
  });

  const metricas = {
    total: manutencoes.length,
    emProcesso: manutencoes.filter(m => m.statusSAP !== 'Finalizada').length,
    finalizadas: manutencoes.filter(m => m.statusSAP === 'Finalizada').length,
    ordensCriadas: manutencoes.filter(m => m.numeroOrdemSAP).length
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mt={4}>
        <Typography variant="h4" fontWeight="bold">
          <Build sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestão de Manutenções SAP
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Nova Manutenção
        </Button>
      </Box>

      {/* Cards de métricas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
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
                  <Typography variant="body2" color="textSecondary">Em Processo</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.emProcesso}</Typography>
                </Box>
                <HourglassEmpty sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Finalizadas</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.finalizadas}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e1f5fe', borderLeft: '4px solid #2196f3' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="textSecondary">Ordens SAP</Typography>
                  <Typography variant="h4" fontWeight="bold">{metricas.ordensCriadas}</Typography>
                </Box>
                <Description sx={{ fontSize: 40, color: '#2196f3' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Paper de Filtros */}
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
                <Autocomplete
                  options={veiculos}
                  getOptionLabel={(option) => `${option.placa} - ${option.modelo}`}
                  onChange={(e, value) => setFiltroVeiculoId(value?.placa || '')}
                  renderInput={(params) => (
                    <TextField {...params} label="Veículo" size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filtroTipo}
                    label="Tipo"
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Preventiva">Preventiva</MenuItem>
                    <MenuItem value="Corretiva">Corretiva</MenuItem>
                    <MenuItem value="Emergencia">Emergência</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Prioridade</InputLabel>
                  <Select
                    value={filtroprioridade}
                    label="Prioridade"
                    onChange={(e) => setFiltroPrioridade(e.target.value)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="Baixa">Baixa</MenuItem>
                    <MenuItem value="Media">Média</MenuItem>
                    <MenuItem value="Alta">Alta</MenuItem>
                    <MenuItem value="Urgente">Urgente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status SAP</InputLabel>
                  <Select
                    value={filtroStatusSAP}
                    label="Status SAP"
                    onChange={(e) => setFiltroStatusSAP(e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Solicitada">Solicitada</MenuItem>
                    <MenuItem value="Aprovada">Aprovada</MenuItem>
                    <MenuItem value="EnviadaSAP">Enviada SAP</MenuItem>
                    <MenuItem value="ProcessandoSAP">Processando SAP</MenuItem>
                    <MenuItem value="OrdemCriada">Ordem Criada</MenuItem>
                    <MenuItem value="EmExecucao">Em Execução</MenuItem>
                    <MenuItem value="Finalizada">Finalizada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Data Início"
                  type="date"
                  size="small"
                  fullWidth
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Data Fim"
                  type="date"
                  size="small"
                  fullWidth
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Box display="flex" gap={2} mt={2}>
              <Button variant="contained" color="primary" onClick={() => setPage(0)}>
                Filtrar
              </Button>
              <Button variant="outlined" onClick={handleLimparFiltros}>
                Limpar
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Tabela de manutenções */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Veículo</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Status SAP</TableCell>
              <TableCell>Progresso</TableCell>
              <TableCell>Ordem SAP</TableCell>
              <TableCell>Fornecedor</TableCell>
              <TableCell>Custo</TableCell>
              <TableCell align="center">Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredManutencoes
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((manutencao) => (
              <TableRow key={manutencao.id}>
                <TableCell>{manutencao.veiculo.placa} - {manutencao.veiculo.modelo}</TableCell>
                <TableCell>{manutencao.tipo}</TableCell>
                <TableCell>{manutencao.descricao}</TableCell>
                <TableCell>
                  <Chip
                    label={manutencao.statusSAP}
                    color={getStatusColor(manutencao.statusSAP)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={getStatusProgress(manutencao.statusSAP)}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2">{getStatusProgress(manutencao.statusSAP)}%</Typography>
                  </Box>
                </TableCell>
                <TableCell>{manutencao.numeroOrdemSAP || '-'}</TableCell>
                <TableCell>{manutencao.fornecedorSAP || '-'}</TableCell>
                <TableCell>
                  {manutencao.custo ? `R$ ${manutencao.custo.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Simular Próximo Status">
                    <IconButton
                      color="primary"
                      onClick={() => handleSimularProximoStatus(manutencao.id)}
                      disabled={manutencao.statusSAP === 'Finalizada'}
                      size="small"
                    >
                      <PlayArrow />
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
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredManutencoes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      {/* Dialog para criar nova manutenção */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Manutenção SAP</DialogTitle>
        <DialogContent>
          {erro && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erro}
            </Alert>
          )}

          <Autocomplete
            options={veiculos}
            getOptionLabel={(option) => `${option.placa} - ${option.modelo}`}
            loading={loadingVeiculos}
            onChange={async (e, value) => {
              const veiculoId = value?.id || '';
              if (veiculoId) {
                try {
                  const v = await getVeiculo(veiculoId);
                  setFormData({
                    ...formData,
                    veiculoId,
                    quilometragemNoAto: (v?.quilometragem ?? '').toString()
                  });
                } catch (err) {
                  setFormData({ ...formData, veiculoId, quilometragemNoAto: '' });
                }
              } else {
                setFormData({ ...formData, veiculoId: '', quilometragemNoAto: '' });
              }
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Veículo *" 
                margin="normal" 
                fullWidth 
              />
            )}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo *</InputLabel>
            <Select
              value={formData.tipo}
              label="Tipo *"
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            >
              <MenuItem value="Preventiva">Preventiva</MenuItem>
              <MenuItem value="Corretiva">Corretiva</MenuItem>
              <MenuItem value="Emergencia">Emergência</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Prioridade *</InputLabel>
            <Select
              value={formData.prioridade}
              label="Prioridade *"
              onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
            >
              <MenuItem value="Baixa">Baixa</MenuItem>
              <MenuItem value="Media">Média</MenuItem>
              <MenuItem value="Alta">Alta</MenuItem>
              <MenuItem value="Urgente">Urgente</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Descrição *"
            multiline
            rows={3}
            fullWidth
            margin="normal"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            disabled={!formData.veiculoId}
            inputProps={{ maxLength: 200 }}
          />

          <TextField
            label="Custo Estimado"
            type="number"
            fullWidth
            margin="normal"
            value={formData.custo}
            onChange={(e) => setFormData({ ...formData, custo: e.target.value })}
            InputProps={{ 
              startAdornment: <InputAdornment position="start">R$</InputAdornment> 
            }}
            disabled={!formData.veiculoId}
          />

          <TextField
            label="Quilometragem Atual *"
            type="number"
            fullWidth
            margin="normal"
            value={formData.quilometragemNoAto}
            InputProps={{ readOnly: true }}
            disabled
            helperText="Obtido automaticamente do cadastro do veículo"
          />

          <Alert severity="info" sx={{ mb: 2 }}>
            Esta solicitação será enviada ao SAP (Status inicial: Solicitada).
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={salvando}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSalvarManutencao}
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MaintenanceSAP;
