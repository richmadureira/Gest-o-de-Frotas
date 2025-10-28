import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Card, CardContent, CircularProgress, Autocomplete, TextField, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getMeuChecklistHoje, getVeiculos, validarPlacaHoje } from '../services/api';

function CondutorHome() {
  const navigate = useNavigate();
  const [checklistHoje, setChecklistHoje] = useState<any>(null);
  const [loadingChecklist, setLoadingChecklist] = useState(true);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<any>(null);
  const [loadingVeiculos, setLoadingVeiculos] = useState(false);
  const [validando, setValidando] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [motivoBloqueio, setMotivoBloqueio] = useState('');

  useEffect(() => {
    const carregarChecklistHoje = async () => {
      try {
        setLoadingChecklist(true);
        const resultado = await getMeuChecklistHoje();
        setChecklistHoje(resultado);
      } catch (err) {
        console.error('Erro ao carregar checklist:', err);
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

    carregarChecklistHoje();
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

  return (
    <Container maxWidth="sm" sx={{ mt: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)' }}>
      {loadingChecklist ? (
        <CircularProgress />
      ) : (
        <>
          {/* Card quando checklist não foi enviado */}
          {!checklistHoje?.enviado && (
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Checklist de Hoje
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Status: Pendente
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
                  sx={{ mt: 2, mb: 2 }}
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
                  {validando ? 'Validando...' : 'Preencher agora'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Card quando checklist já foi enviado */}
          {checklistHoje?.enviado && checklistHoje?.checklist && (
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Checklist de Hoje
                </Typography>
                <Typography color="success.main" gutterBottom fontWeight="bold">
                  Status: Enviado
                </Typography>
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Veículo: {checklistHoje.checklist.veiculo?.placa || checklistHoje.checklist.placaVeiculo}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    KM: {checklistHoje.checklist.kmVeiculo}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Enviado em: {new Date(checklistHoje.checklist.data).toLocaleString('pt-BR')}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/checklist')}
                >
                  Ver checklist enviado
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}

export default CondutorHome;
