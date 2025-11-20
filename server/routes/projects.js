const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Client = require('../models/Client');
const User = require('../models/User');
const { auth, requirePermission } = require('../middleware/auth');
const { populateReferences, populateArrayReferences } = require('../utils/populate');

const router = express.Router();

// Get all projects
router.get('/', auth, requirePermission('projects.view'), async (req, res) => {
  try {
    const { clientId, status } = req.query;
    const query = {};
    if (clientId) query.client = clientId;
    if (status) query.status = status;

    let projects = await Project.find(query);
    projects = await populateReferences(projects, 'client', Client, ['name', 'clientId']);
    projects = await populateReferences(projects, 'projectLead', User, ['name', 'email']);
    projects = await populateArrayReferences(projects, 'teamMembers', User, ['name', 'email', 'department']);
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/:id', auth, requirePermission('projects.view'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    let populated = await populateReferences([project], 'client', Client, ['name', 'clientId', 'contactInfo']);
    populated = await populateReferences(populated, 'projectLead', User, ['name', 'email']);
    populated = await populateArrayReferences(populated, 'teamMembers', User, ['name', 'email', 'department']);
    
    res.json(populated[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create project
router.post('/', auth, requirePermission('projects.manage'), async (req, res) => {
  try {
    const project = await Project.create(req.body);
    let populated = await populateReferences([project], 'client', Client, ['name', 'clientId']);
    populated = await populateReferences(populated, 'projectLead', User, ['name', 'email']);
    res.status(201).json(populated[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update project
router.put('/:id', auth, requirePermission('projects.manage'), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    let populated = await populateReferences([project], 'client', Client, ['name', 'clientId']);
    populated = await populateReferences(populated, 'projectLead', User, ['name', 'email']);
    populated = await populateArrayReferences(populated, 'teamMembers', User, ['name', 'email', 'department']);
    
    res.json(populated[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Complete project
router.post('/:id/complete', auth, requirePermission('projects.manage'), async (req, res) => {
  try {
    const { totalHours, deliverables, outcome } = req.body;
    const project = await Project.findByIdAndUpdate(req.params.id, {
      status: 'Closed',
      completionSummary: {
        totalHours,
        deliverables,
        outcome,
        completedAt: new Date().toISOString(),
      },
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const populated = await populateReferences([project], 'client', Client, ['name', 'clientId']);
    res.json(populated[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete project
router.delete('/:id', auth, requirePermission('projects.manage'), async (req, res) => {
  try {
    await Task.deleteMany({ project: req.params.id });
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
