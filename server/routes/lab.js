import express from 'express';
import Lab from '../models/Lab.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Initialize or get lab
router.post('/initialize', async (req, res) => {
  try {
    const { labId } = req.body;
    
    let lab = await Lab.findOne({ labId });
    
    if (!lab) {
      lab = new Lab({
        labId,
        name: labId,
        lastActive: new Date()
      });
      await lab.save();
    } else {
      lab.lastActive = new Date();
      await lab.save();
    }
    
    res.json(lab);
  } catch (error) {
    console.error('Lab initialization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get lab status
router.get('/:labId', auth, async (req, res) => {
  try {
    const lab = await Lab.findOne({ labId: req.params.labId });
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    res.json(lab);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update lab status (admin only)
router.put('/:labId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const lab = await Lab.findOneAndUpdate(
      { labId: req.params.labId },
      { $set: req.body },
      { new: true }
    );

    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    res.json(lab);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;