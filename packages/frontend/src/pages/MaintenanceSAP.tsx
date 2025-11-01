import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, LinearProgress, Grid, Card, CardContent, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Autocomplete, InputAdornment, Alert
} from '@mui/material';
import { PlayArrow, Add } from '@mui/icons-material';
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

  const metricas = {
    total: manutencoes.length,
    emProcesso: manutencoes.filter(m => m.statusSAP !== 'Finalizada').length,
    finalizadas: manutencoes.filter(m => m.statusSAP === 'Finalizada').length,
    ordensCriadas: manutencoes.filter(m => m.numeroOrdemSAP).length
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Gestão de Manutenções SAP</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenDialog}
          >
            Nova Manutenção
          </Button>
        </Box>
      </Box>

      {/* Cards de métricas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">Total</Typography>
              <Typography variant="h4">{metricas.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">Em Processo</Typography>
              <Typography variant="h4">{metricas.emProcesso}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">Finalizadas</Typography>
              <Typography variant="h4">{metricas.finalizadas}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">Ordens SAP</Typography>
              <Typography variant="h4">{metricas.ordensCriadas}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            {manutencoes.map((manutencao) => (
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
