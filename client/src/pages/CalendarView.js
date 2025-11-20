import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import 'moment/locale/en-gb';

moment.locale('en-gb');
const localizer = momentLocalizer(moment);

export default function CalendarView() {
  const { user, hasPermission } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [financeEntries, setFinanceEntries] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    assignedTo: '',
    color: '#1976d2',
  });

  useEffect(() => {
    fetchData();
    fetchTeamMembers();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes, financeRes, calendarRes] = await Promise.all([
        api.get('/api/tasks'),
        api.get('/api/projects'),
        api.get('/api/finance'),
        api.get('/api/calendar'),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setFinanceEntries(financeRes.data);
      setCalendarEvents(calendarRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/api/team');
      setTeamMembers(response.data.filter(m => m._id !== user?.id));
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });
    setSelectedEvent(null);
    setError('');
    setEventForm({
      title: '',
      description: '',
      startDate: moment(start).format('YYYY-MM-DDTHH:mm'),
      endDate: moment(end).format('YYYY-MM-DDTHH:mm'),
      assignedTo: '',
      color: '#1976d2',
    });
    setOpenDialog(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setError('');
    
    if (event.resource?.type === 'calendar') {
      const calEvent = event.resource.data;
      setEventForm({
        title: calEvent.title || '',
        description: calEvent.description || '',
        startDate: moment(calEvent.startDate).format('YYYY-MM-DDTHH:mm'),
        endDate: moment(calEvent.endDate || calEvent.startDate).format('YYYY-MM-DDTHH:mm'),
        assignedTo: calEvent.assignedTo?._id || calEvent.assignedTo || '',
        color: calEvent.color || '#1976d2',
      });
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSlot(null);
    setSelectedEvent(null);
    setError('');
    setEventForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      assignedTo: '',
      color: '#1976d2',
    });
  };

  const handleSaveEvent = async () => {
    setError('');
    
    if (!eventForm.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!eventForm.startDate) {
      setError('Start date is required');
      return;
    }

    try {
      const payload = {
        title: eventForm.title,
        description: eventForm.description,
        startDate: eventForm.startDate,
        endDate: eventForm.endDate || eventForm.startDate,
        color: eventForm.color,
      };

      // Only Admin/PM can assign to others
      if (eventForm.assignedTo && (user?.role === 'Admin' || user?.role === 'Project Manager')) {
        payload.assignedTo = eventForm.assignedTo;
      }

      if (selectedEvent?.resource?.type === 'calendar') {
        // Update existing event
        await api.put(`/api/calendar/${selectedEvent.resource.data._id}`, payload);
      } else {
        // Create new event
        await api.post('/api/calendar', payload);
      }
      
      handleCloseDialog();
      await fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save event');
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent?.resource?.type === 'calendar') {
      try {
        await api.delete(`/api/calendar/${selectedEvent.resource.data._id}`);
        handleCloseDialog();
        await fetchData();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  // Build events array
  const events = [
    // Calendar Events (Personal + Assigned)
    ...calendarEvents.map((calEvent) => ({
      id: `calendar-${calEvent._id}`,
      title: calEvent.assignedTo ? `📅 ${calEvent.title} (Assigned)` : `📅 ${calEvent.title}`,
      start: new Date(calEvent.startDate),
      end: new Date(calEvent.endDate || calEvent.startDate),
      resource: {
        type: 'calendar',
        data: calEvent,
      },
    })),
    // Tasks
    ...tasks.map((task) => ({
      id: `task-${task._id}`,
      title: `📋 ${task.title}`,
      start: new Date(task.dueDate),
      end: new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000),
      resource: { 
        type: 'task', 
        data: task,
        priority: task.priority,
        status: task.status,
      },
    })),
    // Project Start Dates
    ...projects.map((project) => ({
      id: `project-start-${project._id}`,
      title: `🚀 ${project.name} - Start`,
      start: new Date(project.startDate),
      end: new Date(new Date(project.startDate).getTime() + 60 * 60 * 1000),
      resource: { 
        type: 'project-start', 
        data: project,
        status: project.status,
      },
    })),
    // Project End Dates / Deadlines
    ...projects.map((project) => ({
      id: `project-end-${project._id}`,
      title: `⏰ ${project.name} - Deadline`,
      start: new Date(project.endDate),
      end: new Date(new Date(project.endDate).getTime() + 60 * 60 * 1000),
      resource: { 
        type: 'project-deadline', 
        data: project,
        status: project.status,
      },
    })),
    // Payment Deadlines
    ...financeEntries
      .filter(entry => entry.type === 'Revenue' && entry.paymentDeadline)
      .map((entry) => ({
        id: `payment-${entry._id}`,
        title: `💰 Payment Due: ${entry.project?.name || 'Unknown'}`,
        start: new Date(entry.paymentDeadline),
        end: new Date(new Date(entry.paymentDeadline).getTime() + 60 * 60 * 1000),
        resource: { 
          type: 'payment', 
          data: entry,
          amount: entry.amount,
          isPaid: entry.isPaid,
        },
      })),
  ];

  const eventStyleGetter = (event) => {
    const type = event.resource?.type;
    let backgroundColor = '#1976d2';
    let borderColor = '#1565c0';

    switch (type) {
      case 'calendar':
        backgroundColor = event.resource.data.color || '#1976d2';
        borderColor = event.resource.data.color || '#1565c0';
        break;
      case 'task':
        backgroundColor = event.resource.priority === 'Urgent' ? '#d32f2f' :
                         event.resource.priority === 'High' ? '#f57c00' :
                         event.resource.priority === 'Medium' ? '#1976d2' : '#388e3c';
        break;
      case 'project-start':
        backgroundColor = '#00acc1';
        borderColor = '#00838f';
        break;
      case 'project-deadline':
        backgroundColor = '#e91e63';
        borderColor = '#c2185b';
        break;
      case 'payment':
        backgroundColor = event.resource.isPaid === 'true' || event.resource.isPaid === true ? '#4caf50' : '#ff9800';
        borderColor = event.resource.isPaid === 'true' || event.resource.isPaid === true ? '#388e3c' : '#f57c00';
        break;
      default:
        backgroundColor = '#9e9e9e';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: `2px solid ${borderColor}`,
        display: 'block',
        padding: '2px 4px',
        fontSize: '0.85rem',
      },
    };
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Calendar View</Typography>
        <Box>
          <Chip label="📅 Calendar Events" sx={{ mr: 1, bgcolor: '#1976d2', color: 'white' }} />
          <Chip label="📋 Tasks" sx={{ mr: 1, bgcolor: '#1976d2', color: 'white' }} />
          <Chip label="🚀 Project Start" sx={{ mr: 1, bgcolor: '#00acc1', color: 'white' }} />
          <Chip label="⏰ Project Deadline" sx={{ mr: 1, bgcolor: '#e91e63', color: 'white' }} />
          <Chip label="💰 Payment Due" sx={{ mr: 1, bgcolor: '#ff9800', color: 'white' }} />
        </Box>
      </Box>

      <Paper sx={{ p: 3, height: '700px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          view={view}
          onView={(newView) => setView(newView)}
          views={['month', 'week', 'day', 'agenda']}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          popup
          showMultiDayTimes
          step={60}
          defaultDate={new Date()}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEvent?.resource?.type === 'calendar' ? 'Edit Calendar Event' : 'Create New Calendar Event'}
          {selectedEvent?.resource?.type === 'calendar' && (
            <IconButton
              onClick={handleDeleteEvent}
              sx={{ position: 'absolute', right: 8, top: 8 }}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Event Title"
            value={eventForm.title}
            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Start Date & Time"
            type="datetime-local"
            value={eventForm.startDate}
            onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            label="End Date & Time"
            type="datetime-local"
            value={eventForm.endDate}
            onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Description"
            value={eventForm.description}
            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          {(user?.role === 'Admin' || user?.role === 'Project Manager') && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Assign To (Optional)</InputLabel>
              <Select
                value={eventForm.assignedTo}
                onChange={(e) => setEventForm({ ...eventForm, assignedTo: e.target.value })}
                input={<OutlinedInput label="Assign To (Optional)" />}
              >
                <MenuItem value="">Personal Event</MenuItem>
                {teamMembers.map((member) => (
                  <MenuItem key={member._id} value={member._id}>
                    {member.name} ({member.department})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Color</InputLabel>
            <Select
              value={eventForm.color}
              onChange={(e) => setEventForm({ ...eventForm, color: e.target.value })}
              input={<OutlinedInput label="Color" />}
            >
              <MenuItem value="#1976d2">Blue</MenuItem>
              <MenuItem value="#d32f2f">Red</MenuItem>
              <MenuItem value="#388e3c">Green</MenuItem>
              <MenuItem value="#f57c00">Orange</MenuItem>
              <MenuItem value="#7b1fa2">Purple</MenuItem>
              <MenuItem value="#0097a7">Cyan</MenuItem>
            </Select>
          </FormControl>
          {selectedEvent && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Event Details:
              </Typography>
              {selectedEvent.resource?.type === 'task' && (
                <Box>
                  <Typography variant="body2">
                    <strong>Status:</strong> {selectedEvent.resource.status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Priority:</strong> {selectedEvent.resource.priority}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Project:</strong> {selectedEvent.resource.data.project?.name || 'N/A'}
                  </Typography>
                </Box>
              )}
              {selectedEvent.resource?.type === 'project-start' && (
                <Box>
                  <Typography variant="body2">
                    <strong>Status:</strong> {selectedEvent.resource.status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Category:</strong> {selectedEvent.resource.data.category}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Budget:</strong> ${selectedEvent.resource.data.estimatedBudget?.toLocaleString()}
                  </Typography>
                </Box>
              )}
              {selectedEvent.resource?.type === 'project-deadline' && (
                <Box>
                  <Typography variant="body2">
                    <strong>Status:</strong> {selectedEvent.resource.status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Category:</strong> {selectedEvent.resource.data.category}
                  </Typography>
                </Box>
              )}
              {selectedEvent.resource?.type === 'payment' && (
                <Box>
                  <Typography variant="body2">
                    <strong>Amount:</strong> ${selectedEvent.resource.amount?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {selectedEvent.resource.isPaid === 'true' || selectedEvent.resource.isPaid === true ? 'Paid' : 'Unpaid'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Project:</strong> {selectedEvent.resource.data.project?.name || 'N/A'}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {selectedEvent?.resource?.type === 'calendar' && (
            <Button onClick={handleSaveEvent} variant="contained">
              Update
            </Button>
          )}
          {selectedEvent?.resource?.type !== 'calendar' && (
            <Button onClick={handleSaveEvent} variant="contained">
              Create
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
