import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Add, Edit, Delete, Settings as SettingsIcon, Link as LinkIcon } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { SelectChangeEvent } from '@mui/material';

// Tipos e interfaces para TypeScript
interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

type AdminFormData = Omit<Admin, 'id'>;
type AdminErrors = Partial<Record<keyof AdminFormData, string>>;

// Tipos para checklist
interface ChecklistItem {
  id: number;
  name: string;
  type: 'OK/Não OK/N/A' | 'Campo de texto';
  group: string;
}

// Tipos para integração
interface IntegrationLog {
  date: string;
  status: 'Sucesso' | 'Erro';
  message: string;
}

function Settings() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([
    { id: 1, name: 'Admin 1', email: 'admin1@example.com', role: 'Super Admin' },
    { id: 2, name: 'Admin 2', email: 'admin2@example.com', role: 'Editor' },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<AdminFormData>({ name: '', email: '', role: '' });
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [errors, setErrors] = useState<AdminErrors>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const roles = ['Super Admin', 'Editor', 'Viewer']; // Defina os papéis disponíveis

  const handleOpenDialog = (admin: Admin | null = null) => {
    setEditingAdmin(admin);
    setFormData(admin || { name: '', email: '', role: '' });
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAdmin(null);
  };

  const validateForm = () => {
    const newErrors: AdminErrors = {};
    if (!formData.name) newErrors.name = 'O nome é obrigatório.';
    if (!formData.email) newErrors.email = 'O e-mail é obrigatório.';
    if (!formData.role) newErrors.role = 'O papel é obrigatório.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAdmin = () => {
    if (!validateForm()) return;

    if (editingAdmin) {
      setAdmins((prev) =>
        prev.map((admin) => (admin.id === editingAdmin.id ? { ...formData, id: admin.id } : admin))
      );
      setSnackbarMessage('Administrador atualizado com sucesso!');
    } else {
      setAdmins((prev) => [...prev, { ...formData, id: prev.length + 1 }]);
      setSnackbarMessage('Administrador adicionado com sucesso!');
    }
    setSnackbarOpen(true);
    handleCloseDialog();
  };

  const handleDeleteAdmin = (id: number) => {
    setAdmins((prev) => prev.filter((admin) => admin.id !== id));
    setSnackbarMessage('Administrador removido com sucesso!');
    setSnackbarOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof AdminFormData]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof AdminFormData]: value }));
  };

  // Checklist
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: 1, name: 'Nível de óleo', type: 'OK/Não OK/N/A', group: 'Motor' },
    { id: 2, name: 'Pastilhas de freio', type: 'OK/Não OK/N/A', group: 'Freios' },
  ]);
  const [openChecklistDialog, setOpenChecklistDialog] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] = useState<ChecklistItem | null>(null);
  const [checklistForm, setChecklistForm] = useState({ name: '', type: 'OK/Não OK/N/A', group: 'Motor' });
  const [checklistErrors, setChecklistErrors] = useState<{ name?: string }>({});

  // Notificações
  const [sendEmailOnIssue, setSendEmailOnIssue] = useState(true);
  const [adminEmail, setAdminEmail] = useState('admin@empresa.com');
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Integração ERP
  const [erpStatus, setErpStatus] = useState<'Ativo' | 'Inativo'>('Inativo');
  const [openIntegrationDialog, setOpenIntegrationDialog] = useState(false);
  const [integrationForm, setIntegrationForm] = useState({ url: '', apiKey: '', username: '', password: '' });
  const [integrationLogs, setIntegrationLogs] = useState<IntegrationLog[]>([]);
  const [integrationLoading, setIntegrationLoading] = useState(false);

  // Feedback
  const [snackbarError, setSnackbarError] = useState(false);

  const checklistGroups = ['Motor', 'Freios', 'Estrutura', 'Elétrica'];

  // Handlers Checklist
  const handleOpenChecklistDialog = (item: ChecklistItem | null = null) => {
    setEditingChecklistItem(item);
    setChecklistForm(
      item
        ? { name: item.name, type: item.type, group: item.group }
        : { name: '', type: 'OK/Não OK/N/A', group: checklistGroups[0] }
    );
    setChecklistErrors({});
    setOpenChecklistDialog(true);
  };
  const handleCloseChecklistDialog = () => {
    setOpenChecklistDialog(false);
    setEditingChecklistItem(null);
  };
  const handleSaveChecklistItem = () => {
    if (!checklistForm.name) {
      setChecklistErrors({ name: 'Nome obrigatório' });
      return;
    }
    if (editingChecklistItem) {
      setChecklistItems((prev) =>
        prev.map((item) =>
          item.id === editingChecklistItem.id
            ? { ...editingChecklistItem, ...checklistForm, type: checklistForm.type as 'OK/Não OK/N/A' | 'Campo de texto' }
            : item
        )
      );
      setSnackbarMessage('Item de checklist atualizado com sucesso!');
    } else {
      setChecklistItems((prev) => [
        ...prev,
        { id: prev.length + 1, ...checklistForm, type: checklistForm.type as 'OK/Não OK/N/A' | 'Campo de texto' },
      ]);
      setSnackbarMessage('Item de checklist adicionado com sucesso!');
    }
    setSnackbarError(false);
    setSnackbarOpen(true);
    handleCloseChecklistDialog();
  };
  const handleDeleteChecklistItem = (id: number) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
    setSnackbarMessage('Item de checklist removido com sucesso!');
    setSnackbarError(false);
    setSnackbarOpen(true);
  };

  // Handlers Notificações
  const handleSaveNotifications = () => {
    setNotificationLoading(true);
    setTimeout(() => {
      setNotificationLoading(false);
      setSnackbarMessage('Configurações de notificação salvas com sucesso!');
      setSnackbarError(false);
      setSnackbarOpen(true);
    }, 1000);
  };

  // Handlers Integração
  const handleOpenIntegrationDialog = () => {
    setOpenIntegrationDialog(true);
  };
  const handleCloseIntegrationDialog = () => {
    setOpenIntegrationDialog(false);
  };
  const handleSaveIntegration = () => {
    setIntegrationLoading(true);
    // Simula tentativa de conexão
    setTimeout(() => {
      const success = integrationForm.url && integrationForm.apiKey;
      setIntegrationLogs((prev) => [
        {
          date: new Date().toLocaleString(),
          status: success ? 'Sucesso' : 'Erro',
          message: success ? 'Conexão realizada com sucesso.' : 'Erro ao conectar ao ERP.',
        },
        ...prev,
      ]);
      setErpStatus(success ? 'Ativo' : 'Inativo');
      setIntegrationLoading(false);
      setSnackbarMessage(success ? 'Configuração de integração salva com sucesso!' : 'Erro ao conectar ao ERP.');
      setSnackbarError(!success);
      setSnackbarOpen(true);
      if (success) setOpenIntegrationDialog(false);
    }, 1200);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box>
        {/* Botão de Adicionar */}
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Adicionar Administrador
          </Button>
        </Box>

        {/* Tabela de Administradores */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Papel</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.role}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenDialog(admin)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDeleteAdmin(admin.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Dialog de Adicionar/Editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingAdmin ? 'Editar Administrador' : 'Adicionar Administrador'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            margin="normal"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="E-mail"
            fullWidth
            margin="normal"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <FormControl fullWidth margin="normal" error={!!errors.role}>
            <InputLabel id="role-label">Papel</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              onChange={handleSelectChange}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
            {errors.role && (
              <Typography variant="body2" color="error">
                {errors.role}
              </Typography>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSaveAdmin} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={snackbarMessage}
        ContentProps={{ sx: snackbarError ? { background: 'red' } : {} }}
      />

      {/* Painel de Checklist */}
      <Box mb={5}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Configurar Itens de Checklist
        </Typography>
        <Box display="flex" justifyContent="flex-end" mb={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenChecklistDialog()}
          >
            Adicionar Novo Item
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome do Item</TableCell>
                <TableCell>Tipo de Entrada</TableCell>
                <TableCell>Grupo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checklistItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.group}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton color="primary" onClick={() => handleOpenChecklistDialog(item)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton color="error" onClick={() => handleDeleteChecklistItem(item.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Divider sx={{ my: 4 }}>
        <Chip label="Notificações" />
      </Divider>

      {/* Painel de Notificações */}
      <Box mb={5}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Notificações por E-mail
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={sendEmailOnIssue}
              onChange={e => setSendEmailOnIssue(e.target.checked)}
              color="primary"
            />
          }
          label="Enviar e-mail ao gestor quando houver avaria registrada"
        />
        <TextField
          label="E-mail do administrador de sistema"
          value={adminEmail}
          onChange={e => setAdminEmail(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveNotifications}
            disabled={notificationLoading}
          >
            Salvar Configurações
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }}>
        <Chip label="Integrações" />
      </Divider>

      {/* Painel de Integrações */}
      <Box mb={5}>
        <Box display="flex" alignItems="center" mb={2}>
          <SettingsIcon style={{ marginRight: 8 }} />
          <Typography variant="h6" fontWeight={700}>
            Integrações
          </Typography>
          <Chip
            label={erpStatus === 'Ativo' ? 'Ativo' : 'Inativo'}
            color={erpStatus === 'Ativo' ? 'success' : 'default'}
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" mb={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<LinkIcon />}
            onClick={handleOpenIntegrationDialog}
          >
            Configurar Conexão
          </Button>
        </Box>
        <Typography variant="subtitle2" mb={1}>
          Logs de tentativas de conexão:
        </Typography>
        <Paper variant="outlined" sx={{ maxHeight: 180, overflow: 'auto', mb: 2 }}>
          <List dense>
            {integrationLogs.length === 0 && (
              <ListItem>
                <ListItemText primary="Nenhum log de integração ainda." />
              </ListItem>
            )}
            {integrationLogs.map((log, idx) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={`${log.date} - [${log.status}]`}
                  secondary={log.message}
                  sx={{ color: log.status === 'Erro' ? 'error.main' : 'success.main' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Modal de Checklist */}
      <Dialog open={openChecklistDialog} onClose={handleCloseChecklistDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingChecklistItem ? 'Editar Item de Checklist' : 'Adicionar Novo Item'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome do item"
            value={checklistForm.name}
            onChange={e => setChecklistForm({ ...checklistForm, name: e.target.value })}
            error={!!checklistErrors.name}
            helperText={checklistErrors.name}
            fullWidth
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de campo</InputLabel>
            <Select
              value={checklistForm.type}
              label="Tipo de campo"
              onChange={e => setChecklistForm({ ...checklistForm, type: e.target.value as any })}
            >
              <MenuItem value="OK/Não OK/N/A">OK/Não OK/N/A</MenuItem>
              <MenuItem value="Campo de texto">Campo de texto</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Grupo</InputLabel>
            <Select
              value={checklistForm.group}
              label="Grupo"
              onChange={e => setChecklistForm({ ...checklistForm, group: e.target.value })}
            >
              {checklistGroups.map((group) => (
                <MenuItem key={group} value={group}>{group}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseChecklistDialog} color="secondary">Cancelar</Button>
          <Button onClick={handleSaveChecklistItem} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Integração */}
      <Dialog open={openIntegrationDialog} onClose={handleCloseIntegrationDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Configurar Integração com ERP</DialogTitle>
        <DialogContent>
          <TextField
            label="URL do ERP"
            value={integrationForm.url}
            onChange={e => setIntegrationForm({ ...integrationForm, url: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Chave de API"
            value={integrationForm.apiKey}
            onChange={e => setIntegrationForm({ ...integrationForm, apiKey: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Usuário (opcional)"
            value={integrationForm.username}
            onChange={e => setIntegrationForm({ ...integrationForm, username: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Senha (opcional)"
            type="password"
            value={integrationForm.password}
            onChange={e => setIntegrationForm({ ...integrationForm, password: e.target.value })}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIntegrationDialog} color="secondary">Cancelar</Button>
          <Button onClick={handleSaveIntegration} color="primary" variant="contained" disabled={integrationLoading}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Settings;
