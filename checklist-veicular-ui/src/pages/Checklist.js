import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Paper, Divider, Snackbar } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Checklist() {
  const [mileage, setMileage] = useState('');
  const [tireCondition, setTireCondition] = useState('');
  const [lights, setLights] = useState('');
  const [cleanliness, setCleanliness] = useState('');
  const [engineOil, setEngineOil] = useState('');
  const [brakes, setBrakes] = useState('');
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  const navigate = useNavigate(); // Hook para redirecionamento

  // Função de validação dos campos obrigatórios
  const validateFields = () => {
    const newErrors = {};
    if (!mileage) newErrors.mileage = "Quilometragem é obrigatória";
    if (!tireCondition) newErrors.tireCondition = "Condição dos pneus é obrigatória";
    if (!lights) newErrors.lights = "Faróis e lanternas são obrigatórios";
    if (!cleanliness) newErrors.cleanliness = "Higienização é obrigatória";
    if (!engineOil) newErrors.engineOil = "Óleo do motor é obrigatório";
    if (!brakes) newErrors.brakes = "Status dos freios é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função de envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateFields()) {
      setOpenSnackbar(true);
      setShowCheckmark(true);

      // Esconde o checkmark após 1.5 segundos e redireciona para a página de resumo após 3 segundos
      setTimeout(() => setShowCheckmark(false), 1500);
      setTimeout(() => {
        setOpenSnackbar(false);
        navigate('/summary', {
          state: { // Passa os dados do checklist para a página de resumo
            mileage,
            tireCondition,
            lights,
            cleanliness,
            engineOil,
            brakes,
          }
        });
      }, 3000);
    }
  };

  // Função para limpar o formulário
  const handleClear = () => {
    setMileage('');
    setTireCondition('');
    setLights('');
    setCleanliness('');
    setEngineOil('');
    setBrakes('');
    setErrors({});
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Checklist Diário do Veículo
      </Typography>
      <Typography variant="body1" color="textSecondary" align="center" gutterBottom>
        Preencha o checklist para garantir que o veículo está em condições seguras de uso.
      </Typography>

      {/* Ícone de Checkmark com Animação */}
      {showCheckmark && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
        >
          <CheckCircleIcon style={{ fontSize: '3rem', color: '#4caf50' }} />
        </motion.div>
      )}

      {/* Snackbar para Feedback de Sucesso */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message="Checklist enviado com sucesso!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
        
        {/* Quilometragem */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Divider textAlign="left">
            <Typography variant="h6" color="primary">
              Quilometragem
            </Typography>
          </Divider>
          <TextField
            label="Quilometragem"
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            error={!!errors.mileage}
            helperText={errors.mileage}
          />
        </Paper>

        {/* Condição dos Pneus */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Divider textAlign="left">
            <Typography variant="h6" color="primary">
              Condição dos Pneus
            </Typography>
          </Divider>
          <FormControl component="fieldset" fullWidth margin="normal" error={!!errors.tireCondition}>
            <FormLabel component="legend">Condição dos Pneus</FormLabel>
            <RadioGroup
              value={tireCondition}
              onChange={(e) => setTireCondition(e.target.value)}
              row
            >
              <FormControlLabel value="Bom" control={<Radio />} label="Bom" />
              <FormControlLabel value="Regular" control={<Radio />} label="Regular" />
              <FormControlLabel value="Ruim" control={<Radio />} label="Ruim" />
            </RadioGroup>
            {errors.tireCondition && <Typography color="error">{errors.tireCondition}</Typography>}
          </FormControl>
        </Paper>

        {/* Faróis e Lanternas */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Divider textAlign="left">
            <Typography variant="h6" color="primary">
              Faróis e Lanternas
            </Typography>
          </Divider>
          <FormControl component="fieldset" fullWidth margin="normal" error={!!errors.lights}>
            <FormLabel component="legend">Faróis e Lanternas</FormLabel>
            <RadioGroup
              value={lights}
              onChange={(e) => setLights(e.target.value)}
              row
            >
              <FormControlLabel value="Funcionando" control={<Radio />} label="Funcionando" />
              <FormControlLabel value="Com Defeito" control={<Radio />} label="Com Defeito" />
            </RadioGroup>
            {errors.lights && <Typography color="error">{errors.lights}</Typography>}
          </FormControl>
        </Paper>

        {/* Higienização */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Divider textAlign="left">
            <Typography variant="h6" color="primary">
              Higienização
            </Typography>
          </Divider>
          <FormControl component="fieldset" fullWidth margin="normal" error={!!errors.cleanliness}>
            <FormLabel component="legend">Higienização</FormLabel>
            <RadioGroup
              value={cleanliness}
              onChange={(e) => setCleanliness(e.target.value)}
              row
            >
              <FormControlLabel value="Limpo" control={<Radio />} label="Limpo" />
              <FormControlLabel value="Sujo" control={<Radio />} label="Sujo" />
            </RadioGroup>
            {errors.cleanliness && <Typography color="error">{errors.cleanliness}</Typography>}
          </FormControl>
        </Paper>

        {/* Óleo do Motor */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Divider textAlign="left">
            <Typography variant="h6" color="primary">
              Óleo do Motor
            </Typography>
          </Divider>
          <FormControl component="fieldset" fullWidth margin="normal" error={!!errors.engineOil}>
            <FormLabel component="legend">Óleo do Motor</FormLabel>
            <RadioGroup
              value={engineOil}
              onChange={(e) => setEngineOil(e.target.value)}
              row
            >
              <FormControlLabel value="Nível Adequado" control={<Radio />} label="Nível Adequado" />
              <FormControlLabel value="Necessita Completar" control={<Radio />} label="Necessita Completar" />
            </RadioGroup>
            {errors.engineOil && <Typography color="error">{errors.engineOil}</Typography>}
          </FormControl>
        </Paper>

        {/* Freios */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Divider textAlign="left">
            <Typography variant="h6" color="primary">
              Freios
            </Typography>
          </Divider>
          <FormControl component="fieldset" fullWidth margin="normal" error={!!errors.brakes}>
            <FormLabel component="legend">Freios</FormLabel>
            <RadioGroup
              value={brakes}
              onChange={(e) => setBrakes(e.target.value)}
              row
            >
              <FormControlLabel value="Funcionando" control={<Radio />} label="Funcionando" />
              <FormControlLabel value="Com Defeito" control={<Radio />} label="Com Defeito" />
            </RadioGroup>
            {errors.brakes && <Typography color="error">{errors.brakes}</Typography>}
          </FormControl>
        </Paper>

        {/* Botões de Ação */}
        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button variant="outlined" color="secondary" onClick={handleClear}>
            Limpar
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Enviar Checklist
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Checklist;
