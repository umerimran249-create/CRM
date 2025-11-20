const express = require('express');
const Client = require('../models/Client');
const User = require('../models/User');
const { auth, requirePermission } = require('../middleware/auth');
const { populateReferences } = require('../utils/populate');

const router = express.Router();

// Get all clients
router.get('/', auth, requirePermission('clients.view'), async (req, res) => {
  try {
    let clients = await Client.find();
    clients = await populateReferences(clients, 'accountManager', User, ['name', 'email']);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single client
router.get('/:id', auth, requirePermission('clients.view'), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    const populated = await populateReferences([client], 'accountManager', User, ['name', 'email']);
    res.json(populated[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create client
router.post('/', auth, requirePermission('clients.manage'), async (req, res) => {
  try {
    const client = await Client.create(req.body);
    const populated = await populateReferences([client], 'accountManager', User, ['name', 'email']);
    res.status(201).json(populated[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update client
router.put('/:id', auth, requirePermission('clients.manage'), async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    const populated = await populateReferences([client], 'accountManager', User, ['name', 'email']);
    res.json(populated[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete client
router.delete('/:id', auth, requirePermission('clients.manage'), async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
