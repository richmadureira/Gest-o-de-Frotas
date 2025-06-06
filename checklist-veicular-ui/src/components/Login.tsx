import React, { useState } from 'react';
import {
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Link,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import logo from "../image/logo.png";
import { UserRole } from './AuthContext';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface LoginProps {
  onLogin: (email: string, password: string, role: UserRole) => void;
}

const validateEmail = (email: string) => {
  // Regex simples para validação de e-mail
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole | ''>('');

  const isEmailValid = validateEmail(email);
  const isPasswordValid = password.length > 0;
  const isFormValid = isEmailValid && isPasswordValid && !!role;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      if (email && password && role !== '') {
        onLogin(email, password, role as UserRole);
      } else {
        setError('Preencha todos os campos corretamente');
      }
    }, 1000);
  };

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
          <img src={logo} alt="Logo" style={{ width: 64, height: 64 }} />
        </Box>

        <Typography variant="h4" component="h2" gutterBottom>
          Bem-vindo
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Faça login para acessar sua conta
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="E-mail"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!email && !isEmailValid}
            helperText={!!email && !isEmailValid ? 'Digite um e-mail válido' : ' '}
            required
            autoComplete="email"
          />
          <TextField
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="mostrar ou ocultar senha"
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="role-label">Perfil</InputLabel>
            <Select
              labelId="role-label"
              value={role}
              label="Perfil"
              onChange={e => setRole((e.target.value ?? '') as UserRole)}
            >
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="gestor">Gestor de Frota</MenuItem>
              <MenuItem value="condutor">Condutor</MenuItem>
            </Select>
          </FormControl>
          {/* Link Esqueci minha senha */}
          <Box display="flex" justifyContent="flex-end" mb={1}>
            <Link component={RouterLink} to="/forgot-password" underline="hover" color="primary" fontSize={14}>
              Esqueci minha senha
            </Link>
          </Box>
          {/* Mensagem de erro */}
          {error && (
            <Typography color="error" sx={{ marginTop: '0.5rem', fontSize: 14 }}>
              {error}
            </Typography>
          )}
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
            disabled={!isFormValid || loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>
        </form>
        {/* Rodapé dentro da Paper box */}
        <Box
          sx={{
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center',
            fontSize: 13,
            color: '#888'
          }}
        >
          v1.0.0 &nbsp;|&nbsp; © 2025 TransLog. Todos os direitos reservados.
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
