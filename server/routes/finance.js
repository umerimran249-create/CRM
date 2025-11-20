const express = require('express');
const FinanceEntry = require('../models/FinanceEntry');
const Project = require('../models/Project');
const User = require('../models/User');
const { auth, requirePermission } = require('../middleware/auth');
const { populateReferences } = require('../utils/populate');

// Helper to filter by date range
function filterByDateRange(items, startDate, endDate) {
  return items.filter(item => {
    const itemDate = new Date(item.date);
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  });
}

const router = express.Router();

// Get all finance entries
router.get('/', auth, requirePermission('finance.view'), async (req, res) => {
  try {
    const { projectId, type, startDate, endDate } = req.query;
    let query = {};
    if (projectId) query.project = projectId;
    if (type) query.type = type;

    let entries = await FinanceEntry.find(query);
    
    // Filter by date range if provided
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      entries = filterByDateRange(entries, start, end);
    }
    
    entries = await populateReferences(entries, 'project', Project, ['name', 'projectId']);
    entries = await populateReferences(entries, 'enteredBy', User, ['name', 'email']);
    
    res.json(entries);
  } catch (error) {
    console.error('Error fetching finance entries:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch finance entries' });
  }
});

// Get single finance entry
router.get('/:id', auth, requirePermission('finance.view'), async (req, res) => {
  try {
    const entry = await FinanceEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Finance entry not found' });
    }
    
    let populated = await populateReferences([entry], 'project', Project, ['name', 'projectId']);
    populated = await populateReferences(populated, 'enteredBy', User, ['name', 'email']);
    
    res.json(populated[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create finance entry
router.post('/', auth, requirePermission('finance.manage'), async (req, res) => {
  try {
    const entry = await FinanceEntry.create({
      ...req.body,
      enteredBy: req.user._id,
    });

    // Update project totals
    const project = await Project.findById(entry.project);
    if (project) {
      const amount = parseFloat(entry.amount) || 0;
      if (entry.type === 'Expense') {
        const currentExpenses = parseFloat(project.actualExpenses) || 0;
        await Project.findByIdAndUpdate(project._id, {
          actualExpenses: currentExpenses + amount,
        });
      } else if (entry.type === 'Revenue') {
        const currentRevenue = parseFloat(project.revenueReceived) || 0;
        await Project.findByIdAndUpdate(project._id, {
          revenueReceived: currentRevenue + amount,
        });
      }
    }

    let populated = await populateReferences([entry], 'project', Project, ['name', 'projectId']);
    populated = await populateReferences(populated, 'enteredBy', User, ['name', 'email']);
    
    res.status(201).json(populated[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update finance entry
router.put('/:id', auth, requirePermission('finance.manage'), async (req, res) => {
  try {
    const entry = await FinanceEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Finance entry not found' });
    }

    const oldAmount = parseFloat(entry.amount) || 0;
    const oldType = entry.type;
    
    const updated = await FinanceEntry.findByIdAndUpdate(req.params.id, req.body);
    const newAmount = parseFloat(updated.amount) || 0;
    const newType = updated.type;

    // Update project totals if amount or type changed
    if (oldAmount !== newAmount || oldType !== newType) {
      const project = await Project.findById(updated.project);
      if (project) {
        let expenses = parseFloat(project.actualExpenses) || 0;
        let revenue = parseFloat(project.revenueReceived) || 0;
        
        // Revert old values
        if (oldType === 'Expense') {
          expenses = Math.max(0, expenses - oldAmount);
        } else {
          revenue = Math.max(0, revenue - oldAmount);
        }
        
        // Apply new values
        if (newType === 'Expense') {
          expenses = expenses + newAmount;
        } else {
          revenue = revenue + newAmount;
        }
        
        await Project.findByIdAndUpdate(project._id, {
          actualExpenses: expenses,
          revenueReceived: revenue,
        });
      }
    }

    let populated = await populateReferences([updated], 'project', Project, ['name', 'projectId']);
    populated = await populateReferences(populated, 'enteredBy', User, ['name', 'email']);
    
    res.json(populated[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete finance entry
router.delete('/:id', auth, requirePermission('finance.manage'), async (req, res) => {
  try {
    const entry = await FinanceEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Finance entry not found' });
    }

    // Update project totals
    const project = await Project.findById(entry.project);
    if (project) {
      const amount = parseFloat(entry.amount) || 0;
      if (entry.type === 'Expense') {
        const expenses = Math.max(0, (parseFloat(project.actualExpenses) || 0) - amount);
        await Project.findByIdAndUpdate(project._id, { actualExpenses: expenses });
      } else {
        const revenue = Math.max(0, (parseFloat(project.revenueReceived) || 0) - amount);
        await Project.findByIdAndUpdate(project._id, { revenueReceived: revenue });
      }
    }

    await FinanceEntry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Finance entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
