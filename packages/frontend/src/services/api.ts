import axios from 'axios';

// Base URL da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5119/api';

// Base URL para imagens (sem /api)
export const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:5119';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado - redirecionar para login
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (data: {
  email: string;
  password: string;
  nome: string;
  papel?: string;
  cpf?: string;
  telefone?: string;
}) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// ===== USUARIOS =====
export const getUsuarios = async (params?: {
  search?: string;
  papel?: string;
  ativo?: boolean;
}) => {
  const response = await api.get('/usuarios', { params });
  return response.data;
};

export const getUsuario = async (id: string) => {
  const response = await api.get(`/usuarios/${id}`);
  return response.data;
};

export const updateUsuario = async (id: string, data: {
  email: string;
  nome: string;
  papel: string;
  cpf?: string;
  telefone?: string;
  ativo: boolean;
  cnhNumero?: string;
  cnhCategoria?: string;
  cnhValidade?: string;
  matricula?: string;
  turnoTrabalho?: string;
}) => {
  // Mapear camelCase para PascalCase para o backend
  const backendData = {
    Email: data.email,
    Nome: data.nome,
    Papel: data.papel,
    Cpf: data.cpf,
    Telefone: data.telefone,
    Ativo: data.ativo,
    CnhNumero: data.cnhNumero,
    CnhCategoria: data.cnhCategoria,
    CnhValidade: data.cnhValidade ? new Date(data.cnhValidade).toISOString() : null,
    Matricula: data.matricula,
    TurnoTrabalho: data.turnoTrabalho
  };
  const response = await api.put(`/usuarios/${id}`, backendData);
  return response.data;
};

export const toggleUsuarioAtivo = async (id: string) => {
  const response = await api.put(`/usuarios/${id}/toggle-active`);
  return response.data;
};

export const deleteUsuario = async (id: string) => {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
};

// ===== VEICULOS =====
export const getVeiculos = async (params?: {
  search?: string;
  status?: string;
}) => {
  const response = await api.get('/veiculos', { params });
  return response.data;
};

export const getVeiculo = async (id: string) => {
  const response = await api.get(`/veiculos/${id}`);
  return response.data;
};

export const createVeiculo = async (data: {
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  tipo: string;
  status?: string;
  quilometragem?: number;
  ultimaManutencao?: string;
  proximaManutencao?: string;
}) => {
  // Mapear camelCase para PascalCase e converter strings para enums
  const backendData = {
    Placa: data.placa,
    Modelo: data.modelo,
    Marca: data.marca,
    Ano: data.ano,
    Tipo: data.tipo, // Backend vai converter string para enum
    Status: data.status, // Backend vai converter string para enum
    Quilometragem: data.quilometragem,
    UltimaManutencao: data.ultimaManutencao ? new Date(data.ultimaManutencao) : null,
    ProximaManutencao: data.proximaManutencao ? new Date(data.proximaManutencao) : null
  };
  const response = await api.post('/veiculos', backendData);
  return response.data;
};

export const updateVeiculo = async (id: string, data: {
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  tipo: string;
  status?: string;
  quilometragem?: number;
  ultimaManutencao?: string;
  proximaManutencao?: string;
}) => {
  // Mapear camelCase para PascalCase e converter strings para enums
  const backendData = {
    Placa: data.placa,
    Modelo: data.modelo,
    Marca: data.marca,
    Ano: data.ano,
    Tipo: data.tipo, // Backend vai converter string para enum
    Status: data.status, // Backend vai converter string para enum
    Quilometragem: data.quilometragem,
    UltimaManutencao: data.ultimaManutencao ? new Date(data.ultimaManutencao) : null,
    ProximaManutencao: data.proximaManutencao ? new Date(data.proximaManutencao) : null
  };
  const response = await api.put(`/veiculos/${id}`, backendData);
  return response.data;
};

export const deleteVeiculo = async (id: string) => {
  const response = await api.delete(`/veiculos/${id}`);
  return response.data;
};

export const getVeiculoHistorico = async (id: string) => {
  const response = await api.get(`/veiculos/${id}/historico`);
  return response.data;
};

// ===== MANUTENÇÕES =====
export const getManutencoes = async (params?: {
  status?: string;
  tipo?: string;
  veiculoId?: string;
  dataInicio?: string;
  dataFim?: string;
}) => {
  const response = await api.get('/manutencoes', { params });
  return response.data;
};

export const getManutencao = async (id: string) => {
  const response = await api.get(`/manutencoes/${id}`);
  return response.data;
};

