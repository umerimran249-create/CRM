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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completionData, setCompletionData] = useState({
    totalHours: '',
    deliverables: '',
    outcome: '',
  });

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/api/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/api/tasks?projectId=${id}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleComplete = async () => {
    try {
      const deliverables = completionData.deliverables.split(',').map(d => d.trim()).filter(d => d);
      await api.post(`/api/projects/${id}/complete`, {
        totalHours: parseInt(completionData.totalHours),
        deliverables,
        outcome: completionData.outcome,
      });
      fetchProject();
      setCompleteDialogOpen(false);
    } catch (error) {
      console.error('Error completing project:', error);
      alert('Error completing project: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return <Typography>Project not found</Typography>;
  }

  const profitLoss = (project.revenueReceived || 0) - (project.actualExpenses || 0);

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/projects')}
        sx={{ mb: 2 }}
      >
        Back to Projects
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {project.name}
            </Typography>
            <Chip label={project.status} sx={{ mb: 2 }} />
          </Box>
          {project.status !== 'Closed' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => setCompleteDialogOpen(true)}
            >
              Mark as Complete
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>Project ID:</strong> {project.projectId}
            </Typography>
            <Typography variant="body1">
              <strong>Client:</strong> {project.client?.name || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Category:</strong> {project.category}
            </Typography>
            <Typography variant="body1">
              <strong>Project Lead:</strong> {project.projectLead?.name || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>Start Date:</strong>{' '}
              {new Date(project.startDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              <strong>End Date:</strong>{' '}
              {new Date(project.endDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              <strong>Estimated Budget:</strong> ${project.estimatedBudget?.toLocaleString()}
            </Typography>
            <Typography variant="body1">
              <strong>Actual Expenses:</strong> ${project.actualExpenses?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body1">
              <strong>Revenue Received:</strong> ${project.revenueReceived?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body1" color={profitLoss >= 0 ? 'success.main' : 'error.main'}>
              <strong>Profit/Loss:</strong> ${profitLoss.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        {project.completionSummary && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Completion Summary
            </Typography>
            <Typography variant="body2">
              <strong>Total Hours:</strong> {project.completionSummary.totalHours}
            </Typography>
            <Typography variant="body2">
              <strong>Deliverables:</strong> {project.completionSummary.deliverables?.join(', ')}
            </Typography>
            <Typography variant="body2">
              <strong>Outcome:</strong> {project.completionSummary.outcome}
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Tasks ({tasks.length})
        </Typography>
        {tasks.length === 0 ? (
          <Typography color="textSecondary">No tasks found</Typography>
        ) : (
          <List>
            {tasks.map((task) => (
              <ListItem
                key={task._id}
                button
                onClick={() => navigate(`/tasks?taskId=${task._id}`)}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={task.title}
                  secondary={`Assigned to: ${task.assignedTo?.name} • Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                  secondaryTypographyProps={{ component: 'div' }}
                />
                <Chip label={task.status} size="small" sx={{ ml: 'auto' }} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Total Hours"
            type="number"
            value={completionData.totalHours}
            onChange={(e) => setCompletionData({ ...completionData, totalHours: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Deliverables (comma-separated)"
            value={completionData.deliverables}
            onChange={(e) => setCompletionData({ ...completionData, deliverables: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Outcome"
            value={completionData.outcome}
            onChange={(e) => setCompletionData({ ...completionData, outcome: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleComplete} variant="contained">
            Complete Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

