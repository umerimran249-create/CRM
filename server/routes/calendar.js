const express = require('express');
const CalendarEvent = require('../models/CalendarEvent');
const User = require('../models/User');
const { auth, requirePermission } = require('../middleware/auth');
const { populateReferences } = require('../utils/populate');

const router = express.Router();

// Get calendar events for current user
router.get('/', auth, requirePermission('calendar.view'), async (req, res) => {
  try {
    const events = await CalendarEvent.findByUser(req.user._id);
    
    // Populate user references
    const populated = await populateReferences(events, 'createdBy', User, ['name', 'email']);
    const populated2 = await populateReferences(populated, 'assignedTo', User, ['name', 'email']);
    
    res.json(populated2);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch calendar events' });
  }
});

// Get all calendar events (Admin/PM only)
router.get('/all', auth, requirePermission('calendar.manage'), async (req, res) => {
  try {
    const events = await CalendarEvent.find({});
    const populated = await populateReferences(events, 'createdBy', User, ['name', 'email']);
    const populated2 = await populateReferences(populated, 'assignedTo', User, ['name', 'email']);
    res.json(populated2);
  } catch (error) {
    console.error('Error fetching all calendar events:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch calendar events' });
  }
});

// Get single calendar event
router.get('/:id', auth, requirePermission('calendar.view'), async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Calendar event not found' });
    }
    
    // Check if user has access (creator or assigned to)
    if (event.createdBy !== req.user._id && event.assignedTo !== req.user._id) {
      // Check if user is admin or PM
      if (req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const populated = await populateReferences([event], 'createdBy', User, ['name', 'email']);
    const populated2 = await populateReferences(populated, 'assignedTo', User, ['name', 'email']);
    res.json(populated2[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create calendar event
router.post('/', auth, requirePermission('calendar.view'), async (req, res) => {
  try {
    const { title, description, startDate, endDate, assignedTo, color } = req.body;
    
    if (!title || !startDate) {
      return res.status(400).json({ message: 'Title and start date are required' });
    }
    
    const eventData = {
      title,
      description: description || '',
      startDate,
      endDate: endDate || startDate,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      type: assignedTo ? 'assigned' : 'personal',
      color: color || '#1976d2',
    };
    
    // Only Admin/PM can assign events to others
    if (assignedTo && req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
      return res.status(403).json({ message: 'Only Admin and Project Managers can assign events to others' });
    }
    
    const event = await CalendarEvent.create(eventData);
    const populated = await populateReferences([event], 'createdBy', User, ['name', 'email']);
    const populated2 = await populateReferences(populated, 'assignedTo', User, ['name', 'email']);
    
    res.status(201).json(populated2[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update calendar event
router.put('/:id', auth, requirePermission('calendar.view'), async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Calendar event not found' });
    }
    
    // Check if user has permission to edit
    const canEdit = 
      event.createdBy === req.user._id || 
      event.assignedTo === req.user._id ||
      req.user.role === 'Admin' || 
      req.user.role === 'Project Manager';
    
    if (!canEdit) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Only Admin/PM can change assignedTo
    if (req.body.assignedTo && req.body.assignedTo !== event.assignedTo) {
      if (req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
        return res.status(403).json({ message: 'Only Admin and Project Managers can reassign events' });
      }
    }
    
    const updated = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body);
    const populated = await populateReferences([updated], 'createdBy', User, ['name', 'email']);
    const populated2 = await populateReferences(populated, 'assignedTo', User, ['name', 'email']);
    
    res.json(populated2[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete calendar event
router.delete('/:id', auth, requirePermission('calendar.view'), async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Calendar event not found' });
    }
    
    // Check if user has permission to delete
    const canDelete = 
      event.createdBy === req.user._id || 
      req.user.role === 'Admin' || 
      req.user.role === 'Project Manager';
    
    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await CalendarEvent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

