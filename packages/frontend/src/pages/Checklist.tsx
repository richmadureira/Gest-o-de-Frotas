import React, { useState, useRef } from 'react';
import { Container, Box, Typography, TextField, Button, Snackbar, Paper, Divider, IconButton, AppBar, Toolbar } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FormSection from './components/FormSection'; // Importe o componente reutilizável

type ChecklistErrors = {
  mileage?: string;
  tireCondition?: string;
  lights?: string;
  cleanliness?: string;
  engineOil?: string;
  brakes?: string;
};

function Checklist() {
  const [mileage, setMileage] = useState('');
  const [tireCondition, setTireCondition] = useState('');
  const [lights, setLights] = useState('');
  const [cleanliness, setCleanliness] = useState('');
  const [engineOil, setEngineOil] = useState('');
  const [brakes, setBrakes] = useState('');
  const [tireConditionDesc, setTireConditionDesc] = useState('');
  const [lightsDesc, setLightsDesc] = useState('');
  const [cleanlinessDesc, setCleanlinessDesc] = useState('');
  const [engineOilDesc, setEngineOilDesc] = useState('');
  const [brakesDesc, setBrakesDesc] = useState('');
  const [brakesImage, setBrakesImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<ChecklistErrors>({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const mileageRef = useRef<HTMLInputElement>(null);
  const tireConditionRef = useRef<HTMLInputElement>(null);
  const lightsRef = useRef<HTMLInputElement>(null);
  const cleanlinessRef = useRef<HTMLInputElement>(null);
  const engineOilRef = useRef<HTMLInputElement>(null);
  const brakesRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate(); // Hook para redirecionamento

  // Função de validação dos campos obrigatórios
  const validateFields = () => {
    const newErrors: ChecklistErrors = {};
    if (!mileage) {
      newErrors.mileage = "Quilometragem é obrigatória";
      if (mileageRef.current) {
        mileageRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (Number(mileage) < 0) {
      newErrors.mileage = "Quilometragem não pode ser negativa";
      if (mileageRef.current) {
        mileageRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (!tireCondition) {
      newErrors.tireCondition = "Condição dos pneus é obrigatória";
      if (tireConditionRef.current) {
        tireConditionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (!lights) {
      newErrors.lights = "Faróis e lanternas são obrigatórios";
      if (lightsRef.current) {
        lightsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (!cleanliness) {
      newErrors.cleanliness = "Higienização é obrigatória";
      if (cleanlinessRef.current) {
        cleanlinessRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (!engineOil) {
      newErrors.engineOil = "Óleo do motor é obrigatório";
      if (engineOilRef.current) {
        engineOilRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (!brakes) {
      newErrors.brakes = "Status dos freios é obrigatório";
      if (brakesRef.current) {
        brakesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função de envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
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
            tireConditionDesc,
            lightsDesc,
            cleanlinessDesc,
            engineOilDesc,
            brakesDesc,
            brakesImage,
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
    setTireConditionDesc('');
    setLightsDesc('');
    setCleanlinessDesc('');
    setEngineOilDesc('');
    setBrakesDesc('');
    setBrakesImage(null);
    setErrors({});
  };

  // Função para redirecionar para o menu principal
  const handleBackToMenu = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>

      {/* Barra Superior */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Checklist Diário do Veículo
          </Typography>
        </Toolbar>
      </AppBar>
      
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
        <Paper elevation={3} sx={{ p: 3, mb: 2 }} ref={mileageRef}>
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
            onChange={(e) => {
              const value = e.target.value;
              if (Number(value) >= 0) {
                setMileage(value);
              }
            }}
            error={!!errors['mileage']}
            helperText={errors['mileage']}
          />
        </Paper>

        {/* Condição dos Pneus */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }} ref={tireConditionRef}>
          <FormSection
            title="Condição dos Pneus"
            value={tireCondition}
            onChange={(e) => setTireCondition(e.target.value)}
            error={errors['tireCondition']}
            options={[
              { value: 'Bom', label: 'Bom' },
              { value: 'Regular', label: 'Regular' },
              { value: 'Ruim', label: 'Ruim' },
            ]}
            description={{ condition: 'Ruim' }}
            descriptionValue={tireConditionDesc}
            onDescriptionChange={(e) => setTireConditionDesc(e.target.value)}
          />
        </Paper>

        {/* Faróis e Lanternas */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }} ref={lightsRef}>
          <FormSection
            title="Faróis e Lanternas"
            value={lights}
            onChange={(e) => setLights(e.target.value)}
            error={errors['lights']}
            options={[
              { value: 'Funcionando', label: 'Funcionando' },
              { value: 'Com Defeito', label: 'Com Defeito' },
            ]}
            description={{ condition: 'Com Defeito' }}
            descriptionValue={lightsDesc}
            onDescriptionChange={(e) => setLightsDesc(e.target.value)}
          />
        </Paper>

        {/* Higienização */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }} ref={cleanlinessRef}>
          <FormSection
            title="Higienização"
            value={cleanliness}
            onChange={(e) => setCleanliness(e.target.value)}
            error={errors['cleanliness']}
            options={[
              { value: 'Limpo', label: 'Limpo' },
              { value: 'Sujo', label: 'Sujo' },
            ]}
            description={{ condition: 'Sujo' }}
            descriptionValue={cleanlinessDesc}
            onDescriptionChange={(e) => setCleanlinessDesc(e.target.value)}
          />
        </Paper>

        {/* Óleo do Motor */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }} ref={engineOilRef}>
          <FormSection
            title="Óleo do Motor"
            value={engineOil}
            onChange={(e) => setEngineOil(e.target.value)}
            error={errors['engineOil']}
            options={[
              { value: 'Nível Adequado', label: 'Nível Adequado' },
              { value: 'Necessita Completar', label: 'Necessita Completar' },
            ]}
          />
        </Paper>

        {/* Freios */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }} ref={brakesRef}>
          <FormSection
            title="Freios"
            value={brakes}
            onChange={(e) => setBrakes(e.target.value)}
            error={errors['brakes']}
            options={[
              { value: 'Funcionando', label: 'Funcionando' },
              { value: 'Com Defeito', label: 'Com Defeito' },
            ]}
          />
        </Paper>

        {/* Avarias */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }} ref={brakesRef}>
          <FormSection
            title="Avarias"
            value={brakes}
            onChange={(e) => setBrakes(e.target.value)}
            error={errors['brakes']}
            options={[
              { value: 'Sim', label: 'Sim' },
              { value: 'Não', label: 'Não' },
            ]}
            description={{ condition: 'Sim' }}
            descriptionValue={brakesDesc}
            onDescriptionChange={(e) => setBrakesDesc(e.target.value)}
            image={brakesImage}
            onImageChange={e => setBrakesImage(e.target.files ? e.target.files[0] : null)}
          />
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
