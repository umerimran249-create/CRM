import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';

export default function GanttView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (project) => {
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  const getDaysRemaining = (project) => {
    const end = new Date(project.endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gantt Chart View
      </Typography>
      
      {projects.map((project) => {
        const progress = calculateProgress(project);
        const daysRemaining = getDaysRemaining(project);
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        return (
          <Paper key={project._id} sx={{ p: 2, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">{project.name}</Typography>
              <Chip label={project.status} size="small" />
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="textSecondary">
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()} ({duration} days)
              </Typography>
            </Box>

            <Box sx={{ position: 'relative', height: 30, bgcolor: '#e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${progress}%`,
                  bgcolor: progress >= 100 ? '#4caf50' : progress >= 75 ? '#ff9800' : '#2196f3',
                  transition: 'width 0.3s ease',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: progress > 50 ? 'white' : 'black',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                }}
              >
                {progress}%
              </Box>
            </Box>

            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : `${Math.abs(daysRemaining)} days overdue`}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}

