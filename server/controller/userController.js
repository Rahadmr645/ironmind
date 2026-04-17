import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import User from '../models/userModel.js';
import Otp from '../models/otpModel.js';
import { sendOtp } from '../utils/sendOtp.js';

const SECTRATE_KEY = process.env.SECTRATE_KEY;
const OTP_VALIDITY_MS = 2 * 60 * 1000;

export const userCreate = async (req, res) => {
  try {
    const { username, email, password, profilePic } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const isExist = await User.findOne({ email });
    if (isExist) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + OTP_VALIDITY_MS);

    await User.create({
      username,
      email,
      password: hashedPassword,
      profilePic,
      isVerified: false,
    });

    await Otp.deleteMany({ email });
    await Otp.create({
      email,
      otp,
      expiresAt,
    });

    await sendOtp(email, otp);

    return res.status(201).json({
      message: 'OTP sent to your email. Please verify to complete signup.',
      expiresAt,
      otpExpiresInSeconds: OTP_VALIDITY_MS / 1000,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all the fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email with the OTP before logging in.',
      });
    }

    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = JWT.sign(
      { id: user._id, email: user.email, username: user.username },
      SECTRATE_KEY,
      { expiresIn: '1d' }
    );

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: 'User logged in successfully',
      user: userObj,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to log in', error: error.message });
  }
};
