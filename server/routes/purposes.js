import express from 'express';
import Purpose from '../models/Purpose.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all purposes
router.get('/', async (req, res) => {
  try {
    const purposes = await Purpose.find().sort('name');
    res.json(purposes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new purpose (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description } = req.body;
    
    const existingPurpose = await Purpose.findOne({ name });
    if (existingPurpose) {
      return res.status(400).json({ message: 'Purpose already exists' });
    }

    const purpose = new Purpose({
      name,
      description,
      active: true
    });

    await purpose.save();
    res.status(201).json(purpose);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update purpose (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const purpose = await Purpose.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!purpose) {
      return res.status(404).json({ message: 'Purpose not found' });
    }

    res.json(purpose);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete purpose (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const purpose = await Purpose.findById(req.params.id);
    if (!purpose) {
      return res.status(404).json({ message: 'Purpose not found' });
    }

    // Instead of deleting, mark as inactive
    purpose.active = false;
    await purpose.save();

    res.json({ message: 'Purpose deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;