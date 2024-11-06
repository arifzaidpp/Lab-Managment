import express from 'express';
import Credit from '../models/Credit.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all credits (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { page = 1, limit = 20, userId } = req.query;
    const query = userId ? { userId } : {};

    const credits = await Credit.find(query)
      .sort('-date')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name admissionNumber');

    const total = await Credit.countDocuments(query);

    res.json({
      credits,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user credits
router.get('/user/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { page = 1, limit = 20 } = req.query;

    const credits = await Credit.find({ userId: req.params.userId })
      .sort('-date')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Credit.countDocuments({ userId: req.params.userId });

    res.json({
      credits,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add credit (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId, amount, notes } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const credit = new Credit({
      userId,
      amount,
      date: new Date(),
      notes
    });

    await credit.save();

    // Update user's credit balance
    user.creditBalance += amount;
    await user.save();

    res.status(201).json(credit);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update credit (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const credit = await Credit.findById(req.params.id);
    if (!credit) {
      return res.status(404).json({ message: 'Credit not found' });
    }

    const user = await User.findById(credit.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Adjust user's credit balance
    const oldAmount = credit.amount;
    const newAmount = req.body.amount || oldAmount;
    user.creditBalance = user.creditBalance - oldAmount + newAmount;
    await user.save();

    // Update credit
    const updatedCredit = await Credit.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedCredit);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete credit (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const credit = await Credit.findById(req.params.id);
    if (!credit) {
      return res.status(404).json({ message: 'Credit not found' });
    }

    // Update user's credit balance
    const user = await User.findById(credit.userId);
    if (user) {
      user.creditBalance -= credit.amount;
      await user.save();
    }

    await Credit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Credit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get credit statistics (admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const stats = await Credit.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCredits: { $sum: '$amount' },
          averageCredit: { $avg: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(stats[0] || { totalCredits: 0, averageCredit: 0, count: 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;