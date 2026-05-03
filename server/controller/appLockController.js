import User from '../models/userModel.js';
import Task from '../models/taskModel.js';
import UnlockOtp from '../models/unlockOtpModel.js';
import AppLockSession from '../models/appLockSessionModel.js';
import AppLockPolicy from '../models/appLockPolicyModel.js';
import { sendOtp } from '../utils/sendOtp.js';
import { setDeviceAppCatalog, getDeviceAppCatalog } from '../utils/deviceAppCatalogStore.js';

const OTP_VALIDITY_MS = 5 * 60 * 1000;
const DEFAULT_UNLOCK_MINUTES = Number(process.env.APP_UNLOCK_MINUTES || 30);

const isTaskCompleted = (task) => {
  const status = String(task?.status || '').toLowerCase();
  return status === 'completed' || status === 'complete';
};

export const requestUnlockOtp = async (req, res) => {
  try {
    const { userId, taskId } = req.body;

    if (!userId || !taskId) {
      return res.status(400).json({ message: 'userId and taskId are required' });
    }

    const [user, task] = await Promise.all([
      User.findById(userId),
      Task.findOne({ _id: taskId, userId }),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!task) {
      return res.status(404).json({ message: 'Task not found for this user' });
    }

    if (!isTaskCompleted(task)) {
      return res.status(403).json({
        message: 'Unlock OTP is only available after completing the selected task',
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + OTP_VALIDITY_MS);

    await UnlockOtp.deleteMany({ userId, taskId });
    await UnlockOtp.create({
      userId,
      taskId,
      email: user.email,
      otp,
      expiresAt,
    });

    await sendOtp(user.email, otp);

    return res.status(200).json({
      message: 'Unlock OTP sent successfully',
      otpExpiresInSeconds: OTP_VALIDITY_MS / 1000,
      expiresAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyUnlockOtp = async (req, res) => {
  try {
    const { userId, taskId, otp } = req.body;

    if (!userId || !taskId || otp === undefined || otp === null || otp === '') {
      return res.status(400).json({ message: 'userId, taskId, and otp are required' });
    }

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found for this user' });
    }

    if (!isTaskCompleted(task)) {
      return res.status(403).json({
        message: 'Task is not completed yet. OTP verification is locked.',
      });
    }

    const otpRecord = await UnlockOtp.findOne({ userId, taskId, otp: String(otp).trim() });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await UnlockOtp.deleteMany({ userId, taskId });
      return res.status(400).json({ message: 'OTP expired' });
    }

    const unlockedUntil = new Date(Date.now() + DEFAULT_UNLOCK_MINUTES * 60 * 1000);
    await AppLockSession.create({
      userId,
      taskId,
      unlockedUntil,
      isActive: true,
    });

    await UnlockOtp.deleteMany({ userId, taskId });

    return res.status(200).json({
      message: 'App lock unlocked successfully',
      isUnlocked: true,
      unlockedUntil,
      unlockMinutes: DEFAULT_UNLOCK_MINUTES,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getLockStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const now = new Date();
    const activeSession = await AppLockSession.findOne({
      userId,
      isActive: true,
      unlockedUntil: { $gt: now },
    })
      .sort({ unlockedUntil: -1 })
      .select('taskId unlockedUntil');

    if (!activeSession) {
      return res.status(200).json({
        isUnlocked: false,
        unlockedUntil: null,
      });
    }

    return res.status(200).json({
      isUnlocked: true,
      unlockedUntil: activeSession.unlockedUntil,
      taskId: activeSession.taskId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getLockPolicy = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const policy = await AppLockPolicy.findOne({ userId }).select('isEnabled blockedApps');
    if (!policy) {
      return res.status(200).json({
        isEnabled: true,
        blockedApps: [],
      });
    }

    return res.status(200).json(policy);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const upsertLockPolicy = async (req, res) => {
  try {
    const { userId, blockedApps = [], isEnabled = true } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const cleanedApps = Array.isArray(blockedApps)
      ? [...new Set(blockedApps.map((app) => String(app).trim()).filter(Boolean))]
      : [];

    const policy = await AppLockPolicy.findOneAndUpdate(
      { userId },
      {
        userId,
        isEnabled: Boolean(isEnabled),
        blockedApps: cleanedApps,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select('isEnabled blockedApps');

    return res.status(200).json({
      message: 'App lock policy saved',
      policy,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getLockDecision = async (req, res) => {
  try {
    const { userId, packageName } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const now = new Date();
    const activeTask = await Task.findOne({
      userId,
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).sort({ startTime: 1 });

    if (!activeTask) {
      return res.status(200).json({
        shouldLock: false,
        reason: 'outside_task_window',
      });
    }

    const policy = await AppLockPolicy.findOne({ userId }).select('isEnabled blockedApps');

    const useCustomTaskLock = activeTask.useCustomTaskLock === true;
    const taskLockApps = Array.isArray(activeTask.lockedAppsDuringTask)
      ? activeTask.lockedAppsDuringTask.map((a) => String(a).trim()).filter(Boolean)
      : [];

    let effectiveBlockedApps;
    if (useCustomTaskLock) {
      effectiveBlockedApps = [...new Set(taskLockApps)];
    } else {
      if (policy && !policy.isEnabled) {
        return res.status(200).json({
          shouldLock: false,
          reason: 'policy_disabled',
        });
      }
      effectiveBlockedApps = [...new Set((policy?.blockedApps || []).map((a) => String(a).trim()).filter(Boolean))];
    }

    if (packageName) {
      const isBlocked = effectiveBlockedApps.includes(String(packageName).trim());
      if (!isBlocked) {
        return res.status(200).json({
          shouldLock: false,
          reason: 'app_not_blocked',
        });
      }
    }

    if (!isTaskCompleted(activeTask)) {
      return res.status(200).json({
        shouldLock: true,
        reason: 'task_in_progress',
        taskId: activeTask._id,
        taskTitle: activeTask.title,
      });
    }

    const unlockSession = await AppLockSession.findOne({
      userId,
      taskId: activeTask._id,
      isActive: true,
      unlockedUntil: { $gt: now },
    }).sort({ unlockedUntil: -1 });

    if (unlockSession) {
      return res.status(200).json({
        shouldLock: false,
        reason: 'otp_verified_unlocked',
        unlockedUntil: unlockSession.unlockedUntil,
      });
    }

    return res.status(200).json({
      shouldLock: true,
      reason: 'otp_required_after_completion',
      taskId: activeTask._id,
      taskTitle: activeTask.title,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/** Android client uploads launchable apps so the web Create Task form can show the real device list. */
export const postDeviceAppsCatalog = async (req, res) => {
  try {
    const { userId, apps } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    if (!Array.isArray(apps)) {
      return res.status(400).json({ message: 'apps must be an array' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const seen = new Set();
    const cleaned = [];
    for (const item of apps) {
      const pkg = String(item?.packageName || item?.package || '').trim();
      if (!pkg || seen.has(pkg)) continue;
      seen.add(pkg);
      const name = String(item?.name || item?.label || item?.appName || pkg).trim() || pkg;
      cleaned.push({ packageName: pkg, name });
    }

    setDeviceAppCatalog(userId, cleaned);
    return res.status(200).json({
      message: 'Device app catalog updated',
      count: cleaned.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getDeviceAppsCatalog = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cat = getDeviceAppCatalog(userId);
    return res.status(200).json({
      apps: cat?.apps || [],
      syncedAt: cat?.syncedAt || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
