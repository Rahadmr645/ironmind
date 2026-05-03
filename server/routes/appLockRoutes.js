import express from 'express';
import {
  getLockDecision,
  getLockPolicy,
  getLockStatus,
  getDeviceAppsCatalog,
  postDeviceAppsCatalog,
  requestUnlockOtp,
  upsertLockPolicy,
  verifyUnlockOtp,
} from '../controller/appLockController.js';

const router = express.Router();

router.post('/request-otp', requestUnlockOtp);
router.post('/verify-otp', verifyUnlockOtp);
router.get('/status/:userId', getLockStatus);
router.get('/policy/:userId', getLockPolicy);
router.put('/policy', upsertLockPolicy);
router.post('/decision', getLockDecision);
router.post('/device-apps', postDeviceAppsCatalog);
router.get('/device-apps/:userId', getDeviceAppsCatalog);

export default router;
