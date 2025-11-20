const express = require('express');
const User = require('../models/User');
const { auth, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Get all team members
router.get('/', auth, requirePermission('team.view'), async (req, res) => {
  try {
    const { department, role } = req.query;
    const query = { isActive: true };
    if (department) query.department = department;
    if (role) query.role = role;

    let members = await User.find(query);
    
    // Remove password field
    members = members.map(member => {
      const { password, ...memberWithoutPassword } = member;
      return memberWithoutPassword;
    });
    
    // Sort by name
    members.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    res.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch team members' });
  }
});

// Get single team member
router.get('/:id', auth, requirePermission('team.view'), async (req, res) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    const { password, ...memberWithoutPassword } = member;
    res.json(memberWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create team member (Admin only)
router.post('/', auth, requirePermission('team.manage'), async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const member = await User.create({
      name,
      email,
      password,
      role: role || 'Team Member',
      department: department || '',
    });

    const { password: _, ...memberWithoutPassword } = member;
    res.status(201).json(memberWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update team member
router.put('/:id', auth, requirePermission('team.manage'), async (req, res) => {
  try {
    const member = await User.findByIdAndUpdate(req.params.id, req.body);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    const { password, ...memberWithoutPassword } = member;
    res.json(memberWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put(
  '/:id/permissions',
  auth,
  requirePermission('admin.manage'),
  async (req, res) => {
    try {
      const permissions = Array.isArray(req.body.permissions) ? req.body.permissions : [];
      const member = await User.findByIdAndUpdate(req.params.id, { permissions });
      if (!member) {
        return res.status(404).json({ message: 'Team member not found' });
      }
      res.json({
        _id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        permissions,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
