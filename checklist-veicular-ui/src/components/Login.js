import React, { useState } from 'react';
import {
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  Paper,
  Avatar,
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import logo from "../image/logo.png";

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (username === 'admin' && password === '1234') {
        setError('');
        onLogin();
        setRedirectToDashboard(true);
      } else {
        setError('Usuário ou senha incorretos');
      }
      setLoading(false);
    }, 1000);
  };

  if (redirectToDashboard) {
    return <Navigate to="/" />;
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ backgroundColor: '#f4f6f8' }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: '2rem',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          borderRadius: '12px',
        }}
      >
        {/* Logo centralizada */}
        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
          <Avatar
            src={logo}
            alt="Logo"
            sx={{
              width: 80,
              height: 80,
            }}
          />
        </Box>

        <Typography variant="h4" component="h2" gutterBottom>
          Bem-vindo
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Faça login para acessar sua conta
        </Typography>

        {/* Mensagem de Erro */}
        {error && (
          <Typography color="error" sx={{ marginTop: '1rem' }}>
            {error}
          </Typography>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} style={{ marginTop: '1.5rem' }}>
          <TextField
            label="Usuário"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Senha"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              marginTop: '1rem',
              padding: '0.75rem',
              fontWeight: 'bold',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#115293',
              },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default Login;
