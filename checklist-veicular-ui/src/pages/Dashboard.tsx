import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';

interface DashboardProps {
  onLogout?: () => void;
}

const quickSummary = [
  {
    label: 'Veículos',
    value: 24,
    icon: <DirectionsCarIcon color="primary" fontSize="large" />,
  },
  {
    label: 'Checklists Pendentes',
    value: 3,
    icon: <AssignmentLateIcon color="warning" fontSize="large" />,
  },
  {
    label: 'Manutenções',
    value: 2,
    icon: <BuildIcon color="secondary" fontSize="large" />,
  },
  {
    label: 'Alertas',
    value: 1,
    icon: <WarningIcon color="error" fontSize="large" />,
  },
];

const Dashboard: React.FC<DashboardProps> = () => (
  <Box sx={{ width: '100%' }}>
    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} mb={3}>
      {quickSummary.map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item.label}>
          <Card
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: { xs: 1.5, sm: 2 },
              minHeight: { xs: 80, sm: 100 },
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <Box sx={{ mr: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center' }}>{item.icon}</Box>
            <CardContent sx={{ flex: 1, p: '8px !important' }}>
              <Typography variant="h5" sx={{ fontSize: { xs: '1.3rem', sm: '1.7rem' } }}>{item.value}</Typography>
              <Typography color="textSecondary" sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>{item.label}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    {/* ...restante do dashboard... */}
  </Box>
);

export default Dashboard;
