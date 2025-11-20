import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Finance() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    type: 'Expense',
    project: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: '',
    invoiceNumber: '',
    paymentDeadline: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchEntries();
    fetchProjects();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get('/api/finance');
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching finance entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleOpen = () => {
    setFormData({
      type: 'Expense',
      project: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      category: '',
      invoiceNumber: '',
      paymentDeadline: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      await api.post('/api/finance', formData);
      fetchEntries();
      handleClose();
    } catch (error) {
      console.error('Error saving finance entry:', error);
      alert('Error saving entry: ' + (error.response?.data?.message || error.message));
    }
  };

  const canAdd = user?.role === 'Admin' || user?.role === 'Finance User' || user?.role === 'Project Manager';

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Finance</Typography>
        {canAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Add Entry
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Invoice #</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry._id}>
                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={entry.type}
                    size="small"
                    color={entry.type === 'Revenue' ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>{entry.project?.name || '-'}</TableCell>
                <TableCell>${entry.amount.toLocaleString()}</TableCell>
                <TableCell>{entry.description || '-'}</TableCell>
                <TableCell>{entry.category || '-'}</TableCell>
                <TableCell>{entry.invoiceNumber || '-'}</TableCell>
                <TableCell>
                  {entry.type === 'Revenue' && (
                    <Chip
                      label={entry.isPaid ? 'Paid' : 'Unpaid'}
                      size="small"
                      color={entry.isPaid ? 'success' : 'warning'}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Finance Entry</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            margin="normal"
            required
          >
            <MenuItem value="Expense">Expense</MenuItem>
            <MenuItem value="Revenue">Revenue</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Project"
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            margin="normal"
            required
          >
            {projects.map((project) => (
              <MenuItem key={project._id} value={project._id}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            margin="normal"
          />
          {formData.type === 'Revenue' && (
            <>
              <TextField
                fullWidth
                label="Invoice Number"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Payment Deadline"
                type="date"
                value={formData.paymentDeadline}
                onChange={(e) => setFormData({ ...formData, paymentDeadline: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

