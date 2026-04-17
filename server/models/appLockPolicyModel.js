import mongoose from 'mongoose';

const appLockPolicySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    blockedApps: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const AppLockPolicy = mongoose.model('AppLockPolicy', appLockPolicySchema);

export default AppLockPolicy;
