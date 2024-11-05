import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  labId: {
    type: String,
    required: true,
  },
  admissionNumber: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    default: null,
  },
  duration: {
    type: Number,
    default: 0,
  },
  compensation: {
    type: Number,
    default: 0,
  },
  inactivityCount: {
    type: Number,
    default: 0,
  },
  lastActivityTime: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Index for efficient querying
sessionSchema.index({ userId: 1, startTime: -1 });
sessionSchema.index({ labId: 1, startTime: -1 });
sessionSchema.index({ admissionNumber: 1 });

export default mongoose.model('Session', sessionSchema);