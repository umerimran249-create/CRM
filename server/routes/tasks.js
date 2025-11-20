const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { auth, requirePermission } = require('../middleware/auth');
const { populateReferences } = require('../utils/populate');

// Helper to populate nested arrays
async function populateTaskArrays(task) {
  if (task.internalNotes && Array.isArray(task.internalNotes)) {
    for (let i = 0; i < task.internalNotes.length; i++) {
      if (task.internalNotes[i].author) {
        const author = await User.findById(task.internalNotes[i].author);
        if (author) {
          task.internalNotes[i].author = { name: author.name, email: author.email };
        }
      }
    }
  }
  
  if (task.activityLog && Array.isArray(task.activityLog)) {
    for (let i = 0; i < task.activityLog.length; i++) {
      if (task.activityLog[i].user) {
        const user = await User.findById(task.activityLog[i].user);
        if (user) {
          task.activityLog[i].user = { name: user.name, email: user.email };
        }
      }
    }
  }
  
  return task;
}

const router = express.Router();

// Get all tasks
router.get('/', auth, requirePermission('tasks.view'), async (req, res) => {
  try {
    const { projectId, assignedTo, status } = req.query;
    let query = {};
    if (projectId) query.project = projectId;
    if (assignedTo) query.assignedTo = assignedTo;
    if (status) query.status = status;

    let tasks = await Task.find(query);
    tasks = await populateReferences(tasks, 'project', Project, ['name', 'projectId']);
    tasks = await populateReferences(tasks, 'assignedTo', User, ['name', 'email', 'department']);
    
    // Populate nested arrays
    for (let i = 0; i < tasks.length; i++) {
      tasks[i] = await populateTaskArrays(tasks[i]);
    }
    
    // Filter tasks based on user role and department
    // Admin and Project Managers see all tasks
    if (req.user.role === 'Admin' || req.user.role === 'Project Manager') {
      return res.json(tasks);
    }
    
    // Team Members see:
    // 1. Tasks assigned to them
    // 2. Tasks assigned to others in their department
    const userDepartment = req.user.department;
    const filteredTasks = tasks.filter(task => {
      if (!task.assignedTo) return false;
      
      // Handle both populated object and ID string
      const assignedToId = task.assignedTo._id || task.assignedTo;
      const assignedToDept = task.assignedTo.department;
      
      // Task assigned to current user
      if (assignedToId === req.user._id) {
        return true;
      }
      
      // Task assigned to someone in the same department
      if (assignedToDept && assignedToDept === userDepartment) {
        return true;
      }
      
      return false;
    });
    
    res.json(filteredTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch tasks' });
  }
});

// Get single task
router.get('/:id', auth, requirePermission('tasks.view'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    let populated = await populateReferences([task], 'project', Project, ['name', 'projectId']);
    populated = await populateReferences(populated, 'assignedTo', User, ['name', 'email', 'department']);
    populated[0] = await populateTaskArrays(populated[0]);
    
    res.json(populated[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task
router.post('/', auth, requirePermission('tasks.manage'), async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      activityLog: [{
        action: 'Task created',
        user: req.user._id,
        timestamp: new Date().toISOString(),
      }],
    };
    
    const task = await Task.create(taskData);
    let populated = await populateReferences([task], 'project', Project, ['name', 'projectId']);
    populated = await populateReferences(populated, 'assignedTo', User, ['name', 'email']);
    populated[0] = await populateTaskArrays(populated[0]);
    
    res.status(201).json(populated[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.put('/:id', auth, requirePermission('tasks.manage'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldStatus = task.status;
    const updates = { ...req.body };
    
    // Parse arrays if they're strings
    if (typeof task.activityLog === 'string') {
      try {
        task.activityLog = JSON.parse(task.activityLog);
      } catch (e) {
        task.activityLog = [];
      }
    }
    if (typeof task.internalNotes === 'string') {
      try {
        task.internalNotes = JSON.parse(task.internalNotes);
      } catch (e) {
        task.internalNotes = [];
      }
    }
    if (typeof task.deliverables === 'string') {
      try {
        task.deliverables = JSON.parse(task.deliverables);
      } catch (e) {
        task.deliverables = [];
      }
    }
    
    // Log status changes
    if (updates.status && updates.status !== oldStatus) {
      if (!task.activityLog) task.activityLog = [];
      task.activityLog.push({
        action: `Status changed from ${oldStatus} to ${updates.status}`,
        user: req.user._id,
        timestamp: new Date().toISOString(),
      });
      updates.activityLog = task.activityLog;
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, updates);
    let populated = await populateReferences([updated], 'project', Project, ['name', 'projectId']);
    populated = await populateReferences(populated, 'assignedTo', User, ['name', 'email']);
    populated[0] = await populateTaskArrays(populated[0]);
    
    res.json(populated[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add note to task
router.post('/:id/notes', auth, requirePermission('tasks.manage'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Parse internalNotes if it's a string
    let internalNotes = task.internalNotes;
    if (typeof internalNotes === 'string') {
      try {
        internalNotes = JSON.parse(internalNotes);
      } catch (e) {
        internalNotes = [];
      }
    }
    if (!Array.isArray(internalNotes)) internalNotes = [];

    internalNotes.push({
      note: req.body.note,
      author: req.user._id,
      createdAt: new Date().toISOString(),
    });
    
    // Parse activityLog if it's a string
    let activityLog = task.activityLog;
    if (typeof activityLog === 'string') {
      try {
        activityLog = JSON.parse(activityLog);
      } catch (e) {
        activityLog = [];
      }
    }
    if (!Array.isArray(activityLog)) activityLog = [];
    
    activityLog.push({
      action: 'Note added',
      user: req.user._id,
      timestamp: new Date().toISOString(),
    });

    const updated = await Task.findByIdAndUpdate(req.params.id, {
      internalNotes,
      activityLog,
    });
    
    const populated = await populateTaskArrays(updated);

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload deliverable
router.post('/:id/deliverables', auth, requirePermission('tasks.manage'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Parse deliverables if it's a string
    let deliverables = task.deliverables;
    if (typeof deliverables === 'string') {
      try {
        deliverables = JSON.parse(deliverables);
      } catch (e) {
        deliverables = [];
      }
    }
    if (!Array.isArray(deliverables)) deliverables = [];

    const version = deliverables.length + 1;
    deliverables.push({
      filename: req.body.filename,
      url: req.body.url,
      version,
      status: req.body.status || 'Draft',
      uploadedAt: new Date().toISOString(),
    });

    // Parse activityLog if it's a string
    let activityLog = task.activityLog;
    if (typeof activityLog === 'string') {
      try {
        activityLog = JSON.parse(activityLog);
      } catch (e) {
        activityLog = [];
      }
    }
    if (!Array.isArray(activityLog)) activityLog = [];

    activityLog.push({
      action: `Deliverable uploaded: ${req.body.filename}`,
      user: req.user._id,
      timestamp: new Date().toISOString(),
    });

    const updated = await Task.findByIdAndUpdate(req.params.id, {
      deliverables,
      activityLog,
    });
    
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', auth, requirePermission('tasks.manage'), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
