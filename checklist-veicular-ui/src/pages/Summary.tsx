import React from 'react';
import { Container, Box, Typography, Button, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

function Summary() {
  const navigate = useNavigate();
  const { state } = useLocation(); // Recebe os dados enviados do checklist

  const handleNewResponse = () => {
    navigate('/checklist'); // Redireciona para o formulário para enviar outra resposta
  };

  // Função para redirecionar para o menu principal
  const handleBackToMenu = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem', textAlign: 'center' }}>
      <Box display="flex" justifyContent="flex-end">
        <IconButton color="primary" onClick={handleBackToMenu}>
          <HomeIcon />
        </IconButton>
      </Box>
      <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h5" gutterBottom>
          Checklist Diário do Veículo
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Sua resposta foi registrada.
        </Typography>

        {/* Resumo dos dados preenchidos */}
        <Box sx={{ mt: 2, textAlign: 'left' }}>
          <Typography variant="subtitle1"><strong>Resumo do Checklist</strong></Typography>
          <Typography><strong>Quilometragem:</strong> {state?.mileage}</Typography>
          <Typography><strong>Condição dos Pneus:</strong> {state?.tireCondition}</Typography>
          <Typography><strong>Faróis e Lanternas:</strong> {state?.lights}</Typography>
          <Typography><strong>Higienização:</strong> {state?.cleanliness}</Typography>
          <Typography><strong>Óleo do Motor:</strong> {state?.engineOil}</Typography>
          <Typography><strong>Freios:</strong> {state?.brakes}</Typography>
        </Box>

        {/* Botão para enviar outra resposta */}
        <Button variant="outlined" color="primary" onClick={handleNewResponse} sx={{ mt: 3 }}>
          Enviar outra resposta
        </Button>
      </Box>
    </Container>
  );
}

export default Summary;
