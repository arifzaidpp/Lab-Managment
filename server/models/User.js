import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  admissionNumber: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  imagePublicId: {
    type: String,
    default: '',
  },
  totalUsage: {
    type: Number,
    default: 0,
  },
  totalCompensation: {
    type: Number,
    default: 0,
  },
  creditBalance: {
    type: Number,
    default: 0,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  lastLoginLab: {
    type: String,
    default: null,
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export default mongoose.model('User', userSchema);