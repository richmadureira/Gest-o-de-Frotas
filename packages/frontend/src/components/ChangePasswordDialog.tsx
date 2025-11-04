import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  InputAdornment,
  IconButton,
  Typography
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { changePassword } from '../services/api';
import { useAuth } from './AuthContext';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose?: () => void;
  obrigatorio?: boolean;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ 
  open, 
  onClose, 
  obrigatorio = false 
}) => {
  const { updatePrimeiroLogin } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    if (!obrigatorio && onClose) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setError('');
    setShowSenhaAtual(false);
    setShowNovaSenha(false);
    setShowConfirmarSenha(false);
  };

  const validateForm = (): boolean => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setError('Todos os campos são obrigatórios');
      return false;
    }

    if (novaSenha.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres');
      return false;
    }

    if (novaSenha === senhaAtual) {
      setError('A nova senha deve ser diferente da senha atual');
      return false;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await changePassword(senhaAtual, novaSenha);
      
      // Atualizar token no localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      // Atualizar primeiroLogin
      updatePrimeiroLogin(false);

      // Fechar dialog
      if (onClose) {
        onClose();
      }
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={obrigatorio}
    >
      <DialogTitle>
        {obrigatorio ? 'Troca de Senha Obrigatória' : 'Trocar Senha'}
      </DialogTitle>
      <DialogContent>
        {obrigatorio && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Por segurança, você precisa trocar sua senha no primeiro acesso.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            label="Senha Atual"
            type={showSenhaAtual ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                    edge="end"
                  >
                    {showSenhaAtual ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Nova Senha"
            type={showNovaSenha ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
            helperText="Mínimo de 6 caracteres"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNovaSenha(!showNovaSenha)}
                    edge="end"
                  >
                    {showNovaSenha ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirmar Nova Senha"
            type={showConfirmarSenha ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                    edge="end"
                  >
                    {showConfirmarSenha ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        {!obrigatorio && (
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Alterando...' : 'Alterar Senha'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;

