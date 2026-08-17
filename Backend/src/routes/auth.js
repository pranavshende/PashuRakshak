const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number is already registered.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: role || 'FARMER'
      }
    });

    res.status(201).json({
      message: 'User registered successfully.',
      user_id: newUser.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Login Route using Passport Local Strategy
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info.message || 'Authentication failed.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Record login activity
    prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    }).catch(e => console.error('Failed to log login activity:', e));

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
  })(req, res, next);
});

const { requireAuth } = require('../middlewares/authMiddleware');

// Get Current User Profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        id: true, 
        name: true, 
        phone: true, 
        role: true, 
        email: true, 
        farmName: true, 
        language: true, 
        notificationsEnabled: true 
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update Profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, phone, email, farmName, language, notificationsEnabled } = req.body;
    
    // Check if phone belongs to another user
    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ error: 'Phone number already in use by another account.' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        ...(name !== undefined && { name }), 
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(farmName !== undefined && { farmName }),
        ...(language !== undefined && { language }),
        ...(notificationsEnabled !== undefined && { notificationsEnabled })
      },
      select: { 
        id: true, 
        name: true, 
        phone: true, 
        role: true, 
        email: true, 
        farmName: true, 
        language: true, 
        notificationsEnabled: true 
      }
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Logout Route
router.post('/logout', requireAuth, async (req, res) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'LOGOUT',
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    });
    res.json({ success: true, message: 'Logged out and activity recorded.' });
  } catch (error) {
    console.error('Logout activity logging error:', error);
    res.status(500).json({ error: 'Failed to record logout activity.' });
  }
});

module.exports = router;
