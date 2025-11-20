const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getPermissionsForRole, hasPermission } = require('../constants/permissions');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || (user.isActive !== true && user.isActive !== 'true')) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    if (!user.permissions || !user.permissions.length) {
      user.permissions = getPermissionsForRole(user.role);
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    
    next();
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ message: 'Access denied. Missing permission.' });
    }
    next();
  };
};

module.exports = { auth, authorize, requirePermission, JWT_SECRET };

