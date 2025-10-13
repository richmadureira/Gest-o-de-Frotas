import axios from 'axios';

// Base URL da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  name: string;
  role?: string;
  cpf?: string;
  phone?: string;
}) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// ===== USERS =====
export const getUsers = async (params?: {
  search?: string;
  role?: string;
  active?: boolean;
}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUser = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, data: {
  email: string;
  name: string;
  role: string;
  cpf?: string;
  phone?: string;
  active: boolean;
}) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const toggleUserActive = async (id: string) => {
  const response = await api.put(`/users/${id}/toggle-active`);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// ===== VEHICLES =====
export const getVehicles = async (params?: {
  search?: string;
  status?: string;
}) => {
  const response = await api.get('/vehicles', { params });
  return response.data;
};

export const getVehicle = async (id: string) => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (data: {
  plate: string;
  model: string;
  brand: string;
  year: number;
  type: string;
  status?: string;
  mileage?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
}) => {
  const response = await api.post('/vehicles', data);
  return response.data;
};

export const updateVehicle = async (id: string, data: {
  plate: string;
  model: string;
  brand: string;
  year: number;
  type: string;
  status?: string;
  mileage?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
}) => {
  const response = await api.put(`/vehicles/${id}`, data);
  return response.data;
};

export const deleteVehicle = async (id: string) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};

// ===== CHECKLISTS =====
export const getChecklists = async (params?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  vehicleId?: string;
  driverId?: string;
}) => {
  const response = await api.get('/checklists', { params });
  return response.data;
};

export const getChecklist = async (id: string) => {
  const response = await api.get(`/checklists/${id}`);
  return response.data;
};

export const createChecklist = async (data: {
  vehicleId: string;
  shift: string;
  vehicleKm: number;
  tires: boolean;
  lights: boolean;
  mirrors: boolean;
  windshield: boolean;
  horn: boolean;
  brakes: boolean;
  fuel: string;
  documents: boolean;
  cleaning: boolean;
  tiresImage?: string;
  lightsImage?: string;
  windshieldImage?: string;
  brakesImage?: string;
  observations?: string;
}) => {
  const response = await api.post('/checklists', data);
  return response.data;
};

export const updateChecklist = async (id: string, data: {
  shift: string;
  vehicleKm: number;
  tires: boolean;
  lights: boolean;
  mirrors: boolean;
  windshield: boolean;
  horn: boolean;
  brakes: boolean;
  fuel: string;
  documents: boolean;
  cleaning: boolean;
  tiresImage?: string;
  lightsImage?: string;
  windshieldImage?: string;
  brakesImage?: string;
  observations?: string;
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

// ===== MAINTENANCES =====
export const getMaintenances = async (params?: {
  status?: string;
  type?: string;
  vehicleId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get('/maintenances', { params });
  return response.data;
};

export const getMaintenance = async (id: string) => {
  const response = await api.get(`/maintenances/${id}`);
  return response.data;
};

export const createMaintenance = async (data: {
  vehicleId: string;
  type: string;
  description: string;
  cost?: number;
  scheduledAt: string;
}) => {
  const response = await api.post('/maintenances', data);
  return response.data;
};

export const updateMaintenance = async (id: string, data: {
  type: string;
  description: string;
  cost?: number;
  scheduledAt: string;
}) => {
  const response = await api.put(`/maintenances/${id}`, data);
  return response.data;
};

export const updateMaintenanceStatus = async (id: string, status: string, cost?: number) => {
  const response = await api.put(`/maintenances/${id}/status`, { status, cost });
  return response.data;
};

export const deleteMaintenance = async (id: string) => {
  const response = await api.delete(`/maintenances/${id}`);
  return response.data;
};

export default api;
