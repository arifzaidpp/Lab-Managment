import express from 'express';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all sessions (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { page = 1, limit = 20, search, startDate, endDate } = req.query;
    const query = {};

    if (search) {
      query.admissionNumber = new RegExp(search, 'i');
    }

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const sessions = await Session.find(query)
      .sort('-startTime')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Session.countDocuments(query);

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start session
router.post('/start', auth, async (req, res) => {
  try {
    const { purpose, labId } = req.body;

    const activeSession = await Session.findOne({
      userId: req.user.id,
      endTime: null,
    });

    if (activeSession) {
      return res.status(400).json({ message: 'Active session already exists' });
    }

    const session = new Session({
      userId: req.user.id,
      labId,
      admissionNumber: req.user.admissionNumber,
      purpose,
      startTime: new Date(),
      lastActivityTime: new Date()
    });

    await session.save();

    // Update user's last login info
    await User.findByIdAndUpdate(req.user.id, {
      lastLoginAt: new Date(),
      lastLoginLab: labId
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update activity timestamp
router.post('/activity', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      userId: req.user.id,
      endTime: null
    });

    if (!session) {
      return res.status(404).json({ message: 'No active session found' });
    }

    session.lastActivityTime = new Date();
    await session.save();

    res.json({ message: 'Activity updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// End session
router.post('/end', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      userId: req.user.id,
      endTime: null,
    });

    if (!session) {
      return res.status(404).json({ message: 'No active session found' });
    }

    const endTime = new Date();
    const duration = Math.min(
      Math.floor((endTime - session.startTime) / (1000 * 60)),
      60
    );
    const compensation = Math.floor(duration / 10);

    session.endTime = endTime;
    session.duration = duration;
    session.compensation = compensation;
    await session.save();

    // Update user's total usage and compensation
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        totalUsage: duration,
        totalCompensation: compensation
      }
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user sessions (admin only)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { page = 1, limit = 20 } = req.query;
    const sessions = await Session.find({ userId: req.params.userId })
      .sort('-startTime')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Session.countDocuments({ userId: req.params.userId });

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;