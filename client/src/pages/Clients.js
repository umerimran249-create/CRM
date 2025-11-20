import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactInfo: { email: '', phone: '', address: '' },
    industry: '',
    contractDate: '',
    accountManager: '',
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchClients();
    fetchTeamMembers();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/api/team');
      setTeamMembers(response.data.filter(m => m.role === 'Project Manager' || m.role === 'Admin'));
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleOpen = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        contactInfo: client.contactInfo || { email: '', phone: '', address: '' },
        industry: client.industry || '',
        contractDate: client.contractDate ? new Date(client.contractDate).toISOString().split('T')[0] : '',
        accountManager: client.accountManager?._id || '',
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        contactInfo: { email: '', phone: '', address: '' },
        industry: '',
        contractDate: '',
        accountManager: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingClient(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingClient) {
        await api.put(`/api/clients/${editingClient._id}`, formData);
      } else {
        await api.post('/api/clients', formData);
      }
      fetchClients();
      handleClose();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error saving client: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const canEdit = user?.role === 'Admin' || user?.role === 'Project Manager';

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Clients</Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Client
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell>Contract Date</TableCell>
              <TableCell>Account Manager</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client._id}>
                <TableCell>{client.clientId}</TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.contactInfo?.email || '-'}</TableCell>
                <TableCell>{client.industry || '-'}</TableCell>
                <TableCell>
                  {new Date(client.contractDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{client.accountManager?.name || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/clients/${client._id}`)}
                  >
                    <ViewIcon />
                  </IconButton>
                  {canEdit && (
                    <IconButton size="small" onClick={() => handleOpen(client)}>
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingClient ? 'Edit Client' : 'Add New Client'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Client Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.contactInfo.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, email: e.target.value },
              })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={formData.contactInfo.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, phone: e.target.value },
              })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Industry"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Contract Date"
            type="date"
            value={formData.contractDate}
            onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            select
            label="Account Manager"
            value={formData.accountManager}
            onChange={(e) => setFormData({ ...formData, accountManager: e.target.value })}
            margin="normal"
            required
          >
            {teamMembers.map((member) => (
              <MenuItem key={member._id} value={member._id}>
                {member.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingClient ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

