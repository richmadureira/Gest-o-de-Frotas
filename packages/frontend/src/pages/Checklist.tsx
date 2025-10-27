import React, { useState, useRef, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Snackbar, Paper, Divider, AppBar, Toolbar, Alert, CircularProgress, Autocomplete } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FormSection from './components/FormSection';
import { getVeiculos, createChecklist, uploadImagemChecklist, getMeuChecklistHoje } from '../services/api';

type ChecklistErrors = {
  veiculo?: string;
  mileage?: string;
  tireCondition?: string;
  lights?: string;
  cleanliness?: string;
  brakes?: string;
  outrasAvarias?: string;
};

function Checklist() {
  const navigate = useNavigate();
  
  // Estados para veículos
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<string>('');
  const [loadingVeiculos, setLoadingVeiculos] = useState(true);
  
  // Estados do formulário
  const [mileage, setMileage] = useState('');
  const [tireCondition, setTireCondition] = useState('');
  const [lights, setLights] = useState('');
  const [cleanliness, setCleanliness] = useState('');
  const [brakes, setBrakes] = useState('');
  const [outrasAvarias, setOutrasAvarias] = useState('');
  const [tireConditionDesc, setTireConditionDesc] = useState('');
  const [lightsDesc, setLightsDesc] = useState('');
  const [cleanlinessDesc, setCleanlinessDesc] = useState('');
  const [brakesDesc, setBrakesDesc] = useState('');
  const [outrasAvariasDesc, setOutrasAvariasDesc] = useState('');
  
  // Estados para upload de imagens
  const [imagemPneusUrl, setImagemPneusUrl] = useState<string | null>(null);
  const [imagemLuzesUrl, setImagemLuzesUrl] = useState<string | null>(null);
  const [imagemFreiosUrl, setImagemFreiosUrl] = useState<string | null>(null);
  const [imagemOutrasAvariasUrl, setImagemOutrasAvariasUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Estados de controle
  const [errors, setErrors] = useState<ChecklistErrors>({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modoLeitura, setModoLeitura] = useState(false);
  const [checklistEnviado, setChecklistEnviado] = useState<any>(null);
  
  // Refs para scroll
  const veiculoRef = useRef<HTMLDivElement>(null);
  const mileageRef = useRef<HTMLInputElement>(null);
  const tireConditionRef = useRef<HTMLDivElement>(null);
  const lightsRef = useRef<HTMLDivElement>(null);
  const cleanlinessRef = useRef<HTMLDivElement>(null);
  const brakesRef = useRef<HTMLDivElement>(null);
  const outrasAvariasRef = useRef<HTMLDivElement>(null);

  // Carregar veículos ao montar o componente
  useEffect(() => {
    const carregarVeiculos = async () => {
      try {
        setLoadingVeiculos(true);
        const data = await getVeiculos({ status: 'Disponivel' });
        setVeiculos(data);
      } catch (err) {
        console.error('Erro ao carregar veículos:', err);
        setError('Erro ao carregar veículos disponíveis');
      } finally {
        setLoadingVeiculos(false);
      }
    };

    const verificarChecklistHoje = async () => {
      try {
        const resultado = await getMeuChecklistHoje();
        if (resultado.enviado) {
          setModoLeitura(true);
          setChecklistEnviado(resultado.checklist);
          // Preencher campos com dados do checklist enviado
          preencherFormularioLeitura(resultado.checklist);
        }
      } catch (err) {
        console.error('Erro ao verificar checklist:', err);
      }
    };

    carregarVeiculos();
    verificarChecklistHoje();
  }, []);

  // Função para preencher formulário em modo leitura
  const preencherFormularioLeitura = (checklist: any) => {
    setVeiculoSelecionado(checklist.veiculoId);
    setMileage(checklist.kmVeiculo.toString());
    setTireCondition(checklist.pneus ? 'Bom' : 'Ruim');
    setLights(checklist.luzes ? 'Funcionando' : 'Com Defeito');
    setCleanliness(checklist.limpeza ? 'Limpo' : 'Sujo');
    setBrakes(checklist.freios ? 'Funcionando' : 'Com Defeito');
    setImagemPneusUrl(checklist.imagemPneus);
    setImagemLuzesUrl(checklist.imagemLuzes);
    setImagemFreiosUrl(checklist.imagemFreios);
    setImagemOutrasAvariasUrl(checklist.imagemOutrasAvarias);
    
    // Determinar se há "Outras avarias" baseado na presença de imagem ou descrição
    const temOutrasAvarias = checklist.imagemOutrasAvarias || 
      (checklist.observacoes && checklist.observacoes.includes('Outras avarias'));
    setOutrasAvarias(temOutrasAvarias ? 'Sim' : 'Não');
    
    // Extrair observações (se estiverem concatenadas)
    if (checklist.observacoes) {
      // Lógica para separar observações se necessário
      const observacoes = checklist.observacoes.split('; ');
      if (observacoes.length >= 5) {
        setTireConditionDesc(observacoes[0] || '');
        setLightsDesc(observacoes[1] || '');
        setCleanlinessDesc(observacoes[2] || '');
        setBrakesDesc(observacoes[3] || '');
        setOutrasAvariasDesc(observacoes[4] || '');
      } else {
        // Se não há 5 observações separadas, tentar extrair "Outras avarias" do texto
        const outrasAvariasMatch = checklist.observacoes.match(/Outras avarias[:\s]*(.+?)(?:;|$)/i);
        if (outrasAvariasMatch) {
          setOutrasAvariasDesc(outrasAvariasMatch[1].trim());
        }
      }
    }
  };

  // Função para fazer upload de imagem
  const handleImageUpload = async (file: File, tipo: 'pneus' | 'luzes' | 'freios' | 'outrasAvarias') => {
    try {
      setUploadingImage(true);
      
      // Pequeno delay para evitar conflitos de upload simultâneo
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const url = await uploadImagemChecklist(file);
      
      if (tipo === 'pneus') setImagemPneusUrl(url);
      if (tipo === 'luzes') setImagemLuzesUrl(url);
      if (tipo === 'freios') setImagemFreiosUrl(url);
      if (tipo === 'outrasAvarias') setImagemOutrasAvariasUrl(url);
      
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      setError('Erro ao enviar imagem. Tente novamente.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Função de validação dos campos obrigatórios
  const validateFields = () => {
    const newErrors: ChecklistErrors = {};
    
    if (!veiculoSelecionado) {
      newErrors.veiculo = "Selecione um veículo";
      if (veiculoRef.current) {
        veiculoRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (!mileage) {
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
    } else if (!brakes) {
      newErrors.brakes = "Status dos freios é obrigatório";
      if (brakesRef.current) {
        brakesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (!outrasAvarias) {
      newErrors.outrasAvarias = "Outras avarias é obrigatório";
      if (outrasAvariasRef.current) {
        outrasAvariasRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função de envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFields()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Montar dados do checklist conforme API
      const checklistData = {
        veiculoId: veiculoSelecionado,
        kmVeiculo: parseInt(mileage),
        pneus: tireCondition === 'Bom' || tireCondition === 'Regular',
        luzes: lights === 'Funcionando',
        freios: brakes === 'Funcionando',
        limpeza: cleanliness === 'Limpo',
        imagemPneus: imagemPneusUrl || undefined,
        imagemLuzes: imagemLuzesUrl || undefined,
        imagemFreios: imagemFreiosUrl || undefined,
        imagemOutrasAvarias: imagemOutrasAvariasUrl || undefined,
        observacoes: [tireConditionDesc, lightsDesc, cleanlinessDesc, brakesDesc, outrasAvariasDesc]
          .filter(Boolean)
          .join('; ') || undefined
      };
      
      await createChecklist(checklistData);
      
      setOpenSnackbar(true);
      setShowCheckmark(true);
      
      setTimeout(() => setShowCheckmark(false), 1500);
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (err: any) {
      console.error('Erro ao enviar checklist:', err);
      setError(err.response?.data?.message || 'Erro ao enviar checklist. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar o formulário
  const handleClear = () => {
    setVeiculoSelecionado('');
    setMileage('');
    setTireCondition('');
    setLights('');
    setCleanliness('');
    setBrakes('');
    setOutrasAvarias('');
    setTireConditionDesc('');
    setLightsDesc('');
    setCleanlinessDesc('');
    setBrakesDesc('');
    setOutrasAvariasDesc('');
    setImagemPneusUrl(null);
    setImagemLuzesUrl(null);
    setImagemFreiosUrl(null);
    setImagemOutrasAvariasUrl(null);
    setErrors({});
    setError(null);
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

      {/* Mensagem de Erro */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Banner informativo quando em modo leitura */}
      {modoLeitura && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Você já enviou seu checklist hoje. 
          Status: {checklistEnviado?.status}. 
          Abaixo você pode visualizar os dados enviados.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>

        {/* Seleção de Veículo */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }} ref={veiculoRef}>
          <Divider textAlign="left">
            <Typography variant="h6" color="primary">
              Veículo
            </Typography>
          </Divider>
          <Autocomplete
            options={veiculos}
            getOptionLabel={(option) => `${option.placa} - ${option.modelo} (${option.marca})`}
            value={veiculos.find(v => v.id === veiculoSelecionado) || null}
            onChange={(event, newValue) => {
              setVeiculoSelecionado(newValue ? newValue.id : '');
            }}
            loading={loadingVeiculos}
            disabled={loading || modoLeitura}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Digite ou selecione o veículo *"
                margin="normal"
                error={!!errors['veiculo']}
                helperText={errors['veiculo']}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingVeiculos ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {option.placa}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.modelo} - {option.marca} ({option.ano})
                  </Typography>
                </Box>
              </Box>
            )}
          />
        </Paper>

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
                    disabled={modoLeitura}
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
            image={imagemPneusUrl}
            onImageChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await handleImageUpload(file, 'pneus');
            }}
            uploadingImage={uploadingImage}
            disabled={modoLeitura}
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
            image={imagemLuzesUrl}
            onImageChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await handleImageUpload(file, 'luzes');
            }}
            uploadingImage={uploadingImage}
            disabled={modoLeitura}
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
            disabled={modoLeitura}
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
            description={{ condition: 'Com Defeito' }}
            descriptionValue={brakesDesc}
            onDescriptionChange={(e) => setBrakesDesc(e.target.value)}
            image={imagemFreiosUrl}
            onImageChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await handleImageUpload(file, 'freios');
            }}
            uploadingImage={uploadingImage}
            disabled={modoLeitura}
          />
        </Paper>

        {/* Outras Avarias */}
        <Paper elevation={3} sx={{ p: 3, mb: 2 }} ref={outrasAvariasRef}>
          <FormSection
            title="Outras Avarias"
            value={outrasAvarias}
            onChange={(e) => setOutrasAvarias(e.target.value)}
            error={errors['outrasAvarias']}
            options={[
              { value: 'Sim', label: 'Sim' },
              { value: 'Não', label: 'Não' },
            ]}
            description={{ condition: 'Sim' }}
            descriptionValue={outrasAvariasDesc}
            onDescriptionChange={(e) => setOutrasAvariasDesc(e.target.value)}
            image={imagemOutrasAvariasUrl}
            onImageChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await handleImageUpload(file, 'outrasAvarias');
            }}
            uploadingImage={uploadingImage}
            disabled={modoLeitura}
          />
        </Paper>

        {/* Botões de Ação */}
        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleClear}
            disabled={loading || modoLeitura}
          >
            Limpar
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            type="submit"
            disabled={loading || uploadingImage || modoLeitura}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {modoLeitura ? 'Checklist já enviado hoje' : loading ? 'Enviando...' : 'Enviar Checklist'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Checklist;
