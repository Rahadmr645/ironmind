import express from 'express';
import { userCreate, userLogin } from '../controller/userController.js';
import { otpStatus, resendOtp, verifyOtp } from '../controller/verifyotpcontroller.js';

const router = express.Router();

router.post('/create', userCreate);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/otp-status', otpStatus);
router.post('/login', userLogin);

// // 03: image update
// router.put('/profile-pic', upload.single('image'),  updateProfilePic)


export default router;