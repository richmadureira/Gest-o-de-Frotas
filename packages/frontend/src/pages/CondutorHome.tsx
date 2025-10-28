import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Card, CardContent, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getMeuChecklistHoje } from '../services/api';

function CondutorHome() {
  const navigate = useNavigate();
  const [checklistHoje, setChecklistHoje] = useState<any>(null);
  const [loadingChecklist, setLoadingChecklist] = useState(true);

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

    carregarChecklistHoje();
  }, []);

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
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/checklist')}
                >
                  Preencher agora
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