export const createManutencao = async (data: {
  veiculoId: string;
  tipo: string;
  prioridade: string;
  quilometragemNoAto?: number;
  descricao: string;
  custo?: number;
}) => {
  // Backend espera PascalCase e enums como string (convertidos no servidor)
  const backendData = {
    VeiculoId: data.veiculoId,
    Tipo: data.tipo,
    Prioridade: data.prioridade,
    QuilometragemNoAto: data.quilometragemNoAto,
    Descricao: data.descricao,
    Custo: data.custo
  };
  const response = await api.post('/manutencoes', backendData);
  return response.data;
};

export const simularProximoStatusManutencao = async (id: string) => {
  const response = await api.post(`/manutencoes/${id}/simular-proximo-status`);
  return response.data;
};

export const updateManutencao = async (id: string, data: {
  veiculoId: string;
  tipo: string;
  prioridade: string;
  quilometragemNoAto?: number;
  descricao: string;
  custo?: number;
}) => {
  const backendData = {
    VeiculoId: data.veiculoId,
    Tipo: data.tipo,
    Prioridade: data.prioridade,
    QuilometragemNoAto: data.quilometragemNoAto,
    Descricao: data.descricao,
    Custo: data.custo
  };
  const response = await api.put(`/manutencoes/${id}`, backendData);
  return response.data;
};

export const updateManutencaoStatus = async (id: string, data: {
  status: string;
  custo?: number;
}) => {
  const backendData = {
    Status: data.status,
    Custo: data.custo
  };
  const response = await api.put(`/manutencoes/${id}/status`, backendData);
  return response.data;
};

export const deleteManutencao = async (id: string) => {
  const response = await api.delete(`/manutencoes/${id}`);
  return response.data;
};

// ===== CHECKLISTS =====
export const getChecklists = async (params?: {
  dataInicio?: string;
  dataFim?: string;
  status?: string;
  veiculoId?: string;
  motoristaId?: string;
}) => {
  const response = await api.get('/checklists', { params });
  return response.data;
};

export const getChecklist = async (id: string) => {
  const response = await api.get(`/checklists/${id}`);
  return response.data;
};

export const createChecklist = async (data: {
  veiculoId: string;
  kmVeiculo: number;
  pneus: boolean;
  luzes: boolean;
  freios: boolean;
  limpeza: boolean;
  imagemPneus?: string;
  imagemLuzes?: string;
  imagemFreios?: string;
  imagemOutrasAvarias?: string;
  observacoes?: string;
}) => {
  const response = await api.post('/checklists', data);
  return response.data;
};

export const updateChecklist = async (id: string, data: {
  kmVeiculo: number;
  pneus: boolean;
  luzes: boolean;
  freios: boolean;
  limpeza: boolean;
  imagemPneus?: string;
  imagemLuzes?: string;
  imagemFreios?: string;
  imagemOutrasAvarias?: string;
  observacoes?: string;
}) => {
  const response = await api.put(`/checklists/${id}`, data);
  return response.data;
};

export const updateChecklistStatus = async (id: string, status: string) => {
  const response = await api.put(`/checklists/${id}/status`, { status });
  return response.data;
};

export const deleteChecklist = async (id: string) => {
  const response = await api.delete(`/checklists/${id}`);
  return response.data;
};

export const uploadImagemChecklist = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/checklists/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.url;
};


export const getMeuChecklistHoje = async () => {
  const response = await api.get('/checklists/meu-checklist-hoje');
  return response.data;
};

export const getMeuChecklistVeiculoHoje = async (veiculoId: string) => {
  const response = await api.get(`/checklists/meu-checklist-veiculo/${veiculoId}`);
  return response.data;
};

export const validarPlacaHoje = async (veiculoId: string) => {
  const response = await api.get(`/checklists/validar-placa/${veiculoId}`);
  return response.data;
};

export const getEstatisticasChecklists = async () => {
  const response = await api.get('/checklists/estatisticas');
  return response.data;
};

export const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

// ===== AUDIT LOGS =====
export const getAuditLogs = async () => {
  const response = await api.get('/auditlogs');
  return response.data;
};

// ===== ALERTAS CNH =====
export const getAlertasCNH = async () => {
  const response = await api.get('/usuarios/alertas-cnh');
  return response.data;
};

// ===== TROCA DE SENHA =====
export const changePassword = async (senhaAtual: string, novaSenha: string) => {
  const response = await api.post('/auth/change-password', {
    senhaAtual,
    novaSenha
  });
  return response.data;
};

export const adminChangePassword = async (usuarioId: string, novaSenha: string) => {
  const response = await api.put(`/usuarios/${usuarioId}/change-password`, {
    novaSenha
  });
  return response.data;
};

// Export default para uso direto
export default api;
