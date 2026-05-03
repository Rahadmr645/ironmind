import dotenv from 'dotenv';
dotenv.config();
import JWT from 'jsonwebtoken';
import User from '../models/userModel.js';
import Otp from '../models/otpModel.js';
import { sendOtp } from '../utils/sendOtp.js';

const SECTRATE_KEY = process.env.SECTRATE_KEY;
const OTP_VALIDITY_MS = 2 * 60 * 1000;

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || otp === undefined || otp === null || otp === '') {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpStr = String(otp).trim();
    const record = await Otp.findOne({ email, otp: otpStr });

    if (!record) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ message: 'OTP expired' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    await Otp.deleteMany({ email });
    user.isVerified = true;
    await user.save();

    const token = JWT.sign(
      { id: String(user._id), email: user.email, username: user.username },
      SECTRATE_KEY,
      { expiresIn: '1d' }
    );

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: 'Email verified successfully',
      user: userObj,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + OTP_VALIDITY_MS);
    await Otp.deleteMany({ email });
    await Otp.create({
      email,
      otp,
      expiresAt,
    });

    await sendOtp(email, otp);

    return res.status(200).json({
      message: 'OTP resent successfully',
      expiresAt,
      otpExpiresInSeconds: OTP_VALIDITY_MS / 1000,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const otpStatus = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const record = await Otp.findOne({ email }).sort({ expiresAt: -1 });
    if (!record) {
      return res.status(200).json({
        hasActiveOtp: false,
        remainingSeconds: 0,
      });
    }

    const remainingMs = record.expiresAt.getTime() - Date.now();
    if (remainingMs <= 0) {
      await Otp.deleteMany({ email });
      return res.status(200).json({
        hasActiveOtp: false,
        remainingSeconds: 0,
      });
    }

    return res.status(200).json({
      hasActiveOtp: true,
      remainingSeconds: Math.ceil(remainingMs / 1000),
      expiresAt: record.expiresAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
