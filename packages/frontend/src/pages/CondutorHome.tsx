import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Card, CardContent, CircularProgress, Autocomplete, TextField, Alert, Chip, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { getMeuChecklistHoje, getVeiculos, validarPlacaHoje } from '../services/api';

function CondutorHome() {
  const navigate = useNavigate();
  const [checklistsHoje, setChecklistsHoje] = useState<any[]>([]);
  const [loadingChecklist, setLoadingChecklist] = useState(true);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<any>(null);
  const [loadingVeiculos, setLoadingVeiculos] = useState(false);
  const [validando, setValidando] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [motivoBloqueio, setMotivoBloqueio] = useState('');

  useEffect(() => {
    const carregarChecklistsHoje = async () => {
      try {
        setLoadingChecklist(true);
        const resultado = await getMeuChecklistHoje();
        setChecklistsHoje(resultado.checklists || []);
      } catch (err) {
        console.error('Erro ao carregar checklists:', err);
      } finally {
        setLoadingChecklist(false);
      }
    };

    const carregarVeiculos = async () => {
      try {
        setLoadingVeiculos(true);
        const data = await getVeiculos({ status: 'Disponivel' });
        setVeiculos(data);
      } catch (err) {
        console.error('Erro ao carregar veículos:', err);
      } finally {
        setLoadingVeiculos(false);
      }
    };

    carregarChecklistsHoje();
    carregarVeiculos();
  }, []);

  const handleVeiculoChange = async (veiculo: any) => {
    setVeiculoSelecionado(veiculo);
    setBloqueado(false);
    setMotivoBloqueio('');
    
    if (veiculo) {
      try {
        setValidando(true);
        const resultado = await validarPlacaHoje(veiculo.id);
        
        if (resultado.existe) {
          setBloqueado(true);
          setMotivoBloqueio(resultado.motivo);
        }
      } catch (err) {
        console.error('Erro ao validar placa:', err);
      } finally {
        setValidando(false);
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      {loadingChecklist ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* Card para iniciar novo checklist */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Iniciar Novo Checklist
              </Typography>
              
              {/* Campo de seleção de veículo */}
              <Autocomplete
                options={veiculos}
                getOptionLabel={(option) => `${option.placa} - ${option.modelo}`}
                value={veiculoSelecionado}
                onChange={(event, newValue) => handleVeiculoChange(newValue)}
                loading={loadingVeiculos}
                disabled={loadingVeiculos || validando}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Selecione o veículo *"
                    margin="normal"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {(loadingVeiculos || validando) ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                sx={{ mt: 1, mb: 2 }}
              />
              
              {/* Alert de bloqueio */}
              {bloqueado && motivoBloqueio && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {motivoBloqueio}
                </Alert>
              )}
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={!veiculoSelecionado || bloqueado || validando}
                onClick={() => navigate('/checklist', { state: { veiculoId: veiculoSelecionado.id } })}
              >
                {validando ? 'Validando...' : 'Preencher Checklist'}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de checklists enviados hoje */}
          {checklistsHoje.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Checklists Enviados Hoje ({checklistsHoje.length})
              </Typography>
              <Grid container spacing={2}>
                {checklistsHoje.map((checklist) => (
                  <Grid item xs={12} sm={6} key={checklist.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                          <Typography variant="h6" component="div">
                            {checklist.veiculo?.placa || checklist.placaVeiculo}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {checklist.veiculo?.modelo} - {checklist.veiculo?.marca}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          KM: {checklist.kmVeiculo}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Enviado às {formatTime(checklist.data)}
                        </Typography>
                        
                        {/* Status dos itens */}
                        <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {!checklist.pneus && <Chip label="Pneus" color="error" size="small" />}
                          {!checklist.luzes && <Chip label="Luzes" color="error" size="small" />}
                          {!checklist.freios && <Chip label="Freios" color="error" size="small" />}
                          {!checklist.limpeza && <Chip label="Limpeza" color="error" size="small" />}
                          {checklist.pneus && checklist.luzes && checklist.freios && checklist.limpeza && (
                            <Chip label="Tudo OK" color="success" size="small" />
                          )}
                        </Box>
                        
                        <Button
                          variant="outlined"
                          color="primary"
                          fullWidth
                          startIcon={<VisibilityIcon />}
                          onClick={() => navigate('/checklist', { state: { veiculoId: checklist.veiculoId, readonly: true } })}
                        >
                          Visualizar
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}

export default CondutorHome;
