import express from 'express';
import Session from '../models/Session.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all sessions (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const sessions = await Session.find().sort('-startTime');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start session
router.post('/start', auth, async (req, res) => {
  try {
    const activeSession = await Session.findOne({
      userId: req.user.id,
      endTime: null,
    });

    if (activeSession) {
      return res.status(400).json({ message: 'Active session already exists' });
    }

    const session = new Session({
      userId: req.user.id,
      admissionNumber: req.user.admissionNumber,
      startTime: new Date(),
    });

    await session.save();
    res.json(session);
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

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;