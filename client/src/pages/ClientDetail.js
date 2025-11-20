import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient();
    fetchProjects();
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await api.get(`/api/clients/${id}`);
      setClient(response.data);
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get(`/api/projects?clientId=${id}`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return <Typography>Client not found</Typography>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/clients')}
        sx={{ mb: 2 }}
      >
        Back to Clients
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {client.name}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>Client ID:</strong> {client.clientId}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {client.contactInfo?.email || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Phone:</strong> {client.contactInfo?.phone || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>Industry:</strong> {client.industry || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Contract Date:</strong>{' '}
              {new Date(client.contractDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              <strong>Account Manager:</strong> {client.accountManager?.name || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Projects ({projects.length})
        </Typography>
        {projects.length === 0 ? (
          <Typography color="textSecondary">No projects found</Typography>
        ) : (
          <List>
            {projects.map((project) => (
              <ListItem
                key={project._id}
                button
                onClick={() => navigate(`/projects/${project._id}`)}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={project.name}
                  secondary={
                    <>
                      <Chip
                        label={project.status}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {project.category} • Budget: ${project.estimatedBudget?.toLocaleString()}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

