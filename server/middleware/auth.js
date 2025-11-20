const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/User');
const { getPermissionsForRole, hasPermission } = require('../constants/permissions');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Ensure Firebase Admin is initialized (it's initialized in services/firebase.js)
// Just import it to trigger initialization
require('../services/firebase');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    let user = null;

    // Try Firebase token first
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      // Find user by email from Firebase token
      user = await User.findOne({ email: decodedToken.email });
      
      if (!user) {
        // Create user if doesn't exist (first time Firebase login)
        user = await User.create({
          name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
          email: decodedToken.email,
          password: '', // No password needed for Firebase auth
          role: 'Team Member', // Default role
          department: '',
        });
      }
    } catch (firebaseError) {
      // If Firebase token fails, try JWT token
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        user = await User.findById(decoded.userId);
      } catch (jwtError) {
        return res.status(401).json({ message: 'Token is not valid' });
      }
    }
    
    if (!user || (user.isActive !== true && user.isActive !== 'true')) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    if (!user.permissions || !user.permissions.length) {
      user.permissions = getPermissionsForRole(user.role);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
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

