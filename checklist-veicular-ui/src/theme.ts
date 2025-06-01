// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e88e5', // Azul intenso para a cor principal
    },
    secondary: {
      main: '#f50057', // Rosa para ações secundárias
    },
    background: {
      default: '#f4f6f8', // Cor de fundo suave
      paper: '#ffffff', // Fundo para caixas e cards
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600,
      color: '#1e88e5',
    },
    body1: {
      color: '#555555',
    },
  },
});

export default theme;
