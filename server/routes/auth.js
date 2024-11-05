import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.admissionNumber);
    const { admissionNumber, password } = req.body;
    const user = await User.findOne({ admissionNumber });

    if (!user) {
      console.log('User not found:', admissionNumber);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', admissionNumber);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, admissionNumber: user.admissionNumber, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('Login successful for:', admissionNumber);
    res.json({
      token,
      user: {
        id: user._id,
        admissionNumber: user.admissionNumber,
        name: user.name,
        class: user.class,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (admin only)
router.post('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { admissionNumber, name, class: className, password } = req.body;
    
    const existingUser = await User.findOne({ admissionNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      admissionNumber,
      name,
      class: className,
      password,
      role: 'user',
    });

    await user.save();
    console.log('New user created:', admissionNumber);

    res.status(201).json({
      id: user._id,
      admissionNumber: user.admissionNumber,
      name: user.name,
      class: user.class,
      role: user.role,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort('admissionNumber');

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;