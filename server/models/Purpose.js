import mongoose from 'mongoose';

const purposeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export default mongoose.model('Purpose', purposeSchema);