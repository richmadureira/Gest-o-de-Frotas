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
import { UserRole } from './AuthContext';

interface LoginProps {
  onLogin: (token: string, role: UserRole) => void;
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (username && password) {
        setError('');
        onLogin('fake-token', role);
        setRedirectToDashboard(true);
      } else {
        setError('Preencha usuário e senha');
      }
      setLoading(false);
    }, 500);
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
          <select value={role || ''} onChange={e => setRole(e.target.value as UserRole)} style={{ margin: '10px 0', width: '100%' }}>
            <option value="admin">Administrador</option>
            <option value="gestor">Gestor de Frota</option>
            <option value="condutor">Condutor</option>
          </select>
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
