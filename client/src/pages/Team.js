import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const PERMISSION_OPTIONS = [
  { value: 'dashboard.view', label: 'Dashboard (view)' },
  { value: 'clients.view', label: 'Clients (view)' },
  { value: 'clients.manage', label: 'Clients (manage)' },
  { value: 'projects.view', label: 'Projects (view)' },
  { value: 'projects.manage', label: 'Projects (manage)' },
  { value: 'tasks.view', label: 'Tasks (view)' },
  { value: 'tasks.manage', label: 'Tasks (manage)' },
  { value: 'messages.view', label: 'Messages (view)' },
  { value: 'messages.manage', label: 'Messages (manage)' },
  { value: 'finance.view', label: 'Finance (view)' },
  { value: 'finance.manage', label: 'Finance (manage)' },
  { value: 'team.view', label: 'Team (view)' },
  { value: 'team.manage', label: 'Team (manage)' },
  { value: 'admin.manage', label: 'Admin (manage permissions)' },
];

const ROLE_OPTIONS = [
  'Admin',
  'Project Manager',
  'Team Member',
  'Finance User',
];

export default function Team() {
  const { hasPermission } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Team Member',
    department: '',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/api/team');
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (memberId, permissions) => {
    try {
      await api.put(`/api/team/${memberId}/permissions`, { permissions });
      setMembers((prev) =>
        prev.map((member) =>
          member._id === memberId ? { ...member, permissions } : member
        )
      );
    } catch (error) {
      console.error('Failed to update permissions', error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setError('');
    setSuccess('');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Team Member',
      department: '',
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleCreateMember = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      setError('Password is required and must be at least 6 characters');
      return;
    }
    if (!formData.role) {
      setError('Role is required');
      return;
    }

    try {
      const response = await api.post('/api/team', formData);
      setSuccess('Team member created successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Team Member',
        department: '',
      });
      // Refresh the list
      await fetchMembers();
      // Close dialog after a short delay
      setTimeout(() => {
        setOpenDialog(false);
        setSuccess('');
      }, 1500);
    } catch (error) {
      setError(
        error.response?.data?.message || 'Failed to create team member'
      );
    }
  };

  const canManagePermissions = hasPermission('admin.manage');
  const canManageTeam = hasPermission('team.manage');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          Team Members
        </Typography>
        {canManageTeam && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Add Team Member
          </Button>
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Team Member</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={handleInputChange('name')}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleInputChange('email')}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={formData.password}
              onChange={handleInputChange('password')}
              helperText="Minimum 6 characters"
            />
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={handleInputChange('role')}
                label="Role"
              >
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Department"
              fullWidth
              value={formData.department}
              onChange={handleInputChange('department')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreateMember} variant="contained" disabled={!!success}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Module Access</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member._id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.department || '-'}</TableCell>
                <TableCell>
                  {member.isActive ? 'Active' : 'Inactive'}
                </TableCell>
                <TableCell>
                  {canManagePermissions ? (
                    <FormControl fullWidth size="small">
                      <InputLabel id={`permission-label-${member._id}`}>Permissions</InputLabel>
                      <Select
                        labelId={`permission-label-${member._id}`}
                        multiple
                        value={member.permissions || []}
                        onChange={(event) =>
                          handlePermissionChange(member._id, event.target.value)
                        }
                        input={<OutlinedInput label="Permissions" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const option = PERMISSION_OPTIONS.find((item) => item.value === value);
                              return <Chip key={value} label={option?.label || value} />;
                            })}
                          </Box>
                        )}
                      >
                        {PERMISSION_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(member.permissions || []).map((permission) => {
                        const option = PERMISSION_OPTIONS.find((item) => item.value === permission);
                        return <Chip key={permission} label={option?.label || permission} size="small" />;
                      })}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

