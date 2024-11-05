import mongoose from 'mongoose';

const labSchema = new mongoose.Schema({
  labId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: true,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

export default mongoose.model('Lab', labSchema);