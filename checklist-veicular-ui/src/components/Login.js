// src/components/Login.js
import React, { useState } from 'react';
import { TextField, Button, CircularProgress, Box, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';

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
      maxWidth="400px"
      margin="auto"
      padding="2rem"
      display="flex"
      flexDirection="column"
      alignItems="center"
      boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
      borderRadius="8px"
    >
      <Typography variant="h4" component="h2" gutterBottom>
        Login
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleLogin} style={{ width: '100%', marginTop: '1rem' }}>
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
          style={{ marginTop: '1rem' }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
        </Button>
      </form>
    </Box>
  );
}

export default Login;
