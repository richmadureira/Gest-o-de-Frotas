import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

interface CnhAlertProps {
  cnhVencida: boolean;
  cnhVenceEm: number | null | undefined;
}

const CnhAlert: React.FC<CnhAlertProps> = ({ cnhVencida, cnhVenceEm }) => {
  // Não mostrar nada se não houver problema com CNH
  if (!cnhVencida && (cnhVenceEm === null || cnhVenceEm === undefined || cnhVenceEm > 30)) {
    return null;
  }

  // CNH Vencida (crítico)
  if (cnhVencida) {
    return (
      <Box sx={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 1200, p: 2 }}>
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          sx={{ 
            boxShadow: 3,
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>CNH Vencida!</AlertTitle>
          Sua CNH está vencida há {Math.abs(cnhVenceEm || 0)} dia(s). Entre em contato com o gestor para regularizar sua situação.
        </Alert>
      </Box>
    );
  }

  // CNH vencendo em breve (aviso)
  if (cnhVenceEm !== null && cnhVenceEm !== undefined && cnhVenceEm <= 30) {
    const severity = cnhVenceEm <= 7 ? 'warning' : 'info';
    
    return (
      <Box sx={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 1200, p: 2 }}>
        <Alert 
          severity={severity}
          icon={<WarningIcon />}
          sx={{ 
            boxShadow: 3,
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>
            {cnhVenceEm <= 7 ? 'CNH Vencendo em Breve!' : 'Atenção: CNH Próxima do Vencimento'}
          </AlertTitle>
          Sua CNH vence em {cnhVenceEm} dia(s). Providencie a renovação o quanto antes para evitar problemas.
        </Alert>
      </Box>
    );
  }

  return null;
};

export default CnhAlert;

